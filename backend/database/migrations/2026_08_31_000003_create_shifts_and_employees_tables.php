<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('break_minutes')->default(60);
            $table->integer('grace_period_minutes')->default(15);
            $table->json('work_days')->nullable(); // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
            $table->boolean('is_rotational')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->default('Male');
            $table->date('date_of_birth')->nullable();
            $table->string('nationality')->default('United Arab Emirates');
            $table->string('marital_status')->nullable();
            $table->string('emirates_id_number')->nullable();
            $table->string('passport_number')->nullable();
            $table->string('visa_type')->nullable(); // Employment, Partner, Golden, Visit
            $table->date('visa_expiry_date')->nullable();
            
            // Job Information
            $table->foreignId('designation_id')->nullable()->constrained('designations')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->unsignedBigInteger('reporting_to_id')->nullable();
            
            $table->date('joining_date');
            $table->enum('contract_type', ['Limited', 'Unlimited'])->default('Limited');
            
            // Compensation details (in AED)
            $table->decimal('basic_salary', 12, 2)->default(0.00);
            $table->decimal('housing_allowance', 12, 2)->default(0.00);
            $table->decimal('transport_allowance', 12, 2)->default(0.00);
            $table->decimal('other_allowances', 12, 2)->default(0.00);
            
            // Banking for WPS
            $table->string('bank_name')->nullable();
            $table->string('iban')->nullable();
            
            $table->string('status')->default('active'); // active, on_leave, probation, resigned, terminated
            $table->string('avatar')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add foreign key to departments for head_of_department_id if needed
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('head_of_department_id')->references('id')->on('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_of_department_id']);
        });
        Schema::dropIfExists('employees');
        Schema::dropIfExists('shifts');
    }
};
