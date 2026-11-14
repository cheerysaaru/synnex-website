<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A client's job, tracked through five steps. */
class ClientJob extends Model
{
    /** Number of steps every job goes through (labels live in the frontend). */
    public const STEPS = 5;

    /** Steps at index >= this need the deposit (everything after "Quote approved"). */
    public const DEPOSIT_GATE = 1;

    /** The step at this index ("Handover") needs the final payment. */
    public const FINAL_GATE = 4;

    protected $fillable = [
        'user_id',
        'title',
        'location',
        'service',
        'quote_amount',
        'deposit_percent',
        'deposit_paid_at',
        'final_paid_at',
        'completed_steps',
        'step_notes',
        'step_dates',
    ];

    protected function casts(): array
    {
        return [
            'completed_steps' => 'integer',
            'quote_amount' => 'integer',
            'deposit_percent' => 'integer',
            'deposit_paid_at' => 'date:Y-m-d',
            'final_paid_at' => 'date:Y-m-d',
            'step_notes' => 'array',
            'step_dates' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ClientJobPhoto::class)->orderBy('id');
    }

    /** Always five slots, so the frontend can index steps directly. */
    public function notesList(): array
    {
        return self::fiveSlots($this->step_notes);
    }

    public function datesList(): array
    {
        return self::fiveSlots($this->step_dates);
    }

    private static function fiveSlots(?array $values): array
    {
        $out = [];
        for ($i = 0; $i < self::STEPS; $i++) {
            $out[] = $values[$i] ?? null;
        }
        return $out;
    }

    public function depositPaid(): bool
    {
        return $this->deposit_paid_at !== null;
    }

    public function finalPaid(): bool
    {
        return $this->final_paid_at !== null;
    }

    /** How many steps may be ticked given the payments received so far. */
    public function maxCompletableSteps(): int
    {
        if (! $this->depositPaid()) {
            return self::DEPOSIT_GATE;
        }
        if (! $this->finalPaid()) {
            return self::FINAL_GATE;
        }
        return self::STEPS;
    }

    public function depositAmount(): ?int
    {
        return $this->quote_amount === null ? null : (int) round($this->quote_amount * $this->deposit_percent / 100);
    }

    public function balanceAmount(): ?int
    {
        return $this->quote_amount === null ? null : $this->quote_amount - $this->depositAmount();
    }

    /** Payment reference the client writes on the bank transfer. */
    public function reference(string $kind): string
    {
        return sprintf('SYX-%04d-%s', $this->id, $kind);
    }

    public function paymentArray(): array
    {
        return [
            'quote_amount' => $this->quote_amount,
            'deposit_percent' => $this->deposit_percent,
            'deposit_amount' => $this->depositAmount(),
            'balance_amount' => $this->balanceAmount(),
            'deposit_paid_at' => $this->deposit_paid_at?->toDateString(),
            'final_paid_at' => $this->final_paid_at?->toDateString(),
            'deposit_reference' => $this->reference('D'),
            'final_reference' => $this->reference('F'),
        ];
    }

    /** Shape sent to the browser (same for the client and the admin). */
    public function toTrackingArray(bool $withClient = false): array
    {
        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location,
            'service' => $this->service,
            'completed_steps' => $this->completed_steps,
            'step_notes' => $this->notesList(),
            'step_dates' => $this->datesList(),
            'payment' => $this->paymentArray(),
            'photos' => $this->photos->map(fn (ClientJobPhoto $p) => [
                'id' => $p->id,
                'step' => $p->step,
                'caption' => $p->caption,
                'url' => '/job-photos/'.$p->id,
            ])->values(),
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];

        if ($withClient) {
            $data['client'] = $this->user?->only(['id', 'name', 'username', 'email']);
        }

        return $data;
    }
}
