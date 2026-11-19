<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('concert_id')->constrained('concerts')->onDelete('cascade');
            $table->string('name');
            $table->unsignedBigInteger('price');
            $table->text('description');
            $table->integer('available_quantity');
            $table->json('perks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_tiers');
    }
};
