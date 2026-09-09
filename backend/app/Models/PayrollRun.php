<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_name',
        'month',
        'year',
        'pay_period_start',
        'pay_period_end',
        'total_employees',
        'total_gross',
        'total_allowances',
        'total_deductions',
        'total_net',
        'status',
        'approved_by',
        'approved_at',
        'wps_sif_exported',
        'wps_file_name',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'total_gross' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_net' => 'decimal:2',
        'approved_at' => 'datetime',
        'wps_sif_exported' => 'boolean',
    ];

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }
}
