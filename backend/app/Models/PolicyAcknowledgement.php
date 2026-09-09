<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolicyAcknowledgement extends Model
{
    use HasFactory;

    protected $fillable = [
        'policy_id',
        'employee_id',
        'user_id',
        'acknowledged_at',
        'ip_address',
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
    ];

    public function policy(): BelongsTo
    {
        return $this->belongsTo(Policy::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
