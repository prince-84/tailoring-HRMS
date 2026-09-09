<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('check_in_latitude', 10, 8)->nullable();
            $table->decimal('check_in_longitude', 11, 8)->nullable();
            $table->string('check_in_ip')->nullable();
            $table->string('check_in_photo')->nullable();
            $table->decimal('check_out_latitude', 10, 8)->nullable();
            $table->decimal('check_out_longitude', 11, 8)->nullable();
            $table->string('check_out_ip')->nullable();
            $table->string('check_out_photo')->nullable();
            
            // Status: present, absent, late, half_day, on_leave, holiday, weekend
            $table->string('status')->default('present');
            $table->decimal('working_hours', 5, 2)->default(0.00);
            $table->integer('late_minutes')->default(0);
            $table->integer('early_leaving_minutes')->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->unique(['employee_id', 'date']);
        });

        Schema::create('attendance_regularizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('attendance_id')->nullable()->constrained('attendances')->nullOnDelete();
            $table->date('regularization_date');
            $table->time('requested_check_in')->nullable();
            $table->time('requested_check_out')->nullable();
            $table->enum('request_type', ['missed_check_in', 'missed_check_out', 'missed_both', 'late_regularization', 'manual_entry'])->default('missed_both');
            $table->text('reason');
            $table->string('supporting_document')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('approval_remarks')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_regularizations');
        Schema::dropIfExists('attendances');
    }
};
