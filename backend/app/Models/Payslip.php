<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'employee_id',
        'payslip_number',
        'month',
        'year',
        'basic_salary',
        'housing_allowance',
        'transport_allowance',
        'other_allowances',
        'gross_salary',
        'overtime_hours',
        'overtime_amount',
        'deductions_amount',
        'deductions_breakdown',
        'net_salary',
        'payment_status',
        'payment_date',
        'pdf_path',
        'generated_at',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'housing_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'deductions_amount' => 'decimal:2',
        'deductions_breakdown' => 'array',
        'net_salary' => 'decimal:2',
        'payment_date' => 'date',
        'generated_at' => 'datetime',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
