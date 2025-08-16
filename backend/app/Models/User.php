<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'profession',
        'company',
        'role',
        'status',
        'avatar_url',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar',
    ];

    /**
     * Get the user's avatar URL.
     *
     * @return string
     */
    public function getAvatarAttribute()
    {
        return $this->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user can manage blogs.
     *
     * @return bool
     */
    public function canManageBlogs()
    {
        return in_array($this->role, ['admin', 'blog_manager']);
    }

    /**
     * Check if the user is active.
     *
     * @return bool
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * The committees that belong to the user.
     */
    public function committees()
    {
        return $this->belongsToMany(Committee::class)
            ->withPivot('role', 'joined_on', 'left_on', 'notes')
            ->withTimestamps();
    }

    /**
     * The committees where the user is the chairperson.
     */
    public function chairedCommittees()
    {
        return $this->hasMany(Committee::class, 'chairperson_id');
    }

    /**
     * The projects that belong to the user.
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class)
            ->withPivot('role', 'assigned_on', 'completed_on', 'responsibilities')
            ->withTimestamps();
    }

    /**
     * The projects created by the user.
     */
    public function createdProjects()
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    /**
     * The dues associated with the user.
     */
    public function dues()
    {
        return $this->hasMany(Due::class);
    }

    /**
     * The documents uploaded by the user.
     */
    public function uploadedDocuments()
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    /**
     * The quotations created by the user.
     */
    public function quotations()
    {
        return $this->hasMany(Quotation::class, 'created_by');
    }

    /**
     * The blog posts authored by the user.
     */
    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }
}
