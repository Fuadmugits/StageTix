<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'concert_id',
        'name',
        'price',
        'description',
        'total_quantity',
        'available_quantity',
        'perks',
    ];

    protected $casts = [
        'price' => 'integer',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'perks' => 'array',
    ];

    public function getTierNameAttribute(): ?string
    {
        return $this->attributes['name'] ?? null;
    }

    public function setTierNameAttribute($value): void
    {
        $this->attributes['name'] = $value;
    }

    public function concert(): BelongsTo
    {
        return $this->belongsTo(Concert::class);
    }
}
