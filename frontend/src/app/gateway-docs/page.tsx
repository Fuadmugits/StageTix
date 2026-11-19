'use client';

import React from 'react';
import Link from 'next/link';
import { Code, Server, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function GatewayDocsPage() {
  return (
    <div className="py-10 pb-24 space-y-10">
      <div className="container-custom max-w-4xl space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/" className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Application
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Server className="w-4 h-4" />
            Laravel 11 REST API Spec
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Laravel Backend Integration Blueprint
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            This StageTix Next.js frontend is designed to seamlessly integrate with your Laravel backend API. Below is the API schema for endpoints, webhooks, and database migrations.
          </p>
        </div>

        {/* API Endpoint 1: Create Order */}
        <div className="glass-card p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
              POST /api/v1/orders/checkout
            </span>
            <span className="text-xs text-slate-400">Creates pending order & reserves seat tier</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300">
{`// JSON Request Payload
{
  "concert_id": "c1",
  "ticket_tier_id": "t1-2",
  "quantity": 2,
  "customer_name": "Rian Pratama",
  "customer_email": "rian.pratama@gmail.com",
  "customer_phone": "081234567890",
  "customer_identity_no": "3171012903980001",
  "payment_method": "qris" // 'qris', 'bca_va', 'mandiri_va', 'credit_card'
}`}
          </div>
        </div>

        {/* API Endpoint 2: Payment Webhook */}
        <div className="glass-card p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
              POST /api/v1/webhooks/payment
            </span>
            <span className="text-xs text-slate-400">Payment Gateway IPN / Webhook Handler</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300">
{`// Webhook Handler in Laravel PaymentController.php
public function handleWebhook(Request $request) {
    $signature = $request->header('X-Signature');
    $orderId = $request->input('order_id');
    $transactionStatus = $request->input('transaction_status');

    if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
        $order = Order::where('order_number', $orderId)->firstOrFail();
        $order->update(['status' => 'PAID']);
        
        // Auto-generate ticket PDF and send email notification
        Ticket::generateTicketsForOrder($order);
    }
    return response()->json(['status' => 'success']);
}`}
          </div>
        </div>

        {/* Recommended Database Migrations */}
        <div className="glass-card p-6 space-y-4 border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-[#00f5d4]" />
            Recommended Database Tables (Laravel Eloquent)
          </h3>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">concerts:</strong> id, slug, title, artist, date, venue, min_price, is_selling_fast, image</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">ticket_tiers:</strong> id, concert_id, name, price, available_quantity, perks</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">orders:</strong> id, order_number, customer_name, customer_email, total_amount, payment_method, status (PENDING, PAID, CANCELLED)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">tickets:</strong> id, order_id, ticket_code, qr_code_path, seat_number, status</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
