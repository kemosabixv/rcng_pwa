<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Models\Committee;
use App\Models\User;
use App\Models\Document;
use App\Models\Quotation;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'committee_id',
        'budget',
        'amount_spent',
        'start_date',
        'end_date',
        'status',
        'progress',
        'priority',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'budget' => 'decimal:2',
        'amount_spent' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'progress' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'days_remaining',
        'is_overdue',
        'budget_utilization',
    ];

    /**
     * Get the committee that owns the project.
     */
    public function committee()
    {
        return $this->belongsTo(Committee::class);
    }

    /**
     * Get the user who created the project.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The users that belong to the project.
     */
    public function members()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role', 'assigned_on', 'completed_on', 'responsibilities')
            ->withTimestamps();
    }

    /**
     * Get all of the documents for the project.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get all of the quotations for the project.
     */
    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    /**
     * Get the number of days remaining until project deadline.
     */
    public function getDaysRemainingAttribute()
    {
        if (!$this->end_date) {
            return null;
        }
        
        $endDate = Carbon::parse($this->end_date);
        $now = Carbon::now();
        
        return $now->diffInDays($endDate, false);
    }

    /**
     * Check if the project is overdue.
     */
    public function getIsOverdueAttribute()
    {
        if (!$this->end_date) {
            return false;
        }
        
        return Carbon::now()->gt(Carbon::parse($this->end_date)) && $this->status !== 'completed';
    }

    /**
     * Get the budget utilization percentage.
     */
    public function getBudgetUtilizationAttribute()
    {
        if ($this->budget <= 0) {
            return 0;
        }
        
        return min(100, round(($this->amount_spent / $this->budget) * 100, 2));
    }

    /**
     * Scope a query to only include active projects.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed projects.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include overdue projects.
     */
    public function scopeOverdue($query)
    {
        return $query->where('end_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    /**
     * Update the project's progress.
     *
     * @param  int  $progress
     * @return void
     */
    public function updateProgress(int $progress)
    {
        $this->progress = max(0, min(100, $progress));
        
        if ($this->progress === 100) {
            $this->status = 'completed';
        } elseif ($this->status === 'completed') {
            $this->status = 'in_progress';
        }
        
        $this->save();
    }
}
