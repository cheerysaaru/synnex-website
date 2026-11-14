<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payment checkpoints for client jobs:
 *  - a deposit (deposit_percent of the quote, 25% by default) after the quote
 *    is approved — work cannot start until it is received;
 *  - the remaining balance before handover — handover (report, certificate)
 *    cannot happen until it is received.
 * Amounts are whole Sri Lankan rupees.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('quote_amount')->nullable()->after('service');
            $table->unsignedTinyInteger('deposit_percent')->default(25)->after('quote_amount');
            $table->date('deposit_paid_at')->nullable()->after('deposit_percent');
            $table->date('final_paid_at')->nullable()->after('deposit_paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('client_jobs', function (Blueprint $table) {
            $table->dropColumn(['quote_amount', 'deposit_percent', 'deposit_paid_at', 'final_paid_at']);
        });
    }
};
