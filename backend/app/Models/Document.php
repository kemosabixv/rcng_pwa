<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'visibility',
        'uploaded_by',
        'committee_id',
        'project_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'formatted_file_size',
        'uploaded_at',
        'file_icon',
        'download_url',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($document) {
            $document->file_name = $document->file_name ?? basename($document->file_path);
            $document->file_type = $document->file_type ?? $document->guessFileType();
        });
    }

    /**
     * Get the user who uploaded the document.
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the committee that owns the document.
     */
    public function committee()
    {
        return $this->belongsTo(Committee::class);
    }

    /**
     * Get the project that owns the document.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the formatted file size.
     */
    public function getFormattedFileSizeAttribute()
    {
        $size = $this->file_size;
        
        if ($size >= 1073741824) {
            return number_format($size / 1073741824, 2) . ' GB';
        } elseif ($size >= 1048576) {
            return number_format($size / 1048576, 2) . ' MB';
        } elseif ($size >= 1024) {
            return number_format($size / 1024, 2) . ' KB';
        } else {
            return $size . ' bytes';
        }
    }

    /**
     * Get the formatted uploaded at timestamp.
     */
    public function getUploadedAtAttribute()
    {
        return $this->created_at ? $this->created_at->diffForHumans() : null;
    }

    /**
     * Get the appropriate icon for the file type.
     */
    public function getFileIconAttribute()
    {
        $extension = strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));
        
        $icons = [
            'pdf' => 'file-pdf',
            'doc' => 'file-word',
            'docx' => 'file-word',
            'xls' => 'file-excel',
            'xlsx' => 'file-excel',
            'ppt' => 'file-powerpoint',
            'pptx' => 'file-powerpoint',
            'jpg' => 'file-image',
            'jpeg' => 'file-image',
            'png' => 'file-image',
            'gif' => 'file-image',
            'zip' => 'file-archive',
            'rar' => 'file-archive',
            'txt' => 'file-alt',
        ];
        
        return $icons[$extension] ?? 'file';
    }

    /**
     * Get the download URL for the document.
     */
    public function getDownloadUrlAttribute()
    {
        return route('documents.download', $this->id);
    }

    /**
     * Guess the file type based on the file extension.
     */
    protected function guessFileType()
    {
        $extension = strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));
        
        $types = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            'txt' => 'text/plain',
        ];
        
        return $types[$extension] ?? 'application/octet-stream';
    }

    /**
     * Scope a query to only include documents visible to the given user.
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where(function ($query) use ($user) {
            $query->where('visibility', 'public')
                ->orWhere('uploaded_by', $user->id)
                ->orWhere('visibility', 'members_only')
                ->orWhereHas('committee', function ($query) use ($user) {
                    $query->whereHas('members', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    });
                });
        });
    }

    /**
     * Check if the document is visible to the given user.
     */
    public function isVisibleTo(User $user)
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($this->visibility === 'public') {
            return true;
        }

        if ($this->uploaded_by === $user->id) {
            return true;
        }

        if ($this->visibility === 'members_only' && $user->isActive()) {
            return true;
        }

        if ($this->committee && $this->committee->members()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }
}
