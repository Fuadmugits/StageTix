<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Concert;
use App\Models\TicketTier;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminEventController extends Controller
{
    /**
     * List all concerts / events with stats
     */
    public function index(Request $request): JsonResponse
    {
        $query = Concert::with(['venue', 'ticketTiers']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->orderBy('event_date', 'asc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $events
        ]);
    }

    /**
     * Create a new event with venues and ticket categories
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'genre' => 'nullable|string',
            'status' => 'nullable|in:draft,upcoming,on_sale,sold_out,finished',
            'event_date' => 'required|date',
            'doors_open_time' => 'nullable|string',
            'venue_name' => 'required|string',
            'city' => 'required|string',
            'venue_address' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sales_start_at' => 'nullable|date',
            'sales_end_at' => 'nullable|date',
            'tiers' => 'required|array|min:1',
            'tiers.*.tier_name' => 'required|string', // Regular, VIP, VVIP
            'tiers.*.price' => 'required|numeric|min:0',
            'tiers.*.total_quantity' => 'required|integer|min:1',
            'tiers.*.description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // Find or create venue
            $venue = Venue::firstOrCreate(
                ['name' => $validated['venue_name'], 'city' => $validated['city']],
                ['address' => $validated['venue_address'] ?? '']
            );

            $slug = Str::slug($validated['title']) . '-' . Str::random(5);

            $concert = Concert::create([
                'venue_id' => $venue->id,
                'title' => $validated['title'],
                'slug' => $slug,
                'artist' => $validated['artist'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'] ?? 'Concert',
                'genre' => $validated['genre'] ?? 'Pop',
                'status' => $validated['status'] ?? 'on_sale',
                'event_date' => $validated['event_date'],
                'doors_open_time' => $validated['doors_open_time'] ?? '17:00',
                'venue_name' => $venue->name,
                'city' => $venue->city,
                'image_url' => $validated['image_url'] ?? null,
                'sales_start_at' => $validated['sales_start_at'] ?? now(),
                'sales_end_at' => $validated['sales_end_at'] ?? null,
            ]);

            foreach ($validated['tiers'] as $tierData) {
                TicketTier::create([
                    'concert_id' => $concert->id,
                    'tier_name' => $tierData['tier_name'],
                    'price' => $tierData['price'],
                    'total_quantity' => $tierData['total_quantity'],
                    'available_quantity' => $tierData['total_quantity'],
                    'description' => $tierData['description'] ?? null,
                    'is_active' => true,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Event and ticket categories created successfully.',
                'data' => $concert->load(['venue', 'ticketTiers'])
            ], 201);
        });
    }

    /**
     * Update event status or details
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $concert = Concert::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:draft,upcoming,on_sale,sold_out,finished',
            'event_date' => 'sometimes|date',
            'doors_open_time' => 'nullable|string',
            'sales_start_at' => 'nullable|date',
            'sales_end_at' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $concert->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Event updated successfully.',
            'data' => $concert->load(['venue', 'ticketTiers'])
        ]);
    }

    /**
     * Delete an event
     */
    public function destroy(int $id): JsonResponse
    {
        $concert = Concert::findOrFail($id);
        $concert->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Event deleted successfully.'
        ]);
    }

    /**
     * Manage Venues CRUD
     */
    public function listVenues(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => Venue::withCount('concerts')->get()
        ]);
    }

    public function storeVenue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
            'capacity' => 'nullable|integer',
        ]);

        $venue = Venue::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Venue created successfully.',
            'data' => $venue
        ], 201);
    }
}
