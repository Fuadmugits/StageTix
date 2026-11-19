<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('concert_id')->constrained('concerts')->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('customer_identity_no');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('service_fee');
            $table->unsignedBigInteger('payment_fee');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('total_amount');
            $table->string('payment_method');
            $table->enum('payment_status', ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'])->default('PENDING');
            $table->string('virtual_account_no')->nullable();
            $table->text('qr_code_url')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
