<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Concert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConcertController extends Controller
{
    /**
     * Public endpoint: List events with search and filters (city, date, genre)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Concert::with(['venueDetail', 'ticketTiers']);

        // Search by artist name, title, or venue
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('artist', 'like', "%{$search}%")
                  ->orWhere('venue_name', 'like', "%{$search}%");
            });
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        // Filter by date (upcoming or specific date)
        if ($request->filled('date')) {
            $query->whereDate('event_date', $request->date);
        }

        // Filter by genre
        if ($request->filled('genre')) {
            $query->where('genre', $request->genre);
        }

        // Filter by event status (default show on_sale & upcoming)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['on_sale', 'upcoming', 'sold_out']);
        }

        $concerts = $query->orderBy('event_date', 'asc')->get();

        // Calculate live remaining stock summary
        $concerts->transform(function ($concert) {
            $totalStock = $concert->ticketTiers->sum('total_quantity');
            $remainingStock = $concert->ticketTiers->sum('available_quantity');
            $concert->total_stock = $totalStock;
            $concert->remaining_stock = $remainingStock;
            $concert->is_sold_out = $remainingStock <= 0;
            return $concert;
        });

        return response()->json([
            'status' => 'success',
            'data' => $concerts
        ]);
    }

    /**
     * Public endpoint: Event detail with live ticket categories & stock
     */
    public function show(string $idOrSlug): JsonResponse
    {
        $concert = Concert::with(['venueDetail', 'ticketTiers'])
            ->where('id', $idOrSlug)
            ->orWhere('slug', $idOrSlug)
            ->firstOrFail();

        $totalRemaining = $concert->ticketTiers->sum('available_quantity');
        $concert->total_remaining_stock = $totalRemaining;
        $concert->is_sold_out = $totalRemaining <= 0;

        return response()->json([
            'status' => 'success',
            'data' => $concert
        ]);
    }
}
