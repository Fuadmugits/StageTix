<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concerts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('artist');
            $table->enum('category', ['Pop', 'Rock', 'EDM', 'Jazz', 'K-Pop', 'Festival'])->default('Pop');
            $table->date('date');
            $table->string('time');
            $table->string('venue');
            $table->string('city');
            $table->text('image');
            $table->text('banner_image');
            $table->longText('description');
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_selling_fast')->default(false);
            $table->unsignedBigInteger('min_price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concerts');
    }
};
