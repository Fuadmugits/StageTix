<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Concert;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    /**
     * Comprehensive revenue and sales report
     */
    public function salesSummary(): JsonResponse
    {
        $totalRevenue = Order::where('payment_status', 'PAID')->sum('total_amount');
        $totalOrdersPaid = Order::where('payment_status', 'PAID')->count();
        $totalTicketsSold = Ticket::count();

        // Tickets sold per event and tier
        $concertSales = Concert::with(['ticketTiers'])
            ->get()
            ->map(function ($concert) {
                $tiers = $concert->ticketTiers->map(function ($tier) {
                    $sold = $tier->total_quantity - $tier->available_quantity;
                    return [
                        'tier_name' => $tier->tier_name,
                        'price' => $tier->price,
                        'total_quantity' => $tier->total_quantity,
                        'sold_quantity' => max(0, $sold),
                        'remaining_quantity' => $tier->available_quantity,
                        'tier_revenue' => max(0, $sold) * $tier->price,
                    ];
                });

                return [
                    'concert_id' => $concert->id,
                    'title' => $concert->title,
                    'city' => $concert->city,
                    'event_date' => $concert->event_date,
                    'status' => $concert->status,
                    'tiers' => $tiers,
                    'total_concert_revenue' => $tiers->sum('tier_revenue'),
                ];
            });

        // Sales per day (last 14 days)
        $dailySales = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as daily_revenue')
            )
            ->where('payment_status', 'PAID')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->take(14)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders_paid' => $totalOrdersPaid,
                'total_tickets_sold' => $totalTicketsSold,
                'daily_sales' => $dailySales,
                'concert_sales' => $concertSales,
            ]
        ]);
    }

    /**
     * Export Orders and Ticket Sales to CSV
     */
    public function exportCsv(): StreamedResponse
    {
        $fileName = 'stagetix_orders_export_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            
            // Header baris CSV
            fputcsv($handle, [
                'Order ID',
                'Order Number',
                'Concert Title',
                'Customer Name',
                'Customer Email',
                'Customer Phone',
                'Identity No',
                'Payment Method',
                'Payment Status',
                'Subtotal',
                'Service Fee',
                'Payment Fee',
                'Discount',
                'Total Amount',
                'Order Date'
            ]);

            Order::with('concert')->chunk(100, function ($orders) use ($handle) {
                foreach ($orders as $order) {
                    fputcsv($handle, [
                        $order->id,
                        $order->order_number,
                        $order->concert->title ?? 'N/A',
                        $order->customer_name,
                        $order->customer_email,
                        $order->customer_phone,
                        $order->customer_identity_no,
                        $order->payment_method,
                        $order->payment_status,
                        $order->subtotal,
                        $order->service_fee,
                        $order->payment_fee,
                        $order->discount,
                        $order->total_amount,
                        $order->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
