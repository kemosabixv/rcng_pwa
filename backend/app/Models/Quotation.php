<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Illuminate\Support\Str;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_number',
        'project_id',
        'vendor_name',
        'vendor_email',
        'vendor_phone',
        'vendor_company',
        'vendor_address',
        'issue_date',
        'expiry_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'notes',
        'terms_and_conditions',
        'status',
        'created_by',
        'sent_at',
        'accepted_at',
        'accepted_by',
        'accepted_notes',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'rejection_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'formatted_issue_date',
        'formatted_expiry_date',
        'formatted_subtotal',
        'formatted_tax_amount',
        'formatted_discount_amount',
        'formatted_total_amount',
        'is_expired',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::creating(function ($quotation) {
            if (empty($quotation->quotation_number)) {
                $quotation->quotation_number = static::generateQuotationNumber();
            }
            
            if (empty($quotation->issue_date)) {
                $quotation->issue_date = now();
            }
            
            if (empty($quotation->expiry_date)) {
                $quotation->expiry_date = now()->addDays(30);
            }
            
            if (empty($quotation->status)) {
                $quotation->status = 'draft';
            }
        });
        
        static::created(function ($quotation) {
            $quotation->updateTotals();
        });
    }

    /**
     * Get the project that owns the quotation.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created the quotation.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the items for the quotation.
     */
    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Generate a unique quotation number.
     */
    public static function generateQuotationNumber()
    {
        $prefix = 'QT-' . date('Y') . '-';
        $latest = static::where('quotation_number', 'like', $prefix . '%')
            ->orderBy('quotation_number', 'desc')
            ->first();
        
        if ($latest) {
            // Safely extract the number part and increment
            $numberPart = str_replace($prefix, '', $latest->quotation_number);
            $number = is_numeric($numberPart) ? ((int)$numberPart + 1) : 1001;
        } else {
            $number = 1001;
        }
        
        // Ensure the number is at least 1001
        $number = max(1001, $number);
        
        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Update quotation totals based on items.
     */
    public function updateTotals()
    {
        // If we have items, calculate from items, otherwise use the values provided
        if ($this->items()->exists()) {
            $subtotal = $this->items()->sum('total_amount');
            
            // Use the tax amount directly from the model or calculate it
            $taxAmount = $this->tax_amount ?? 0;
            
            // Use the discount amount directly from the model
            $discountAmount = $this->discount_amount ?? 0;
            
            $totalAmount = $subtotal + $taxAmount - $discountAmount;
        } else {
            // If no items, just ensure the total is consistent with subtotal + tax - discount
            $subtotal = $this->subtotal ?? 0;
            $taxAmount = $this->tax_amount ?? 0;
            $discountAmount = $this->discount_amount ?? 0;
            $totalAmount = $this->total_amount ?? ($subtotal + $taxAmount - $discountAmount);
        }
        
        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
        ]);
        
        return $this;
    }

    /**
     * Add an item to the quotation.
     */
    public function addItem(array $data)
    {
        $item = $this->items()->create($data);
        $this->updateTotals();
        return $item;
    }

    /**
     * Remove an item from the quotation.
     */
    public function removeItem($itemId)
    {
        $this->items()->where('id', $itemId)->delete();
        $this->updateTotals();
        return $this;
    }

    /**
     * Get the formatted issue date.
     */
    public function getFormattedIssueDateAttribute()
    {
        return $this->issue_date ? $this->issue_date->format('M d, Y') : null;
    }

    /**
     * Get the formatted expiry date.
     */
    public function getFormattedExpiryDateAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('M d, Y') : null;
    }

    /**
     * Get the formatted subtotal.
     */
    public function getFormattedSubtotalAttribute()
    {
        return 'KSh ' . number_format($this->subtotal, 2);
    }

    /**
     * Get the formatted tax amount.
     */
    public function getFormattedTaxAmountAttribute()
    {
        return 'KSh ' . number_format($this->tax_amount, 2);
    }

    /**
     * Get the formatted discount amount.
     */
    public function getFormattedDiscountAmountAttribute()
    {
        return 'KSh ' . number_format($this->discount_amount, 2);
    }

    /**
     * Get the formatted total amount.
     */
    public function getFormattedTotalAmountAttribute()
    {
        return 'KSh ' . number_format($this->total_amount, 2);
    }

    /**
     * Check if the quotation is expired.
     */
    public function getIsExpiredAttribute()
    {
        if (!$this->expiry_date) {
            return false;
        }
        
        return now()->gt($this->expiry_date);
    }

    /**
     * Scope a query to only include draft quotations.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to only include sent quotations.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope a query to only include accepted quotations.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope a query to only include rejected quotations.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include expired quotations.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now())
            ->where('status', '!=', 'accepted')
            ->where('status', '!=', 'rejected');
    }

    /**
     * Mark the quotation as sent.
     */
    public function markAsSent()
    {
        if ($this->status === 'draft') {
            $this->status = 'sent';
            $this->save();
        }
        
        return $this;
    }

    /**
     * Mark the quotation as accepted.
     */
    public function markAsAccepted()
    {
        if (in_array($this->status, ['sent', 'draft'])) {
            $this->status = 'accepted';
            $this->save();
        }
        
        return $this;
    }

    /**
     * Mark the quotation as rejected.
     */
    public function markAsRejected()
    {
        if (in_array($this->status, ['sent', 'draft'])) {
            $this->status = 'rejected';
            $this->save();
        }
        
        return $this;
    }
}
