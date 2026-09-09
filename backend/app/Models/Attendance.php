<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'shift_id',
        'date',
        'check_in',
        'check_out',
        'check_in_latitude',
        'check_in_longitude',
        'check_in_ip',
        'check_in_photo',
        'check_out_latitude',
        'check_out_longitude',
        'check_out_ip',
        'check_out_photo',
        'status',
        'working_hours',
        'late_minutes',
        'early_leaving_minutes',
        'overtime_hours',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'working_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'check_in_latitude' => 'decimal:8',
        'check_in_longitude' => 'decimal:8',
        'check_out_latitude' => 'decimal:8',
        'check_out_longitude' => 'decimal:8',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function regularization(): HasOne
    {
        return $this->hasOne(AttendanceRegularization::class);
    }
}
