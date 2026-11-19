<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Concert;
use App\Models\QueueEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class QueueController extends Controller
{
    /**
     * Join the Virtual Waiting Room / Queue for high-demand concert ticket sales
     */
    public function join(Request $request, int $concertId): JsonResponse
    {
        $concert = Concert::findOrFail($concertId);

        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id') ?? Str::uuid()->toString();
        $userId = $request->user()?->id;

        // Check if user/session already in queue for this concert
        $existing = QueueEntry::where('concert_id', $concertId)
            ->where(function ($q) use ($sessionId, $userId) {
                $q->where('session_id', $sessionId);
                if ($userId) {
                    $q->orWhere('user_id', $userId);
                }
            })
            ->whereIn('status', ['waiting', 'admitted'])
            ->first();

        if ($existing) {
            // Check if admitted expired (10 minutes limit)
            if ($existing->status === 'admitted' && $existing->expires_at && $existing->expires_at->isPast()) {
                $existing->update(['status' => 'expired']);
            } else {
                return $this->buildQueueResponse($existing, $concert);
            }
        }

        // Atomic FIFO Queue Counter using Cache / Redis or DB Count
        $queueNumber = Cache::increment("concert_queue_counter_{$concertId}");

        $entry = QueueEntry::create([
            'concert_id' => $concertId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'queue_number' => $queueNumber,
            'status' => 'waiting',
        ]);

        return $this->buildQueueResponse($entry, $concert, 201);
    }

    /**
     * Check current queue position and estimated wait time
     */
    public function status(Request $request, int $concertId): JsonResponse
    {
        $concert = Concert::findOrFail($concertId);
        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id');

        $entry = QueueEntry::where('concert_id', $concertId)
            ->where('session_id', $sessionId)
            ->latest()
            ->first();

        if (!$entry) {
            return response()->json([
                'status' => 'error',
                'message' => 'Queue entry not found. Please join the queue.'
            ], 404);
        }

        // Check if expired
        if ($entry->status === 'admitted' && $entry->expires_at && $entry->expires_at->isPast()) {
            $entry->update(['status' => 'expired']);
            return response()->json([
                'status' => 'error',
                'queue_status' => 'expired',
                'message' => 'Your 10-minute checkout session has expired. You lost your turn.'
            ], 410);
        }

        // Auto-admit top FIFO entries (Simulated batch admission logic)
        if ($entry->status === 'waiting') {
            $currentAdmittedNumber = Cache::get("concert_admitted_number_{$concertId}", 0);
            
            // If entry is within batch admission threshold (e.g. top 50 in line)
            if ($entry->queue_number <= $currentAdmittedNumber + 20) {
                $entry->update([
                    'status' => 'admitted',
                    'admitted_at' => now(),
                    'expires_at' => now()->addMinutes(10),
                ]);
            }
        }

        return $this->buildQueueResponse($entry, $concert);
    }

    /**
     * Organizer / Admin command to admit next batch of users
     */
    public function admitBatch(Request $request, int $concertId): JsonResponse
    {
        $batchSize = (int) $request->input('batch_size', 50);
        $newAdmitted = Cache::increment("concert_admitted_number_{$concertId}", $batchSize);

        // Admit waiting entries up to newAdmitted number
        QueueEntry::where('concert_id', $concertId)
            ->where('status', 'waiting')
            ->where('queue_number', '<=', $newAdmitted)
            ->update([
                'status' => 'admitted',
                'admitted_at' => now(),
                'expires_at' => now()->addMinutes(10),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => "Admitted next batch of {$batchSize} users.",
            'current_admitted_cutoff' => $newAdmitted
        ]);
    }

    private function buildQueueResponse(QueueEntry $entry, Concert $concert, int $httpCode = 200): JsonResponse
    {
        $currentAdmitted = Cache::get("concert_admitted_number_{$concert->id}", 0);
        $position = max(0, $entry->queue_number - $currentAdmitted);
        
        // Estimated wait time (roughly 30 seconds per 10 people in front)
        $estimatedSeconds = (int) ceil(($position / 10) * 30);

        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $entry->session_id,
                'concert_id' => $concert->id,
                'concert_title' => $concert->title,
                'queue_number' => $entry->queue_number,
                'position_in_line' => $position,
                'queue_status' => $entry->status, // 'waiting', 'admitted', 'expired'
                'estimated_wait_seconds' => $entry->status === 'admitted' ? 0 : $estimatedSeconds,
                'estimated_wait_human' => $entry->status === 'admitted' ? 'Ready to purchase!' : ($estimatedSeconds > 60 ? ceil($estimatedSeconds / 60) . ' mins' : $estimatedSeconds . ' secs'),
                'session_expires_at' => $entry->expires_at?->toIso8601String(),
                'remaining_seconds_to_checkout' => $entry->status === 'admitted' && $entry->expires_at ? max(0, now()->diffInSeconds($entry->expires_at, false)) : null,
            ]
        ], $httpCode);
    }
}
