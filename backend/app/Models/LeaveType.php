<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'days_per_year',
        'is_paid',
        'paid_percentage',
        'requires_attachment',
        'uae_law_type',
        'description',
        'status',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'paid_percentage' => 'decimal:2',
        'requires_attachment' => 'boolean',
    ];

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(LeaveApplication::class);
    }
}
