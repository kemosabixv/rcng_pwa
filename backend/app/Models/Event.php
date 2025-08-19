<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'excerpt',
        'type',
        'category',
        'start_date',
        'end_date',
        'all_day',
        'location',
        'address',
        'latitude',
        'longitude',
        'max_attendees',
        'registration_fee',
        'registration_deadline',
        'requires_registration',
        'featured_image',
        'gallery',
        'status',
        'visibility',
        'is_featured',
        'tags',
        'notes',
        'contact_info',
        'custom_fields',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'registration_deadline' => 'datetime',
        'all_day' => 'boolean',
        'requires_registration' => 'boolean',
        'is_featured' => 'boolean',
        'registration_fee' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'gallery' => 'array',
        'tags' => 'array',
        'contact_info' => 'array',
        'custom_fields' => 'array',
    ];

    protected $appends = [
        'formatted_start_date',
        'formatted_end_date',
        'is_upcoming',
        'is_past',
        'is_ongoing',
        'registration_status',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });

        static::updating(function ($event) {
            if ($event->isDirty('title') && empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the user who created the event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include published events.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query to only include public events.
     */
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope a query to only include upcoming events.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now());
    }

    /**
     * Scope a query to only include past events.
     */
    public function scopePast($query)
    {
        return $query->where('end_date', '<', now());
    }

    /**
     * Scope a query to only include ongoing events.
     */
    public function scopeOngoing($query)
    {
        return $query->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }

    /**
     * Scope a query to only include featured events.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get formatted start date.
     */
    public function getFormattedStartDateAttribute(): string
    {
        return $this->start_date ? $this->start_date->format('M d, Y') : '';
    }

    /**
     * Get formatted end date.
     */
    public function getFormattedEndDateAttribute(): string
    {
        return $this->end_date ? $this->end_date->format('M d, Y') : '';
    }

    /**
     * Check if event is upcoming.
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_date && $this->start_date->isFuture();
    }

    /**
     * Check if event is past.
     */
    public function getIsPastAttribute(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    /**
     * Check if event is ongoing.
     */
    public function getIsOngoingAttribute(): bool
    {
        return $this->start_date && $this->end_date &&
               $this->start_date->isPast() && $this->end_date->isFuture();
    }

    /**
     * Get registration status.
     */
    public function getRegistrationStatusAttribute(): string
    {
        if (!$this->requires_registration) {
            return 'not_required';
        }

        if ($this->registration_deadline && $this->registration_deadline->isPast()) {
            return 'closed';
        }

        if ($this->start_date && $this->start_date->isPast()) {
            return 'closed';
        }

        return 'open';
    }

    /**
     * Get event duration in human readable format.
     */
    public function getDuration(): string
    {
        if (!$this->start_date || !$this->end_date) {
            return '';
        }

        if ($this->all_day) {
            if ($this->start_date->isSameDay($this->end_date)) {
                return 'All day';
            }
            return 'All day, ' . $this->start_date->diffInDays($this->end_date) + 1 . ' days';
        }

        if ($this->start_date->isSameDay($this->end_date)) {
            return $this->start_date->format('g:i A') . ' - ' . $this->end_date->format('g:i A');
        }

        return $this->start_date->format('M d, g:i A') . ' - ' . $this->end_date->format('M d, g:i A');
    }

    /**
     * Get the type color for display.
     */
    public function getTypeColor(): string
    {
        return match($this->type) {
            'meeting' => 'bg-blue-100 text-blue-800',
            'service' => 'bg-green-100 text-green-800',
            'fundraiser' => 'bg-purple-100 text-purple-800',
            'social' => 'bg-pink-100 text-pink-800',
            'training' => 'bg-orange-100 text-orange-800',
            'conference' => 'bg-indigo-100 text-indigo-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Get the category color for display.
     */
    public function getCategoryColor(): string
    {
        return match($this->category) {
            'club_service' => 'bg-blue-100 text-blue-800',
            'community_service' => 'bg-green-100 text-green-800',
            'international_service' => 'bg-red-100 text-red-800',
            'vocational_service' => 'bg-yellow-100 text-yellow-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Generate excerpt from description if not provided.
     */
    public function getExcerptAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        return Str::limit(strip_tags($this->description), 150);
    }
}
