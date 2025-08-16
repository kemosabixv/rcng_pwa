<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Models\User;

class Due extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'status',
        'due_date',
        'paid_at',
        'notes',
        'recorded_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'is_overdue',
        'formatted_amount',
        'formatted_due_date',
    ];

    /**
     * Get the user that owns the due.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who recorded the due.
     */
    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Scope a query to only include paid dues.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope a query to only include pending dues.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include overdue dues.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('due_date', '<', now()->toDateString());
    }

    /**
     * Check if the due is overdue.
     */
    public function getIsOverdueAttribute()
    {
        return $this->status === 'pending' && 
               $this->due_date && 
               $this->due_date->isPast();
    }

    /**
     * Get the formatted amount with currency symbol.
     */
    public function getFormattedAmountAttribute()
    {
        return 'KSh ' . number_format($this->amount, 2);
    }

    /**
     * Get the formatted due date.
     */
    public function getFormattedDueDateAttribute()
    {
        return $this->due_date ? $this->due_date->format('M d, Y') : null;
    }

    /**
     * Mark the due as paid.
     *
     * @param  string  $paymentMethod
     * @param  string  $transactionId
     * @param  string  $notes
     * @return bool
     */
    public function markAsPaid($paymentMethod = 'cash', $transactionId = null, $notes = null)
    {
        $this->status = 'paid';
        $this->paid_at = now();
        $this->payment_method = $paymentMethod;
        $this->transaction_id = $transactionId;
        
        if ($notes) {
            $this->notes = $this->notes ? $this->notes . "\n\n$notes" : $notes;
        }
        
        return $this->save();
    }

    /**
     * Get the yearly dues summary for a user.
     *
     * @param  int  $userId
     * @param  int  $year
     * @return array
     */
    public static function getYearlySummary($userId, $year = null)
    {
        $year = $year ?? date('Y');
        $startDate = "$year-01-01";
        $endDate = "$year-12-31";
        
        $dues = self::where('user_id', $userId)
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get();
        
        $totalDues = $dues->sum('amount');
        $totalPaid = $dues->where('status', 'paid')->sum('amount');
        $totalPending = $dues->where('status', 'pending')->sum('amount');
        
        return [
            'total_dues' => $totalDues,
            'total_paid' => $totalPaid,
            'total_pending' => $totalPending,
            'payment_progress' => $totalDues > 0 ? ($totalPaid / $totalDues) * 100 : 100,
            'dues' => $dues,
        ];
    }
}
