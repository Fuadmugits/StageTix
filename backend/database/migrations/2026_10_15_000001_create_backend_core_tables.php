<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend Users table with roles
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('user')->after('email'); // 'user', 'admin', 'gate_staff'
                $table->string('phone')->nullable()->after('role');
            });
        }

        // 2. Venues table
        if (!Schema::hasTable('venues')) {
            Schema::create('venues', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('city');
                $table->text('address')->nullable();
                $table->integer('capacity')->default(10000);
                $table->timestamps();
            });
        }

        // 3. Update Concerts (Events) table with status, venue_id, genre
        if (Schema::hasTable('concerts')) {
            Schema::table('concerts', function (Blueprint $table) {
                if (!Schema::hasColumn('concerts', 'venue_id')) {
                    $table->unsignedBigInteger('venue_id')->nullable()->after('id');
                }
                if (!Schema::hasColumn('concerts', 'genre')) {
                    $table->string('genre')->default('Pop')->after('category');
                }
                if (!Schema::hasColumn('concerts', 'status')) {
                    $table->string('status')->default('on_sale')->after('genre'); // draft, upcoming, on_sale, sold_out, finished
                }
                if (!Schema::hasColumn('concerts', 'sales_start_at')) {
                    $table->dateTime('sales_start_at')->nullable()->after('status');
                }
                if (!Schema::hasColumn('concerts', 'sales_end_at')) {
                    $table->dateTime('sales_end_at')->nullable()->after('sales_start_at');
                }
            });
        }

        // 4. Update Ticket Tiers table with sale start/end
        if (Schema::hasTable('ticket_tiers')) {
            Schema::table('ticket_tiers', function (Blueprint $table) {
                if (!Schema::hasColumn('ticket_tiers', 'sales_start_at')) {
                    $table->dateTime('sales_start_at')->nullable()->after('is_active');
                }
                if (!Schema::hasColumn('ticket_tiers', 'sales_end_at')) {
                    $table->dateTime('sales_end_at')->nullable()->after('sales_start_at');
                }
            });
        }

        // 5. Promos table
        if (!Schema::hasTable('promos')) {
            Schema::create('promos', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('type')->default('percentage'); // 'percentage' or 'fixed'
                $table->decimal('value', 12, 2); // e.g. 10 (%) or 50000 (IDR)
                $table->decimal('min_purchase', 12, 2)->default(0);
                $table->decimal('max_discount', 12, 2)->nullable();
                $table->integer('quota')->default(100);
                $table->integer('used_count')->default(0);
                $table->dateTime('expires_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 6. Payments table (Midtrans / Xendit audit logs & idempotent callbacks)
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->string('transaction_id')->unique()->nullable(); // Midtrans transaction_id
                $table->string('payment_gateway')->default('midtrans'); // 'midtrans' / 'xendit'
                $table->string('payment_type'); // 'qris', 'bank_transfer', 'credit_card', 'cstore'
                $table->decimal('amount', 14, 2);
                $table->string('status'); // 'pending', 'settlement', 'capture', 'expire', 'cancel', 'deny'
                $table->json('raw_response')->nullable();
                $table->string('signature_key')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            });
        }

        // 7. Queue Entries (Virtual Waiting Room)
        if (!Schema::hasTable('queue_entries')) {
            Schema::create('queue_entries', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('concert_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('session_id')->index();
                $table->integer('queue_number');
                $table->string('status')->default('waiting'); // 'waiting', 'admitted', 'expired', 'completed'
                $table->dateTime('admitted_at')->nullable();
                $table->dateTime('expires_at')->nullable(); // 10 minutes session limit
                $table->timestamps();

                $table->foreign('concert_id')->references('id')->on('concerts')->onDelete('cascade');
            });
        }

        // 8. Waitlist table (optional notify when ticket available)
        if (!Schema::hasTable('waitlists')) {
            Schema::create('waitlists', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('concert_id');
                $table->unsignedBigInteger('ticket_tier_id')->nullable();
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('status')->default('pending'); // 'pending', 'notified'
                $table->timestamps();

                $table->foreign('concert_id')->references('id')->on('concerts')->onDelete('cascade');
            });
        }

        // 9. Signed QR & user_id on tickets & orders
        if (Schema::hasTable('tickets') && !Schema::hasColumn('tickets', 'signature')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->string('signature', 64)->nullable()->after('qr_code_data');
                $table->unsignedBigInteger('user_id')->nullable()->after('order_id');
            });
        }

        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'user_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlists');
        Schema::dropIfExists('queue_entries');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('promos');
        Schema::dropIfExists('venues');
    }
};
