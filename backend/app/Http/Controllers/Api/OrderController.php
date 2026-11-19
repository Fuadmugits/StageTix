<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Concert;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Promo;
use App\Models\TicketTier;
use App\Models\Waitlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Atomic Checkout with Stock Locking & 15-Minute Expiry Window
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'concert_id' => 'required|exists:concerts,id',
            'ticket_tier_id' => 'required|exists:ticket_tiers,id',
            'quantity' => 'required|integer|min:1|max:4', // Requirement: Max 4 tickets per user/order
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_identity_no' => 'required|string|max:30',
            'payment_method' => 'required|string',
            'promo_code' => 'nullable|string',
        ]);

        $userId = $request->user()?->id;

        // Anti-Scalping Rule: Limit max 4 tickets per user per event
        if ($userId) {
            $userExistingTickets = Order::where('user_id', $userId)
                ->where('concert_id', $validated['concert_id'])
                ->whereIn('payment_status', ['PENDING', 'PAID'])
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->sum('order_items.quantity');

            if (($userExistingTickets + $validated['quantity']) > 4) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Limit reached: Maximum 4 tickets allowed per user for this concert. You already hold {$userExistingTickets} tickets."
                ], 422);
            }
        }

        return DB::transaction(function () use ($validated, $userId) {
            // High Concurrency: Pessimistic Row Locking to prevent race conditions & overbooking
            $tier = TicketTier::where('id', $validated['ticket_tier_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($tier->available_quantity < $validated['quantity']) {
                // If stock reaches 0, update event status
                if ($tier->available_quantity <= 0) {
                    $tier->update(['is_active' => false]);
                }

                return response()->json([
                    'status' => 'error',
                    'message' => 'Requested ticket quantity exceeds remaining available seats. Ticket category is sold out or low on stock.',
                    'available_stock' => $tier->available_quantity
                ], 422);
            }

            // ATOMIC STOCK HOLD: decrement stock immediately
            $tier->decrement('available_quantity', $validated['quantity']);

            // Auto set tier inactive if stock reaches 0
            if ($tier->fresh()->available_quantity === 0) {
                $tier->update(['is_active' => false]);
            }

            $subtotal = $tier->price * $validated['quantity'];
            $serviceFee = 25000 * $validated['quantity'];
            
            // Payment method fee
            $paymentFee = match ($validated['payment_method']) {
                'qris' => 0,
                'credit_card' => (int) round(($subtotal * 2.9) / 100),
                'alfamart' => 5000,
                default => 4500, // Virtual Account
            };

            // Calculate Promo Discount
            $discount = 0;
            if (!empty($validated['promo_code'])) {
                $promo = Promo::where('code', strtoupper($validated['promo_code']))
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->first();

                if ($promo && $promo->isValidForAmount($subtotal)) {
                    $discount = (int) $promo->calculateDiscount($subtotal);
                    $promo->increment('used_count');
                }
            }

            $totalAmount = max(0, $subtotal + $serviceFee + $paymentFee - $discount);
            $orderNumber = 'STX-' . strtoupper(Str::random(10));

            // Create Order with HOLD status & 15-Minute Expiry
            $order = Order::create([
                'user_id' => $userId,
                'concert_id' => $validated['concert_id'],
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_identity_no' => $validated['customer_identity_no'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'PENDING',
                'subtotal' => $subtotal,
                'service_fee' => $serviceFee,
                'payment_fee' => $paymentFee,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'virtual_account_no' => in_array($validated['payment_method'], ['bca_va', 'bni_va', 'bri_va', 'mandiri_va']) ? '8800' . rand(1000000000, 9999999999) : null,
                'qr_code_url' => $validated['payment_method'] === 'qris' ? 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=STAGETIX-' . $orderNumber : null,
                'expires_at' => now()->addMinutes(15), // HOLD STOCK FOR EXACTLY 15 MINUTES
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'ticket_tier_id' => $tier->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $tier->price,
                'subtotal' => $subtotal,
            ]);

            // Request Midtrans Snap Token if Server Key is configured
            $snapToken = null;
            $serverKey = env('MIDTRANS_SERVER_KEY');
            if ($serverKey && str_starts_with($serverKey, 'SB-Mid-server-')) {
                try {
                    $midtransPayload = [
                        'transaction_details' => [
                            'order_id' => $orderNumber,
                            'gross_amount' => $totalAmount,
                        ],
                        'customer_details' => [
                            'first_name' => $validated['customer_name'],
                            'email' => $validated['customer_email'],
                            'phone' => $validated['customer_phone'],
                        ],
                        'item_details' => [
                            [
                                'id' => 'TIER-' . $tier->id,
                                'price' => $tier->price,
                                'quantity' => $validated['quantity'],
                                'name' => mb_substr($tier->name, 0, 50),
                            ],
                            [
                                'id' => 'FEE',
                                'price' => $serviceFee + $paymentFee - $discount,
                                'quantity' => 1,
                                'name' => 'Biaya Layanan & Pembayaran',
                            ]
                        ]
                    ];

                    $authHeader = 'Basic ' . base64_encode($serverKey . ':');
                    $response = \Illuminate\Support\Facades\Http::withHeaders([
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                        'Authorization' => $authHeader,
                    ])->post('https://app.sandbox.midtrans.com/snap/v1/transactions', $midtransPayload);

                    if ($response->successful()) {
                        $snapData = $response->json();
                        $snapToken = $snapData['token'] ?? null;
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Midtrans Snap creation error: ' . $e->getMessage());
                }
            }

            $orderData = $order->load(['concert', 'items.tier'])->toArray();
            $orderData['snap_token'] = $snapToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Order created and stock held for 15 minutes. Please complete payment before expiry.',
                'data' => $orderData
            ], 201);
        });
    }

    /**
     * Create or retrieve Snap Token for an existing order
     */
    public function snapToken(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with(['items.tier', 'concert'])->where('order_number', $orderNumber)->firstOrFail();

        $serverKey = env('MIDTRANS_SERVER_KEY');
        if (!$serverKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Midtrans server key is not configured.'
            ], 500);
        }

        try {
            $midtransPayload = [
                'transaction_details' => [
                    'order_id' => $order->order_number . '-' . time(), // ensure fresh transaction id for midtrans
                    'gross_amount' => (int) $order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone ?? '081234567890',
                ],
                'item_details' => [
                    [
                        'id' => 'ORDER-' . $order->id,
                        'price' => (int) $order->total_amount,
                        'quantity' => 1,
                        'name' => mb_substr($order->concert->title ?? 'Tiket Konser StageTix', 0, 50),
                    ]
                ]
            ];

            $authHeader = 'Basic ' . base64_encode($serverKey . ':');
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => $authHeader,
            ])->post('https://app.sandbox.midtrans.com/snap/v1/transactions', $midtransPayload);

            if ($response->successful()) {
                $snapData = $response->json();
                return response()->json([
                    'status' => 'success',
                    'token' => $snapData['token'],
                    'redirect_url' => $snapData['redirect_url'] ?? null
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create Snap token',
                'midtrans_response' => $response->json()
            ], $response->status());
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show Order details & auto-expire check
     */
    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::with(['concert.venue', 'items.tier'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Check if 15-minute hold expired
        if ($order->payment_status === 'PENDING' && $order->expires_at && $order->expires_at->isPast()) {
            $this->releaseOrderStock($order);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    /**
     * User's Order history
     */
    public function userOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $orders = Order::with(['concert', 'items.tier', 'tickets'])
            ->where(function ($q) use ($user) {
                if ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('customer_email', $user->email);
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Waitlist registration when category is sold out
     */
    public function joinWaitlist(Request $request, int $concertId): JsonResponse
    {
        $validated = $request->validate([
            'ticket_tier_id' => 'nullable|exists:ticket_tiers,id',
            'email' => 'required|email',
            'phone' => 'nullable|string',
        ]);

        $waitlist = Waitlist::create([
            'concert_id' => $concertId,
            'ticket_tier_id' => $validated['ticket_tier_id'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'You have joined the waitlist! We will notify you if tickets become available.',
            'data' => $waitlist
        ], 201);
    }

    /**
     * Internal helper: Release stock back if order expires
     */
    protected function releaseOrderStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update(['payment_status' => 'EXPIRED']);

            foreach ($order->items as $item) {
                $tier = TicketTier::where('id', $item->ticket_tier_id)->lockForUpdate()->first();
                if ($tier) {
                    $tier->increment('available_quantity', $item->quantity);
                    $tier->update(['is_active' => true]);
                }
            }
        });
    }
}
