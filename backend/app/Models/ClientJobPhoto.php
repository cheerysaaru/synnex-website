<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A site photo attached to one step of a client job (stored privately). */
class ClientJobPhoto extends Model
{
    protected $fillable = ['client_job_id', 'step', 'path', 'caption'];

    protected function casts(): array
    {
        return ['step' => 'integer'];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(ClientJob::class, 'client_job_id');
    }
}
