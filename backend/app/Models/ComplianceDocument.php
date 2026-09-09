<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ComplianceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'document_type',
        'document_number',
        'issue_date',
        'expiry_date',
        'issuing_authority',
        'sponsor_name',
        'file_path',
        'status',
        'alert_90_sent',
        'alert_60_sent',
        'alert_30_sent',
        'notes',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'alert_90_sent' => 'boolean',
        'alert_60_sent' => 'boolean',
        'alert_30_sent' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function getDaysRemainingAttribute(): int
    {
        return (int) Carbon::now()->diffInDays(Carbon::parse($this->expiry_date), false);
    }

    public function getComputedStatusAttribute(): string
    {
        $days = $this->days_remaining;
        if ($days < 0) {
            return 'expired';
        }
        if ($days <= 90) {
            return 'expiring_soon';
        }
        return 'valid';
    }
}
