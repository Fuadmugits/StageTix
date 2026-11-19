<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\TicketTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentWebhookController extends Controller
{
    /**
     * Handle payment notification webhook from Midtrans / Xendit
     * Implements Signature Verification and Idempotent processing.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        // 1. Determine gateway and extract parameters
        $orderNumber = $payload['order_id'] ?? $payload['external_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? $payload['status'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? $payload['amount'] ?? 0;
        $signatureKey = $payload['signature_key'] ?? $request->header('x-callback-token') ?? null;
        $paymentType = $payload['payment_type'] ?? 'qris';
        $transactionId = $payload['transaction_id'] ?? $payload['id'] ?? ('TXN-' . Str::random(12));

        if (!$orderNumber) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing order_id / external_id in payload.'
            ], 400);
        }

        // 2. Midtrans SHA512 Signature Verification (if server key configured)
        $serverKey = env('MIDTRANS_SERVER_KEY');
        if ($serverKey && $signatureKey && $statusCode && $grossAmount) {
            $expectedSignature = hash('sha512', $orderNumber . $statusCode . $grossAmount . $serverKey);
            if (!hash_equals($expectedSignature, $signatureKey)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid webhook signature verification failed.'
                ], 401);
            }
        }

        // 3. Process Order Status Atomically & Idempotently
        return DB::transaction(function () use ($orderNumber, $transactionStatus, $payload, $transactionId, $paymentType, $grossAmount, $signatureKey) {
            $order = Order::where('order_number', $orderNumber)
                ->lockForUpdate()
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Order {$orderNumber} not found."
                ], 404);
            }

            // IDEMPOTENCY CHECK: If order already PAID and this is a duplicate callback, return 200 OK safely
            if ($order->payment_status === 'PAID') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Order was already processed as PAID previously (Idempotent OK).'
                ], 200);
            }

            // Record Payment Audit Log
            Payment::updateOrCreate(
                ['transaction_id' => $transactionId],
                [
                    'order_id' => $order->id,
                    'payment_gateway' => 'midtrans',
                    'payment_type' => $paymentType,
                    'amount' => (float) $grossAmount ?: $order->total_amount,
                    'status' => $transactionStatus,
                    'raw_response' => $payload,
                    'signature_key' => $signatureKey,
                ]
            );

            // Handle Gateway statuses (Midtrans: capture, settlement, pending, deny, expire, cancel)
            if (in_array($transactionStatus, ['capture', 'settlement', 'PAID', 'COMPLETED'])) {
                // SUCCESS: Mark Order Paid & Generate Signed E-Tickets
                $order->update([
                    'payment_status' => 'PAID',
                ]);

                $this->generateSignedTickets($order);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment settled. Order marked PAID and signed e-tickets generated successfully.'
                ]);
            } elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny', 'FAILED'])) {
                // EXPIRED / FAILED: Release stock back to ticket tier
                $order->update([
                    'payment_status' => 'EXPIRED',
                ]);

                foreach ($order->items as $item) {
                    $tier = TicketTier::where('id', $item->ticket_tier_id)->lockForUpdate()->first();
                    if ($tier) {
                        $tier->increment('available_quantity', $item->quantity);
                        $tier->update(['is_active' => true]);
                    }
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Order marked EXPIRED. Inventory stock released back atomically.'
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => "Payment status updated to {$transactionStatus}."
            ]);
        });
    }

    /**
     * Generate secure signed E-tickets with unique QR hash
     */
    protected function generateSignedTickets(Order $order): void
    {
        $appKey = env('APP_KEY', 'stagetix-secret-key-2026');

        foreach ($order->items as $item) {
            for ($i = 1; $i <= $item->quantity; $i++) {
                $ticketCode = 'TIX-' . strtoupper(Str::random(10));
                
                // Signed QR payload for tamper-proof gate validation: HMAC-SHA256
                $signature = hash_hmac('sha256', $ticketCode . '|' . $order->order_number . '|' . $order->customer_email, $appKey);

                $qrData = json_encode([
                    'ticket_code' => $ticketCode,
                    'order_number' => $order->order_number,
                    'sig' => substr($signature, 0, 16),
                ]);

                Ticket::create([
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'ticket_code' => $ticketCode,
                    'holder_name' => $order->customer_name,
                    'tier_name' => $item->tier->tier_name ?? 'Festival',
                    'seat_number' => 'GA-' . rand(100, 999),
                    'status' => 'ACTIVE',
                    'signature' => $signature,
                    'qr_code_data' => $qrData,
                ]);
            }
        }
    }
}
