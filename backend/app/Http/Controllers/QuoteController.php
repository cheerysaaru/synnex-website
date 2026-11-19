<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Quotations, invoices and letters for /admin/quotation (owner only).
 *
 * A port of the original quotation app's Node API (server/app.mjs), so the
 * same React app works unchanged. Document data is kept as JSON objects
 * (stdClass, not PHP arrays) so empty objects stay `{}` on the way back.
 * Routes are behind auth:web + admin, and every change also needs the CSRF
 * token (see routes/api.php).
 */
class QuoteController extends Controller
{
    private const TYPES = ['quotation', 'invoice', 'letter'];

    private const STATUSES = [
        'quotation' => ['draft', 'sent', 'accepted', 'declined', 'expired'],
        'invoice' => ['draft', 'sent', 'partial', 'paid', 'cancelled'],
        'letter' => ['draft', 'sent'],
    ];

    private const TABLES = ['customers' => 'quote_customers', 'catalog' => 'quote_catalog'];

    /* ================================================================ helpers */

    private function fail(int $status, string $message, ?array $details = null): never
    {
        $payload = ['error' => $message, 'message' => $message];
        if ($details) {
            $payload['details'] = $details;
        }
        throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json($payload, $status));
    }

    private function ok(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status, ['Cache-Control' => 'no-store'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
    }

    /** Request body as objects (stdClass), so {} and [] keep their meaning. */
    private function body(Request $request): object
    {
        $raw = $request->getContent();
        if ($raw === '' || $raw === null) {
            return new \stdClass();
        }
        $data = json_decode($raw, false, 512);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->fail(400, 'Request body is not valid JSON.');
        }

        return is_object($data) ? $data : new \stdClass();
    }

    private static function isObj(mixed $v): bool
    {
        return $v instanceof \stdClass;
    }

    private static function deepMerge(mixed $base, mixed $over): mixed
    {
        if (! self::isObj($base) || ! self::isObj($over)) {
            return $over;
        }
        $out = clone $base;
        foreach (get_object_vars($over) as $k => $v) {
            $out->{$k} = (self::isObj($v) && isset($base->{$k}) && self::isObj($base->{$k})) ? self::deepMerge($base->{$k}, $v) : $v;
        }

        return $out;
    }

    private static function str(mixed $v, int $max = 500): string
    {
        if ($v === null || is_object($v) || is_array($v)) {
            return '';
        }
        if (is_bool($v)) {
            $v = $v ? 'true' : 'false';
        }

        return mb_substr((string) $v, 0, $max);
    }

    private static function now(): string
    {
        return now('UTC')->format('Y-m-d\TH:i:s.v\Z');
    }

    private static function today(): string
    {
        return now('UTC')->format('Y-m-d');
    }

    private static function addDays(string $iso, mixed $days): string
    {
        return \Carbon\CarbonImmutable::parse($iso.' 00:00:00', 'UTC')->addDays((int) ($days ?: 0))->format('Y-m-d');
    }

    private static function num(mixed $v): float
    {
        if (is_int($v) || is_float($v)) {
            return is_finite((float) $v) ? (float) $v : 0.0;
        }
        if (is_string($v) && preg_match('/^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/', $v, $m)) {
            return (float) $m[0];
        }

        return 0.0;
    }

    private static function round2(float $n): float
    {
        return round($n + PHP_FLOAT_EPSILON, 2);
    }

    /** Same maths as the app (src/lib/calc.ts). */
    public static function computeTotals(object $data): object
    {
        $items = isset($data->items) && is_array($data->items) ? $data->items : [];
        $useDiscount = ! empty($data->columns->discount ?? null);
        $subtotal = 0.0;
        foreach ($items as $it) {
            if (is_object($it) && ($it->kind ?? null) === 'heading') {
                continue;
            }
            $qty = is_object($it) ? ($it->qty ?? null) : null;
            $rate = is_object($it) ? ($it->rate ?? null) : null;
            $disc = is_object($it) ? ($it->discount ?? null) : null;
            $subtotal += self::num($qty) * self::num($rate) - ($useDiscount ? self::num($disc) : 0);
        }
        $subtotal = self::round2($subtotal);
        $d = isset($data->discount) && is_object($data->discount) ? $data->discount : new \stdClass();
        $raw = ($d->mode ?? null) === 'percent' ? ($subtotal * self::num($d->value ?? 0)) / 100 : self::num($d->value ?? 0);
        $discount = self::round2(min($subtotal, $raw));
        $taxable = max(0, $subtotal - $discount);
        $tax = self::round2(($taxable * self::num($data->tax->percent ?? 0)) / 100);
        $total = self::round2($taxable + $tax);
        $paid = self::round2(self::num($data->paid ?? 0));

        return (object) ['subtotal' => $subtotal, 'discount' => $discount, 'tax' => $tax, 'total' => $total, 'paid' => $paid, 'balance' => self::round2($total - $paid)];
    }

    /* ================================================================ storage */

    private function defaults(): object
    {
        static $d = null;

        return $d ??= json_decode(file_get_contents(resource_path('quotes/defaults.json')), false);
    }

    private function storedSettings(): ?object
    {
        $v = DB::table('quote_settings')->where('key', 'app')->value('value');

        return $v ? json_decode($v, false) : null;
    }

    private function settings(): object
    {
        return self::deepMerge($this->defaults(), $this->storedSettings() ?? new \stdClass());
    }

    private function saveSettingsRaw(object $value): void
    {
        DB::table('quote_settings')->updateOrInsert(['key' => 'app'], ['value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION)]);
    }

    private function counters(): object
    {
        $out = new \stdClass();
        foreach (DB::table('quote_counters')->orderBy('key')->get() as $r) {
            $out->{$r->key} = (int) $r->value;
        }

        return $out;
    }

    private function setCounter(string $key, int $value): void
    {
        DB::table('quote_counters')->updateOrInsert(['key' => mb_substr($key, 0, 60)], ['value' => $value]);
    }

    private function nextCounter(string $key): int
    {
        $row = DB::table('quote_counters')->where('key', $key)->lockForUpdate()->first();
        $n = $row ? ((int) $row->value + 1) : 1;
        $this->setCounter($key, $n);

        return $n;
    }

    private function docRow(?object $r): ?object
    {
        if (! $r) {
            return null;
        }

        return (object) [
            'id' => $r->id,
            'type' => $r->type,
            'number' => (string) ($r->number ?? ''),
            'status' => $r->status,
            'customer_name' => (string) ($r->customer_name ?? ''),
            'subject' => (string) ($r->subject ?? ''),
            'issue_date' => (string) ($r->issue_date ?? ''),
            'total' => (float) $r->total,
            'balance' => (float) $r->balance,
            'source_id' => $r->source_id,
            'data' => json_decode($r->data, false) ?? new \stdClass(),
            'created_at' => $r->created_at,
            'updated_at' => $r->updated_at,
        ];
    }

    /** @return array<int, object> */
    private function allDocs(): array
    {
        return DB::table('quote_documents')->orderByDesc('updated_at')->get()->map(fn ($r) => $this->docRow($r))->all();
    }

    private function putDoc(object $row): object
    {
        $exists = DB::table('quote_documents')->where('id', $row->id)->exists();
        $values = [
            'type' => $row->type,
            'number' => $row->number,
            'status' => $row->status,
            'customer_name' => $row->customer_name,
            'subject' => $row->subject,
            'issue_date' => $row->issue_date,
            'total' => (float) $row->total,
            'balance' => (float) $row->balance,
            'source_id' => $row->source_id,
            'data' => json_encode($row->data, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION),
            'updated_at' => $row->updated_at,
        ];
        if ($exists) {
            DB::table('quote_documents')->where('id', $row->id)->update($values);
        } else {
            DB::table('quote_documents')->insert(['id' => $row->id, 'created_at' => $row->created_at] + $values);
        }

        return $this->docRow(DB::table('quote_documents')->where('id', $row->id)->first());
    }

    private function summary(object $d): object
    {
        $s = clone $d;
        unset($s->data);
        $s->dueDate = ($d->data->dueDate ?? null) ?: null;
        $s->customer = (string) ($d->data->customer->name ?? '');

        return $s;
    }

    /* ================================================================ documents */

    private function nextNumber(string $type, ?string $issueDate): string
    {
        $s = $this->settings()->numbering;
        $year = substr($issueDate ?: self::today(), 0, 4);
        $key = ! empty($s->includeYear) ? "{$type}:{$year}" : $type;
        $n = $this->nextCounter($key);
        $prefix = ($s->{$type.'Prefix'} ?? '') ?: strtoupper(substr($type, 0, 3));
        $padded = str_pad((string) $n, ((int) ($s->padding ?? 3)) ?: 3, '0', STR_PAD_LEFT);

        return ! empty($s->includeYear) ? "{$prefix}-{$year}-{$padded}" : "{$prefix}-{$padded}";
    }

    private function sanitiseDoc(string $type, mixed $data): object
    {
        if (! self::isObj($data)) {
            $this->fail(422, 'Document data must be an object.');
        }
        if (strlen(json_encode($data)) > 2_000_000) {
            $this->fail(413, 'Document is too large.');
        }
        if (isset($data->items) && ! is_array($data->items)) {
            $this->fail(422, 'items must be a list.');
        }
        if (count($data->items ?? []) > 500) {
            $this->fail(422, 'A document can have at most 500 rows.');
        }
        $clean = clone $data;
        $clean->type = $type;

        return $clean;
    }

    private function saveDocument(?object $existing, string $type, mixed $data, ?string $status): object
    {
        $clean = $this->sanitiseDoc($type, $data);
        unset($clean->totals);
        $totals = self::computeTotals($clean);
        $st = $status ?: ($existing->status ?? 'draft');
        if (! in_array($st, self::STATUSES[$type], true)) {
            $this->fail(422, 'Status must be one of: '.implode(', ', self::STATUSES[$type]).'.');
        }
        $clean->totals = $totals;

        return $this->putDoc((object) [
            'id' => $existing->id ?? (string) Str::uuid(),
            'type' => $type,
            'number' => self::str($clean->number ?? '', 60),
            'status' => $st,
            'customer_name' => self::str($clean->customer->name ?? '', 200),
            'subject' => self::str($clean->subject ?? '', 300),
            'issue_date' => self::str($clean->issueDate ?? '', 10),
            'total' => $totals->total,
            'balance' => $totals->balance,
            'source_id' => $existing->source_id ?? (isset($clean->sourceId) && is_string($clean->sourceId) ? mb_substr($clean->sourceId, 0, 64) : null),
            'data' => $clean,
            'created_at' => $existing->created_at ?? self::now(),
            'updated_at' => self::now(),
        ]);
    }

    private function createDocument(mixed $type, mixed $data, ?string $status = null): object
    {
        if (! in_array($type, self::TYPES, true)) {
            $this->fail(422, 'type must be one of: '.implode(', ', self::TYPES).'.');
        }
        if (! self::isObj($data)) {
            $data = new \stdClass();
        }

        return DB::transaction(function () use ($type, $data, $status) {
            $s = $this->settings();
            $issueDate = (isset($data->issueDate) && is_string($data->issueDate) && $data->issueDate !== '') ? $data->issueDate : self::today();
            $draft = clone $data;
            $draft->issueDate = $issueDate;
            if (empty($draft->number)) {
                $draft->number = $this->nextNumber($type, $issueDate);
            }
            if (! property_exists($draft, 'dueDate') && $type !== 'letter') {
                $days = $type === 'quotation' ? ($s->defaults->quotationValidDays ?? 30) : ($s->defaults->invoiceDueDays ?? 14);
                $draft->dueDate = self::addDays(substr($issueDate, 0, 10), $days);
            }

            return $this->saveDocument(null, $type, $draft, $status);
        });
    }

    private function requireDoc(string $id): object
    {
        $doc = $this->docRow(DB::table('quote_documents')->where('id', $id)->first());
        if (! $doc) {
            $this->fail(404, 'Document not found.');
        }

        return $doc;
    }

    /* ================================================================ routes */

    public function health(): JsonResponse
    {
        return $this->ok(['ok' => true, 'storage' => 'mysql', 'auth' => false, 'version' => 2]);
    }

    public function getSettings(): JsonResponse
    {
        return $this->ok(['settings' => $this->settings(), 'counters' => $this->counters()]);
    }

    public function putSettings(Request $request): JsonResponse
    {
        $body = $this->body($request);
        if (! self::isObj($body->settings ?? null)) {
            $this->fail(422, 'settings must be an object.');
        }
        $logo = $body->settings->company->logo ?? null;
        if ($logo && (! is_string($logo) || ! preg_match('/^data:image\/(png|jpe?g);base64,/', $logo))) {
            $this->fail(422, 'Logo must be a PNG or JPG image.');
        }
        DB::transaction(function () use ($body) {
            $this->saveSettingsRaw(self::deepMerge($this->storedSettings() ?? new \stdClass(), $body->settings));
            if (self::isObj($body->counters ?? null)) {
                foreach (get_object_vars($body->counters) as $k => $v) {
                    if (is_int($v) && $v >= 0) {
                        $this->setCounter((string) $k, $v);
                    }
                }
            }
        });

        return $this->getSettings();
    }

    public function stats(): JsonResponse
    {
        $docs = $this->allDocs();
        $today = self::today();
        $month = substr($today, 0, 7);
        $q = array_values(array_filter($docs, fn ($d) => $d->type === 'quotation'));
        $inv = array_values(array_filter($docs, fn ($d) => $d->type === 'invoice'));
        $open = array_values(array_filter($inv, fn ($d) => in_array($d->status, ['sent', 'partial'], true)));
        $inMonth = fn ($d) => str_starts_with($d->issue_date ?? '', $month);
        $sum = fn (array $xs, string $f = 'total') => array_reduce($xs, fn ($t, $x) => $t + $x->{$f}, 0);
        $overdue = array_values(array_filter($open, fn ($d) => ! empty($d->data->dueDate) && $d->data->dueDate < $today));
        $awaiting = array_values(array_filter($q, fn ($d) => $d->status === 'sent'));

        $monthly = [];
        $base = now('UTC')->startOfMonth();
        for ($i = 5; $i >= 0; $i--) {
            $m = $base->copy()->subMonthsNoOverflow($i)->format('Y-m');
            $xs = array_filter($docs, fn ($x) => str_starts_with($x->issue_date ?? '', $m));
            $monthly[] = [
                'month' => $m,
                'quoted' => $sum(array_values(array_filter($xs, fn ($x) => $x->type === 'quotation'))),
                'invoiced' => $sum(array_values(array_filter($xs, fn ($x) => $x->type === 'invoice' && $x->status !== 'cancelled'))),
            ];
        }

        return $this->ok([
            'quotations' => count($q),
            'quotationsThisMonth' => count(array_filter($q, $inMonth)),
            'quotedThisMonth' => $sum(array_values(array_filter($q, $inMonth))),
            'openQuotations' => count($awaiting),
            'acceptedQuotations' => count(array_filter($q, fn ($d) => $d->status === 'accepted')),
            'invoices' => count($inv),
            'invoicedThisMonth' => $sum(array_values(array_filter($inv, fn ($d) => $inMonth($d) && $d->status !== 'cancelled'))),
            'outstanding' => $sum($open, 'balance'),
            'overdue' => count($overdue),
            'paidThisMonth' => $sum(array_values(array_filter($inv, fn ($d) => $d->status === 'paid' && str_starts_with($d->updated_at, $month)))),
            'customers' => DB::table('quote_customers')->count(),
            'recent' => array_map(fn ($d) => $this->summary($d), array_slice($docs, 0, 8)),
            'monthly' => $monthly,
            'awaiting' => array_map(fn ($d) => $this->summary($d), array_slice($awaiting, 0, 5)),
            'overdueList' => array_map(fn ($d) => $this->summary($d), array_slice($overdue, 0, 5)),
        ]);
    }

    public function listDocuments(Request $request): JsonResponse
    {
        $type = $request->query('type');
        $status = $request->query('status');
        $q = mb_strtolower((string) $request->query('q', ''));
        $out = [];
        foreach ($this->allDocs() as $d) {
            if (($type && $d->type !== $type) || ($status && $d->status !== $status)) {
                continue;
            }
            if ($q !== '' && ! collect([$d->number, $d->customer_name, $d->subject])->contains(fn ($v) => str_contains(mb_strtolower((string) $v), $q))) {
                continue;
            }
            $out[] = $this->summary($d);
        }

        return $this->ok($out);
    }

    public function createDoc(Request $request): JsonResponse
    {
        $b = $this->body($request);

        return $this->ok($this->createDocument($b->type ?? null, $b->data ?? new \stdClass(), isset($b->status) && is_string($b->status) ? $b->status : null), 201);
    }

    public function showDoc(string $id): JsonResponse
    {
        return $this->ok($this->requireDoc($id));
    }

    public function updateDoc(Request $request, string $id): JsonResponse
    {
        $doc = $this->requireDoc($id);
        $b = $this->body($request);

        return $this->ok($this->saveDocument($doc, $doc->type, $b->data ?? $doc->data, isset($b->status) && is_string($b->status) ? $b->status : null));
    }

    public function patchDoc(Request $request, string $id): JsonResponse
    {
        $doc = $this->requireDoc($id);
        $b = $this->body($request);
        $status = isset($b->status) && is_string($b->status) ? $b->status : null;
        if ($status && ! in_array($status, self::STATUSES[$doc->type], true)) {
            $this->fail(422, 'Invalid status.');
        }

        return $this->ok($this->saveDocument($doc, $doc->type, $doc->data, $status));
    }

    public function deleteDoc(string $id): JsonResponse
    {
        $this->requireDoc($id);
        DB::table('quote_documents')->where('id', $id)->delete();

        return $this->ok(['ok' => true]);
    }

    public function duplicateDoc(string $id): JsonResponse
    {
        $doc = $this->requireDoc($id);
        $data = clone $doc->data;
        unset($data->number, $data->totals, $data->dueDate);
        $data->issueDate = self::today();

        return $this->ok($this->createDocument($doc->type, $data), 201);
    }

    public function convertDoc(string $id): JsonResponse
    {
        $doc = $this->requireDoc($id);
        if ($doc->type !== 'quotation') {
            $this->fail(422, 'Only quotations can be converted to invoices.');
        }
        $s = $this->settings();
        $data = clone $doc->data;
        foreach (['number', 'totals', 'sections', 'salutation', 'intro', 'notes', 'notesTitle', 'dueDate'] as $k) {
            unset($data->{$k});
        }
        $data->issueDate = self::today();
        $data->reference = ! empty($doc->data->number) ? 'Quotation '.$doc->data->number : '';
        $data->notes = $s->defaults->invoiceTerms ?? [];
        $data->sourceId = $doc->id;

        $invoice = DB::transaction(function () use ($doc, $data) {
            $invoice = $this->createDocument('invoice', $data);
            if (in_array($doc->status, ['draft', 'sent'], true)) {
                $this->saveDocument($doc, $doc->type, $doc->data, 'accepted');
            }

            return $invoice;
        });

        return $this->ok($invoice, 201);
    }

    /* ---------------------------------------------------------- customers & catalog */

    private function collectionRule(string $col, object $b): array
    {
        if ($col === 'customers') {
            $name = trim(self::str($b->name ?? '', 200));
            if ($name === '') {
                $this->fail(422, 'Customer name is required.', ['name' => 'Enter a name.']);
            }
            $data = ['name' => $name];
            foreach (['attention' => 200, 'line1' => 200, 'line2' => 200, 'line3' => 200, 'phone' => 60, 'email' => 160, 'notes' => 2000] as $k => $max) {
                $data[$k] = self::str($b->{$k} ?? '', $max);
            }

            return [$name, (object) $data];
        }
        $name = trim(self::str($b->description ?? '', 1000));
        if ($name === '') {
            $this->fail(422, 'Item description is required.', ['description' => 'Enter a description.']);
        }
        $rate = $b->rate ?? null;
        $rateNum = (is_numeric($rate) || (is_string($rate) && preg_match('/^\s*[-+]?\d/', $rate))) ? self::num($rate) : null;

        return [$name, (object) ['description' => $name, 'unit' => self::str($b->unit ?? '', 30), 'rate' => $rateNum, 'category' => self::str($b->category ?? '', 80)]];
    }

    private function collectionTable(string $col): string
    {
        return self::TABLES[$col] ?? $this->fail(404, 'Unknown API route.');
    }

    private function colOut(object $r, bool $withTimes = false): object
    {
        $out = (object) array_merge(['id' => $r->id], (array) (json_decode($r->data, false) ?? new \stdClass()));
        if ($withTimes) {
            $out->created_at = $r->created_at;
            $out->updated_at = $r->updated_at;
        }

        return $out;
    }

    public function listCollection(string $col): JsonResponse
    {
        $rows = DB::table($this->collectionTable($col))->get()->sortBy(fn ($r) => mb_strtolower($r->name))->values();

        return $this->ok($rows->map(fn ($r) => $this->colOut($r, true))->all());
    }

    public function createCollection(Request $request, string $col): JsonResponse
    {
        $table = $this->collectionTable($col);
        [$name, $data] = $this->collectionRule($col, $this->body($request));
        $id = (string) Str::uuid();
        DB::table($table)->insert(['id' => $id, 'name' => $name, 'data' => json_encode($data, JSON_UNESCAPED_UNICODE), 'created_at' => self::now(), 'updated_at' => self::now()]);

        return $this->ok($this->colOut(DB::table($table)->where('id', $id)->first()), 201);
    }

    private function requireRow(string $table, string $id): object
    {
        $row = DB::table($table)->where('id', $id)->first();
        if (! $row) {
            $this->fail(404, 'Not found.');
        }

        return $row;
    }

    public function showCollection(string $col, string $id): JsonResponse
    {
        return $this->ok($this->colOut($this->requireRow($this->collectionTable($col), $id)));
    }

    public function updateCollection(Request $request, string $col, string $id): JsonResponse
    {
        $table = $this->collectionTable($col);
        $row = $this->requireRow($table, $id);
        $merged = self::deepMerge(json_decode($row->data, false) ?? new \stdClass(), $this->body($request));
        [$name, $data] = $this->collectionRule($col, $merged);
        DB::table($table)->where('id', $id)->update(['name' => $name, 'data' => json_encode($data, JSON_UNESCAPED_UNICODE), 'updated_at' => self::now()]);

        return $this->ok($this->colOut(DB::table($table)->where('id', $id)->first()));
    }

    public function deleteCollection(string $col, string $id): JsonResponse
    {
        $table = $this->collectionTable($col);
        $this->requireRow($table, $id);
        DB::table($table)->where('id', $id)->delete();

        return $this->ok(['ok' => true]);
    }

    /* ---------------------------------------------------------- backup, restore, import */

    public function backup(): JsonResponse
    {
        $col = fn (string $table) => DB::table($table)->get()->sortBy(fn ($r) => mb_strtolower($r->name))->values()->map(fn ($r) => (object) [
            'id' => $r->id, 'name' => $r->name, 'data' => json_decode($r->data, false), 'created_at' => $r->created_at, 'updated_at' => $r->updated_at,
        ])->all();

        return $this->ok([
            'app' => 'synnex-quotations',
            'version' => 2,
            'exportedAt' => self::now(),
            'settings' => $this->storedSettings(),
            'counters' => $this->counters(),
            'documents' => $this->allDocs(),
            'customers' => $col('quote_customers'),
            'catalog' => $col('quote_catalog'),
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        $b = $this->body($request);
        if (($b->app ?? null) !== 'synnex-quotations') {
            $this->fail(422, 'This is not a Synnex backup file.');
        }
        $n = 0;
        DB::transaction(function () use ($b, &$n) {
            if (self::isObj($b->settings ?? null)) {
                $this->saveSettingsRaw($b->settings);
            }
            $have = $this->counters();
            if (self::isObj($b->counters ?? null)) {
                foreach (get_object_vars($b->counters) as $k => $v) {
                    if (is_int($v) && $v >= 0) {
                        $this->setCounter((string) $k, max($v, (int) ($have->{$k} ?? 0)));
                    }
                }
            }
            foreach ((is_array($b->documents ?? null) ? $b->documents : []) as $row) {
                if (! is_object($row) || empty($row->id) || ! self::isObj($row->data ?? null) || ! in_array($row->type ?? null, self::TYPES, true)) {
                    continue;
                }
                $status = in_array($row->status ?? null, self::STATUSES[$row->type], true) ? $row->status : 'draft';
                $totals = self::computeTotals($row->data);
                $this->putDoc((object) [
                    'id' => mb_substr((string) $row->id, 0, 64),
                    'type' => $row->type,
                    'number' => self::str($row->number ?? '', 60),
                    'status' => $status,
                    'customer_name' => self::str($row->customer_name ?? ($row->data->customer->name ?? ''), 200),
                    'subject' => self::str($row->subject ?? '', 300),
                    'issue_date' => self::str($row->issue_date ?? '', 10),
                    'total' => $totals->total,
                    'balance' => $totals->balance,
                    'source_id' => isset($row->source_id) && is_string($row->source_id) ? mb_substr($row->source_id, 0, 64) : null,
                    'data' => $row->data,
                    'created_at' => self::str($row->created_at ?? self::now(), 40),
                    'updated_at' => self::str($row->updated_at ?? self::now(), 40),
                ]);
                $n++;
            }
            foreach (self::TABLES as $key => $table) {
                foreach ((is_array($b->{$key} ?? null) ? $b->{$key} : []) as $row) {
                    if (! is_object($row) || empty($row->id) || ! self::isObj($row->data ?? null)) {
                        continue;
                    }
                    [$name, $data] = $this->collectionRule($key, $row->data);
                    DB::table($table)->updateOrInsert(['id' => mb_substr((string) $row->id, 0, 64)], [
                        'name' => $name,
                        'data' => json_encode($data, JSON_UNESCAPED_UNICODE),
                        'created_at' => self::str($row->created_at ?? self::now(), 40),
                        'updated_at' => self::str($row->updated_at ?? self::now(), 40),
                    ]);
                    $n++;
                }
            }
        });

        return $this->ok(['restored' => $n]);
    }

    /** Records saved by the very first version of the app (browser storage). */
    public function import(Request $request): JsonResponse
    {
        $b = $this->body($request);
        $n = 0;
        DB::transaction(function () use ($b, &$n) {
            foreach (['quotation', 'invoice'] as $type) {
                foreach ((is_array($b->{$type.'s'} ?? null) ? $b->{$type.'s'} : []) as $saved) {
                    $this->createDocument($type, $this->legacyToDocument($type, is_object($saved) ? $saved : new \stdClass()));
                    $n++;
                }
            }
        });

        return $this->ok(['imported' => $n]);
    }

    private function legacyToDocument(string $type, object $saved): object
    {
        $d = isset($saved->data) && is_object($saved->data) ? $saved->data : new \stdClass();
        $toIso = function ($v) {
            $v = trim((string) (is_scalar($v) ? $v : ''));
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $v, $m)) {
                return sprintf('%s-%02d-%02d', $m[3], $m[2], $m[1]);
            }

            return preg_match('/^\d{4}-\d{2}-\d{2}/', $v) ? substr($v, 0, 10) : self::today();
        };
        $n = fn ($v) => (is_numeric($v) || (is_string($v) && preg_match('/^\s*[-+]?\d/', $v))) ? self::num($v) : null;
        $items = [];
        foreach ((is_array($d->items ?? null) ? $d->items : []) as $i => $r) {
            $r = is_object($r) ? $r : new \stdClass();
            $items[] = (object) ['id' => "l{$i}", 'kind' => 'item', 'description' => self::str($r->description ?? '', 1000), 'unit' => self::str($r->unit ?? '', 30), 'qty' => $n($r->qty ?? null), 'rate' => $n($r->rate ?? null), 'discount' => $n($r->discount ?? null)];
        }
        $base = (object) [
            'type' => $type,
            'issueDate' => $toIso($d->date ?? ''),
            'customer' => (object) ['name' => self::str($d->recipient1 ?? ($saved->name ?? ''), 200), 'attention' => '', 'line1' => self::str($d->recipient2 ?? '', 200), 'line2' => self::str($d->recipient3 ?? '', 200), 'line3' => '', 'phone' => '', 'email' => ''],
            'items' => $items,
            'notes' => array_values(array_filter(is_array($d->notes ?? null) ? $d->notes : [], fn ($x) => is_scalar($x) && trim((string) $x) !== '')),
        ];
        if ($type === 'quotation') {
            $base->salutation = ! empty($d->salutation) ? self::str($d->salutation, 60).',' : 'Sir,';
            $base->subject = self::str($d->subject ?? '', 300);
            $base->discount = (object) ['mode' => 'amount', 'value' => (($d->showDiscount ?? null) === false) ? 0 : ($n($d->discount ?? null) ?? 0)];

            return $base;
        }
        $base->number = self::str($d->invoiceNo ?? '', 60);
        $base->columns = (object) ['unit' => true, 'qty' => true, 'rate' => true, 'discount' => (bool) array_filter($items, fn ($i) => $i->discount)];
        $base->tax = (object) ['percent' => $n($d->taxPercent ?? null) ?? 0];
        $base->paid = $n($d->paymentsCredits ?? null) ?? 0;

        return $base;
    }
}
