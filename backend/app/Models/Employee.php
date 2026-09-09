<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'nationality',
        'marital_status',
        'emirates_id_number',
        'passport_number',
        'visa_type',
        'visa_expiry_date',
        'designation_id',
        'department_id',
        'branch_id',
        'shift_id',
        'reporting_to_id',
        'joining_date',
        'contract_type',
        'basic_salary',
        'housing_allowance',
        'transport_allowance',
        'other_allowances',
        'bank_name',
        'iban',
        'status',
        'avatar',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'visa_expiry_date' => 'date',
        'joining_date' => 'date',
        'basic_salary' => 'decimal:2',
        'housing_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'other_allowances' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reporting_to_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'reporting_to_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveApplications(): HasMany
    {
        return $this->hasMany(LeaveApplication::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function complianceDocuments(): HasMany
    {
        return $this->hasMany(ComplianceDocument::class);
    }

    public function salaryStructure(): HasOne
    {
        return $this->hasOne(SalaryStructure::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getTotalGrossSalaryAttribute(): float
    {
        return (float) ($this->basic_salary + $this->housing_allowance + $this->transport_allowance + $this->other_allowances);
    }
}
