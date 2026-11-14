<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client job tracking: each job belongs to a client account and moves through
 * five steps (Quote approved, Site visit, Installation, Testing, Handover).
 * `completed_steps` counts finished steps (0–5); each step can carry a note,
 * the date it was finished, and photos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->string('location', 160)->nullable();
            $table->string('service', 160)->nullable();
            $table->unsignedTinyInteger('completed_steps')->default(0);
            $table->json('step_notes')->nullable();
            $table->json('step_dates')->nullable();
            $table->timestampsTz();
        });

        Schema::create('client_job_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_job_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('step');
            $table->string('path');
            $table->string('caption', 200)->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_job_photos');
        Schema::dropIfExists('client_jobs');
    }
};
