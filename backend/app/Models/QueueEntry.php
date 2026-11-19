<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueEntry extends Model
{
    protected $fillable = [
        'concert_id',
        'user_id',
        'session_id',
        'queue_number',
        'status',
        'admitted_at',
        'expires_at',
    ];

    protected $casts = [
        'admitted_at' => 'datetime',
        'expires_at' => 'datetime',
        'queue_number' => 'integer',
    ];

    public function concert()
    {
        return $this->belongsTo(Concert::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
