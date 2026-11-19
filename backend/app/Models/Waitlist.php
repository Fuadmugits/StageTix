<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Waitlist extends Model
{
    protected $fillable = [
        'concert_id',
        'ticket_tier_id',
        'email',
        'phone',
        'status',
    ];

    public function concert()
    {
        return $this->belongsTo(Concert::class);
    }

    public function tier()
    {
        return $this->belongsTo(TicketTier::class, 'ticket_tier_id');
    }
}
