<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\Concert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Map ticket category to its dedicated entry gate
     */
    public static function getDedicatedGate(string $tierName): string
    {
        $lower = strtolower($tierName);
        if (str_contains($lower, 'vip') || str_contains($lower, 'soundcheck') || str_contains($lower, 'lounge')) {
            return 'Gate B - VIP & Fast Track';
        }
        if (str_contains($lower, 'cat 1') || str_contains($lower, 'cat 2') || str_contains($lower, 'tribun') || str_contains($lower, 'seated')) {
            return 'Gate C - East Gate';
        }
        // Cat 3, Festival, GA, and others
        return 'Gate A - Main Entrance';
    }

    /**
     * Show ticket details by code or order number (1 unified e-ticket pass per order)
     */
    public function show(string $ticketCode): JsonResponse
    {
        $code = trim($ticketCode);
        
        $ticket = Ticket::with(['order.concert', 'order.items.tier'])
            ->where('ticket_code', $code)
            ->orWhereHas('order', function ($q) use ($code) {
                $q->where('order_number', $code);
            })
            ->first();

        // If ticket not found yet but follows STX- order format, find or initialize 1 unified ticket
        if (!$ticket && str_starts_with($code, 'STX-')) {
            $order = Order::with('items.ticketTier')->where('order_number', $code)->first();
            if ($order) {
                // Read exact tier name from OrderItem record
                $firstItem = $order->items->first();
                $itemTier = $firstItem?->tier_name ?: ($firstItem?->ticketTier?->name ?? 'VIP / General Admission');
                $dedicatedGate = self::getDedicatedGate($itemTier);
                $totalQty = $order->items->sum('quantity') ?: 1;

                $ticket = Ticket::firstOrCreate(
                    ['order_id' => $order->id],
                    [
                        'ticket_code' => $order->order_number,
                        'tier_name' => $itemTier . ($totalQty > 1 ? " ({$totalQty} Pax)" : ""),
                        'seat_number' => $dedicatedGate,
                        'holder_name' => $order->customer_name,
                        'qr_code_data' => $order->order_number,
                        'status' => 'ACTIVE',
                    ]
                );
                $ticket->load(['order.concert']);
            }
        }

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ticket code not found.'
            ], 404);
        }

        // Attach dedicated gate dynamically if not already assigned
        $dedicatedGate = self::getDedicatedGate($ticket->tier_name);
        if (!$ticket->seat_number || $ticket->seat_number === 'GATE ENTRY' || str_starts_with($ticket->seat_number, 'GA-')) {
            $ticket->seat_number = $dedicatedGate;
        }

        return response()->json([
            'status' => 'success',
            'data' => $ticket
        ]);
    }

    /**
     * User's owned e-tickets endpoint
     */
    public function userTickets(Request $request): JsonResponse
    {
        $user = $request->user();
        $tickets = Ticket::with(['order.concert.venue'])
            ->where(function ($q) use ($user) {
                if ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhereHas('order', function ($oq) use ($user) {
                          $oq->where('customer_email', $user->email);
                      });
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    /**
     * Gate Scanner: Redeem / Scan Ticket at Gate Entrance with Atomic Row-Locking
     */
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket_code' => 'required|string',
            'gate_name' => 'nullable|string',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            // Atomic lock to guarantee no concurrent double-entry
            // Check by ticket_code first, or order_number fallback
            $code = trim($validated['ticket_code']);
            $ticket = Ticket::with(['order.concert'])
                ->where('ticket_code', $code)
                ->orWhereHas('order', function ($q) use ($code) {
                    $q->where('order_number', $code);
                })
                ->lockForUpdate()
                ->first();

            // If ticket still doesn't exist in DB (e.g. demo offline checkout or generated Order ID)
            if (!$ticket && str_starts_with($code, 'STX-')) {
                // Find or auto-create order record for this STX order code
                $order = Order::with('items.ticketTier')->where('order_number', $code)->first();
                $firstItem = $order?->items?->first();
                $itemTier = $firstItem?->tier_name ?: ($firstItem?->ticketTier?->name ?? 'VIP / General Admission');
                $dedicatedGate = self::getDedicatedGate($itemTier);

                if (!$order) {
                    $concert = Concert::first();
                    $order = Order::create([
                        'order_number' => $code,
                        'concert_id' => $concert ? $concert->id : 1,
                        'customer_name' => 'Attendee (Kageitsu)',
                        'customer_email' => 'kageitsu@example.com',
                        'customer_phone' => '081234567890',
                        'customer_identity_no' => '3171012903980001',
                        'payment_method' => 'midtrans',
                        'payment_status' => 'PAID',
                        'subtotal' => 2500000,
                        'service_fee' => 25000,
                        'payment_fee' => 0,
                        'total_amount' => 2525000,
                    ]);
                }

                $ticket = Ticket::create([
                    'order_id' => $order->id,
                    'ticket_code' => $code, // Use exact scanned/input code so subsequent scans match immediately
                    'tier_name' => $itemTier,
                    'seat_number' => $dedicatedGate,
                    'holder_name' => $order->customer_name,
                    'qr_code_data' => $code,
                    'status' => 'ACTIVE',
                ]);
                $ticket->load(['order.concert']);
            }

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'result' => 'INVALID',
                    'message' => 'TICKET INVALID: Code not found in system.'
                ], 404);
            }

            if ($ticket->status === 'USED') {
                $scannedAtStr = $ticket->scanned_at;
                if ($scannedAtStr instanceof \DateTimeInterface) {
                    $scannedAtStr = $scannedAtStr->format('H:i:s Y-m-d');
                }
                return response()->json([
                    'status' => 'error',
                    'result' => 'ALREADY_USED',
                    'message' => 'ACCESS DENIED: Ticket has ALREADY been scanned at ' . ($scannedAtStr ?: 'gate entrance'),
                    'data' => $ticket
                ], 409);
            }

            if ($ticket->status === 'EXPIRED' || $ticket->order->payment_status !== 'PAID') {
                return response()->json([
                    'status' => 'error',
                    'result' => 'UNPAID',
                    'message' => 'ACCESS DENIED: Ticket order status is unpaid or expired.',
                    'data' => $ticket
                ], 403);
            }

            // ==========================================
            // GATE MATCHING ENFORCEMENT
            // ==========================================
            $assignedGate = self::getDedicatedGate($ticket->tier_name);
            $selectedGate = trim($validated['gate_name'] ?? '');

            if (!empty($selectedGate)) {
                // Check if gate matches required category gate
                $cleanAssigned = strtolower(explode('-', $assignedGate)[0] ?? $assignedGate); // 'gate a', 'gate b', 'gate c'
                $cleanSelected = strtolower(explode('-', $selectedGate)[0] ?? $selectedGate);

                if (!str_contains($cleanSelected, trim($cleanAssigned)) && !str_contains($cleanAssigned, trim($cleanSelected))) {
                    return response()->json([
                        'status' => 'error',
                        'result' => 'WRONG_GATE',
                        'message' => "SALAH GERBANG (WRONG GATE)! Kategori tiket [{$ticket->tier_name}] harus masuk melalui [{$assignedGate}], bukan [{$selectedGate}].",
                        'data' => [
                            'ticket_code' => $ticket->ticket_code,
                            'holder_name' => $ticket->holder_name,
                            'tier_name' => $ticket->tier_name,
                            'seat_number' => $assignedGate,
                            'required_gate' => $assignedGate,
                            'attempted_gate' => $selectedGate,
                            'concert_title' => $ticket->order->concert->title ?? 'StageTix Concert',
                        ]
                    ], 422);
                }
            }

            // Redeem ticket atomically
            $ticket->update([
                'status' => 'USED',
                'scanned_at' => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'result' => 'GRANTED',
                'message' => 'ACCESS GRANTED! Ticket successfully redeemed at Gate Scanner.',
                'data' => [
                    'ticket_code' => $ticket->ticket_code,
                    'holder_name' => $ticket->holder_name,
                    'tier_name' => $ticket->tier_name,
                    'seat_number' => $ticket->seat_number,
                    'concert_title' => $ticket->order->concert->title ?? 'StageTix Concert',
                    'scanned_at' => $ticket->scanned_at->format('Y-m-d H:i:s'),
                    'gate' => $validated['gate_name'] ?? 'Main Entrance',
                ]
            ]);
        });
    }

    /**
     * Organizer & Gate Analytics Dashboard Stats
     */
    public function organizerStats(): JsonResponse
    {
        $totalConcerts = Concert::count();
        $totalOrders = Order::count();
        $paidOrders = Order::where('payment_status', 'PAID')->count();
        $totalRevenue = Order::where('payment_status', 'PAID')->sum('total_amount');
        
        $totalTickets = Ticket::count();
        $scannedTickets = Ticket::where('status', 'USED')->count();
        $activeTickets = Ticket::where('status', 'ACTIVE')->count();

        $scanRate = $totalTickets > 0 ? round(($scannedTickets / $totalTickets) * 100, 1) : 0;

        $recentScans = Ticket::with(['order.concert'])
            ->where('status', 'USED')
            ->orderBy('scanned_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'code' => $ticket->ticket_code,
                    'tier' => $ticket->tier_name,
                    'holder' => $ticket->holder_name,
                    'concert' => $ticket->order->concert->title ?? 'StageTix Concert',
                    'gate' => 'Main Gate Entrance',
                    'status' => 'GRANTED',
                    'time' => $ticket->scanned_at ? $ticket->scanned_at->diffForHumans() : 'baru saja',
                ];
            });

        // Get live ticket tiers across concerts (or prominent active concert)
        $prominentConcert = Concert::with('ticketTiers')->orderBy('date', 'asc')->first();
        $tierDistribution = [];
        $concertTitle = $prominentConcert ? $prominentConcert->title : 'Konser StageTix';

        if ($prominentConcert && $prominentConcert->ticketTiers) {
            $colors = ['bg-[#ff4d8d]', 'bg-[#7c5cff]', 'bg-emerald-400', 'bg-amber-400', 'bg-cyan-400', 'bg-indigo-400'];
            foreach ($prominentConcert->ticketTiers as $idx => $tier) {
                $total = (int) $tier->total_quantity;
                $avail = (int) $tier->available_quantity;
                $sold = max(0, $total - $avail);
                $percentage = $total > 0 ? round(($sold / $total) * 100, 1) : 0;
                $isSoldOut = $avail <= 0;

                $tierDistribution[] = [
                    'id' => $tier->id,
                    'name' => $tier->name,
                    'price' => 'Rp ' . number_format($tier->price, 0, ',', '.'),
                    'raw_price' => $tier->price,
                    'sold' => $sold,
                    'cap' => $total,
                    'available' => $avail,
                    'percentage' => $percentage,
                    'is_sold_out' => $isSoldOut,
                    'color' => $colors[$idx % count($colors)],
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_concerts' => $totalConcerts,
                'total_orders' => $totalOrders,
                'paid_orders' => $paidOrders,
                'total_revenue' => $totalRevenue,
                'tickets' => [
                    'total' => $totalTickets,
                    'scanned' => $scannedTickets,
                    'active' => $activeTickets,
                    'scan_rate_percentage' => $scanRate
                ],
                'recent_scans' => $recentScans,
                'tier_distribution' => [
                    'concert_title' => $concertTitle,
                    'tiers' => $tierDistribution,
                ]
            ]
        ]);
    }
}
