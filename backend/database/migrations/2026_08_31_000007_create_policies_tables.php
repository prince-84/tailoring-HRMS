<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('General'); // General, Leave Policy, Code of Conduct, IT Policy, Health & Safety
            $table->string('version')->default('1.0');
            $table->text('description')->nullable();
            $table->string('document_path')->nullable();
            $table->date('effective_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('policy_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('policy_id')->constrained('policies')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at');
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->unique(['policy_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_acknowledgements');
        Schema::dropIfExists('policies');
    }
};
