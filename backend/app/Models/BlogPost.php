<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'featured_image',
        'is_featured',
        'is_published',
        'published_at',
        'views',
        'read_time',
        'tags',
        'meta_description',
        'author_id',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'tags' => 'array',
        'views' => 'integer',
        'read_time' => 'integer',
    ];

    protected $dates = [
        'published_at',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->getOriginal('slug'))) {
                $post->slug = Str::slug($post->title);
            }
        });
    }

    /**
     * Get the author of the blog post.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope for published posts.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                    ->whereNotNull('published_at');
    }

    /**
     * Scope for featured posts.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for posts by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Increment the views counter.
     */
    public function incrementViews()
    {
        $this->increment('views');

        // Clear statistics cache when views are updated
        Cache::forget('blog_statistics');
    }

    /**
     * Get available categories.
     */
    public static function getCategories()
    {
        return [
            'Community Service',
            'International Projects',
            'Youth Programs',
            'Member Spotlight',
            'Education',
            'Club News',
            'Events',
        ];
    }

    /**
     * Calculate estimated read time based on content.
     */
    public function calculateReadTime()
    {
        $wordCount = str_word_count(strip_tags($this->content));
        $readTime = ceil($wordCount / 200); // Average reading speed 200 words per minute
        return max(1, $readTime); // Minimum 1 minute
    }

    /**
     * Auto-calculate read time before saving.
     */
    public function setContentAttribute($value)
    {
        $this->attributes['content'] = $value;
        $this->attributes['read_time'] = $this->calculateReadTime();
    }
}
