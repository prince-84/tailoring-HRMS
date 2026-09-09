<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compliance_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('document_type', ['Passport', 'Visa', 'Emirates ID', 'Labour Card', 'Medical Insurance', 'Other']);
            $table->string('document_number');
            $table->date('issue_date')->nullable();
            $table->date('expiry_date');
            $table->string('issuing_authority')->nullable(); // e.g. ICP, GDRFA, MOHRE
            $table->string('sponsor_name')->nullable();
            $table->string('file_path')->nullable();
            $table->enum('status', ['valid', 'expiring_soon', 'expired'])->default('valid');
            $table->boolean('alert_90_sent')->default(false);
            $table->boolean('alert_60_sent')->default(false);
            $table->boolean('alert_30_sent')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_documents');
    }
};
