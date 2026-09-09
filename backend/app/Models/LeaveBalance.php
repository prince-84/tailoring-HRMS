<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'year',
        'total_allocated',
        'used_days',
        'pending_days',
        'remaining_days',
        'carry_forward',
    ];

    protected $casts = [
        'total_allocated' => 'decimal:1',
        'used_days' => 'decimal:1',
        'pending_days' => 'decimal:1',
        'remaining_days' => 'decimal:1',
        'carry_forward' => 'decimal:1',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }
}
