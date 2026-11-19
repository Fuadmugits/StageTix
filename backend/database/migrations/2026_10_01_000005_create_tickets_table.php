<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('tier_name');
            $table->string('seat_number');
            $table->string('holder_name');
            $table->text('qr_code_data');
            $table->enum('status', ['ACTIVE', 'USED', 'EXPIRED'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
