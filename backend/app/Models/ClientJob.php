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

    protected $fillable = [
        'user_id',
        'title',
        'location',
        'service',
        'completed_steps',
        'step_notes',
        'step_dates',
    ];

    protected function casts(): array
    {
        return [
            'completed_steps' => 'integer',
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
