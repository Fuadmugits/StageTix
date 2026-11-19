<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Concert extends Model
{
    use HasFactory;

    protected $fillable = [
        'venue_id',
        'slug',
        'title',
        'artist',
        'category',
        'genre',
        'status',
        'date',
        'time',
        'venue',
        'city',
        'image',
        'banner_image',
        'description',
        'is_popular',
        'is_selling_fast',
        'min_price',
        'sales_start_at',
        'sales_end_at',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_selling_fast' => 'boolean',
        'date' => 'date:Y-m-d',
        'min_price' => 'integer',
        'sales_start_at' => 'datetime',
        'sales_end_at' => 'datetime',
    ];

    public function venueDetail(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Venue::class, 'venue_id');
    }

    public function ticketTiers(): HasMany
    {
        return $this->hasMany(TicketTier::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
