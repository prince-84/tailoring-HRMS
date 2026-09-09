<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GratuityRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'joining_date',
        'end_date',
        'total_service_years',
        'basic_salary',
        'contract_type',
        'termination_type',
        'calculated_amount',
        'status',
        'calculated_by',
        'calculation_details',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'end_date' => 'date',
        'total_service_years' => 'decimal:2',
        'basic_salary' => 'decimal:2',
        'calculated_amount' => 'decimal:2',
        'calculation_details' => 'array',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }
}
