<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('date');
            $table->integer('days_count')->default(1);
            $table->integer('year');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('days_per_year')->default(30);
            $table->boolean('is_paid')->default(true);
            $table->decimal('paid_percentage', 5, 2)->default(100.00);
            $table->boolean('requires_attachment')->default(false);
            $table->string('uae_law_type')->nullable(); // annual, sick_tier1, sick_tier2, sick_tier3, maternity, paternity, bereavement, hajj, unpaid
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('total_allocated', 5, 1)->default(30.0);
            $table->decimal('used_days', 5, 1)->default(0.0);
            $table->decimal('pending_days', 5, 1)->default(0.0);
            $table->decimal('remaining_days', 5, 1)->default(30.0);
            $table->decimal('carry_forward', 5, 1)->default(0.0);
            $table->timestamps();
            
            $table->unique(['employee_id', 'leave_type_id', 'year']);
        });

        Schema::create('leave_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 1);
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('approver_remarks')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_applications');
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('public_holidays');
    }
};
