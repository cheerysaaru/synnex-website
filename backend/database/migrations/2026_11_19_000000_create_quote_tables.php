<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Quotations, invoices and letters for the owner's /admin/quotation tool.
 * Mirrors the original quotation app's storage: each document keeps its full
 * editor data as JSON, plus a few columns for lists and search.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_documents', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('type', 20);
            $table->string('number', 60)->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('customer_name', 200)->nullable();
            $table->string('subject', 300)->nullable();
            $table->string('issue_date', 10)->nullable();
            $table->double('total')->default(0);
            $table->double('balance')->default(0);
            $table->string('source_id', 64)->nullable();
            $table->longText('data');
            $table->string('created_at', 40);
            $table->string('updated_at', 40);
            $table->index(['type', 'updated_at']);
        });

        foreach (['quote_customers', 'quote_catalog'] as $name) {
            Schema::create($name, function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('name', 1000);
                $table->longText('data');
                $table->string('created_at', 40);
                $table->string('updated_at', 40);
            });
        }

        Schema::create('quote_settings', function (Blueprint $table) {
            $table->string('key', 40)->primary();
            $table->longText('value');
        });

        Schema::create('quote_counters', function (Blueprint $table) {
            $table->string('key', 60)->primary();
            $table->unsignedInteger('value')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_counters');
        Schema::dropIfExists('quote_settings');
        Schema::dropIfExists('quote_catalog');
        Schema::dropIfExists('quote_customers');
        Schema::dropIfExists('quote_documents');
    }
};
