<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuotationItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_id',
        'description',
        'details',
        'quantity',
        'unit',
        'unit_price',
        'tax_rate',
        'tax_amount',
        'discount_percentage',
        'discount_amount',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'formatted_unit_price',
        'formatted_tax_amount',
        'formatted_discount_amount',
        'formatted_total_amount',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::saving(function ($item) {
            $item->calculateTotals();
        });

        static::saved(function ($item) {
            $item->quotation->updateTotals();
        });

        static::deleted(function ($item) {
            $item->quotation->updateTotals();
        });
    }

    /**
     * Get the quotation that owns the item.
     */
    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Calculate and set the item's totals.
     */
    public function calculateTotals()
    {
        $subtotal = $this->quantity * $this->unit_price;
        
        // Calculate tax amount if tax rate is provided
        $taxAmount = 0;
        if ($this->tax_rate > 0) {
            $taxAmount = ($this->tax_rate / 100) * $subtotal;
        }
        
        // Calculate discount amount if discount percentage is provided
        $discountAmount = 0;
        if ($this->discount_percentage > 0) {
            $discountAmount = ($this->discount_percentage / 100) * $subtotal;
        }
        
        $totalAmount = $subtotal + $taxAmount - $discountAmount;
        
        $this->tax_amount = $taxAmount;
        $this->discount_amount = $discountAmount;
        $this->total_amount = $totalAmount;
        
        return $this;
    }

    /**
     * Get the formatted unit price.
     */
    public function getFormattedUnitPriceAttribute()
    {
        return 'KSh ' . number_format($this->unit_price, 2);
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
     * Update the item with the given data and recalculate totals.
     */
    public function updateWithTotals(array $data)
    {
        $this->fill($data);
        $this->calculateTotals();
        $this->save();
        
        return $this;
    }
}
