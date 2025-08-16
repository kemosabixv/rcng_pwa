<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Committee extends Model
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
        'chairperson_id',
        'meeting_schedule',
        'budget',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'budget' => 'decimal:2',
    ];

    /**
     * Get the chairperson of the committee.
     */
    public function chairperson()
    {
        return $this->belongsTo(User::class, 'chairperson_id');
    }

    /**
     * The users that belong to the committee.
     */
    public function members()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role', 'joined_on', 'left_on', 'notes')
            ->withTimestamps();
    }

    /**
     * Get all of the projects for the committee.
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get all of the documents for the committee.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Scope a query to only include active committees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get the count of active members in the committee.
     */
    public function getActiveMembersCountAttribute()
    {
        return $this->members()
            ->wherePivotNull('left_on')
            ->count();
    }

    /**
     * Get the total budget spent on committee projects.
     */
    public function getBudgetSpentAttribute()
    {
        return $this->projects()->sum('amount_spent');
    }

    /**
     * Get the remaining budget for the committee.
     */
    public function getRemainingBudgetAttribute()
    {
        return $this->budget - $this->budget_spent;
    }
}
