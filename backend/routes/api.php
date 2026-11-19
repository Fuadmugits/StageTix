<?php

use App\Http\Controllers\Api\AdminEventController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConcertController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ==========================================
    // 1. AUTHENTICATION (Register, Login, Profile)
    // ==========================================
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/profile', [AuthController::class, 'profile']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // User specific routes
        Route::get('/user/orders', [OrderController::class, 'userOrders']);
        Route::get('/user/tickets', [TicketController::class, 'userTickets']);
    });

    // ==========================================
    // 2. PUBLIC CONCERTS & SEARCH
    // ==========================================
    Route::get('/concerts', [ConcertController::class, 'index']);
    Route::get('/concerts/{idOrSlug}', [ConcertController::class, 'show']);

    // ==========================================
    // 3. VIRTUAL WAITING ROOM / QUEUE
    // ==========================================
    Route::post('/concerts/{concertId}/queue/join', [QueueController::class, 'join']);
    Route::get('/concerts/{concertId}/queue/status', [QueueController::class, 'status']);
    Route::post('/concerts/{concertId}/waitlist', [OrderController::class, 'joinWaitlist']);

    // ==========================================
    // 4. CHECKOUT & ORDERS (15-Min Atomic Hold)
    // ==========================================
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/snap-token', [OrderController::class, 'snapToken']);

    // ==========================================
    // 5. PROMO CODES (Checkout validation)
    // ==========================================
    Route::post('/promos/validate', [PromoController::class, 'validatePromo']);

    // ==========================================
    // 6. PAYMENT WEBHOOK (Midtrans / Xendit Callback)
    // ==========================================
    Route::post('/webhooks/payment', [PaymentWebhookController::class, 'handle']);

    // ==========================================
    // 7. TICKETS & GATE VALIDATION (gate_staff / admin)
    // ==========================================
    Route::get('/tickets/{ticketCode}', [TicketController::class, 'show']);
    Route::post('/gate/scan', [TicketController::class, 'scan']); // Scan QR code atomically

    // ==========================================
    // 8. ADMIN PROTECTED ROUTES (Role: admin)
    // ==========================================
    Route::middleware(['auth:sanctum', RoleMiddleware::class . ':admin'])->prefix('admin')->group(function () {
        // Event CRUD
        Route::get('/events', [AdminEventController::class, 'index']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{id}', [AdminEventController::class, 'update']);
        Route::delete('/events/{id}', [AdminEventController::class, 'destroy']);

        // Venues
        Route::get('/venues', [AdminEventController::class, 'listVenues']);
        Route::post('/venues', [AdminEventController::class, 'storeVenue']);

        // Promos
        Route::get('/promos', [PromoController::class, 'index']);
        Route::post('/promos', [PromoController::class, 'store']);

        // Queue Control
        Route::post('/concerts/{concertId}/queue/admit', [QueueController::class, 'admitBatch']);

        // Reports & Export
        Route::get('/reports/summary', [AdminReportController::class, 'salesSummary']);
        Route::get('/reports/export-csv', [AdminReportController::class, 'exportCsv']);
    });

    // Organizer Dashboard Metrics (public or protected view)
    Route::get('/organizer/stats', [TicketController::class, 'organizerStats']);
});
