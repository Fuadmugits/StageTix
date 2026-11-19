<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'concert_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_identity_no',
        'subtotal',
        'service_fee',
        'payment_fee',
        'discount',
        'total_amount',
        'payment_method',
        'payment_status',
        'virtual_account_no',
        'qr_code_url',
        'expires_at',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'service_fee' => 'integer',
        'payment_fee' => 'integer',
        'discount' => 'integer',
        'total_amount' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function concert(): BelongsTo
    {
        return $this->belongsTo(Concert::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
