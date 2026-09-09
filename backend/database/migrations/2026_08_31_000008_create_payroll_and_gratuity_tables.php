<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->decimal('basic_salary', 12, 2);
            $table->decimal('housing_allowance', 12, 2)->default(0.00);
            $table->decimal('transport_allowance', 12, 2)->default(0.00);
            $table->decimal('other_allowances', 12, 2)->default(0.00);
            $table->decimal('gross_salary', 12, 2);
            $table->decimal('standard_deductions', 12, 2)->default(0.00);
            $table->string('payment_method')->default('WPS_Bank_Transfer');
            $table->string('bank_name')->nullable();
            $table->string('iban')->nullable();
            $table->date('effective_date');
            $table->timestamps();
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->string('batch_name');
            $table->integer('month');
            $table->integer('year');
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->integer('total_employees')->default(0);
            $table->decimal('total_gross', 14, 2)->default(0.00);
            $table->decimal('total_allowances', 14, 2)->default(0.00);
            $table->decimal('total_deductions', 14, 2)->default(0.00);
            $table->decimal('total_net', 14, 2)->default(0.00);
            $table->enum('status', ['draft', 'reviewed', 'approved', 'processed', 'paid'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->boolean('wps_sif_exported')->default(false);
            $table->string('wps_file_name')->nullable();
            $table->timestamps();
            
            $table->unique(['month', 'year']);
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('payslip_number')->unique();
            $table->integer('month');
            $table->integer('year');
            $table->decimal('basic_salary', 12, 2);
            $table->decimal('housing_allowance', 12, 2)->default(0.00);
            $table->decimal('transport_allowance', 12, 2)->default(0.00);
            $table->decimal('other_allowances', 12, 2)->default(0.00);
            $table->decimal('gross_salary', 12, 2);
            $table->decimal('overtime_hours', 5, 2)->default(0.00);
            $table->decimal('overtime_amount', 12, 2)->default(0.00);
            $table->decimal('deductions_amount', 12, 2)->default(0.00);
            $table->json('deductions_breakdown')->nullable();
            $table->decimal('net_salary', 12, 2);
            $table->string('payment_status')->default('Pending'); // Pending, Paid
            $table->date('payment_date')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });

        Schema::create('gratuity_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('joining_date');
            $table->date('end_date');
            $table->decimal('total_service_years', 5, 2);
            $table->decimal('basic_salary', 12, 2);
            $table->enum('contract_type', ['Limited', 'Unlimited'])->default('Limited');
            $table->enum('termination_type', ['resignation', 'termination', 'end_of_contract'])->default('end_of_contract');
            $table->decimal('calculated_amount', 14, 2);
            $table->string('status')->default('calculated'); // calculated, approved, paid
            $table->foreignId('calculated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('calculation_details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gratuity_records');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('salary_structures');
    }
};
