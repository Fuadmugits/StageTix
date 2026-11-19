<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Concert;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Support\Str;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $concert = Concert::first();
        if (!$concert) return;

        $order = Order::firstOrCreate(
            ['order_number' => 'STX-SAMPLE-001'],
            [
                'concert_id' => $concert->id,
                'customer_name' => 'Ticket Holder',
                'customer_email' => 'holder@stagetix.test',
                'customer_phone' => '08123456789',
                'customer_identity_no' => '3171012345678901',
                'payment_method' => 'qris',
                'payment_status' => 'PAID',
                'subtotal' => 750000,
                'service_fee' => 10000,
                'payment_fee' => 2000,
                'discount' => 0,
                'total_amount' => 762000,
            ]
        );

        // Seed TCK-GBK-001 (Matching default mock ticket on frontend)
        Ticket::firstOrCreate(
            ['ticket_code' => 'TCK-GBK-001'],
            [
                'order_id' => $order->id,
                'holder_name' => 'Ticket Holder',
                'tier_name' => 'General Admission',
                'seat_number' => 'ENTRY GATE #001',
                'status' => 'ACTIVE',
                'qr_code_data' => 'TCK-GBK-001',
            ]
        );

        // Seed STX-TKT-DEMO123 (Matching "Fill Demo" button in Gate Scanner)
        Ticket::firstOrCreate(
            ['ticket_code' => 'STX-TKT-DEMO123'],
            [
                'order_id' => $order->id,
                'holder_name' => 'Demo Visitor',
                'tier_name' => 'VIP Festival',
                'seat_number' => 'GATE A - #042',
                'status' => 'ACTIVE',
                'qr_code_data' => 'STX-TKT-DEMO123',
            ]
        );
    }
}
