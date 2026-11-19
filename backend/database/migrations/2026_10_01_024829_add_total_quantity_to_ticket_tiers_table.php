<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_tiers', function (Blueprint $table) {
            $table->unsignedBigInteger('total_quantity')->default(0)->after('available_quantity');
        });

        // Backfill: set total_quantity = available_quantity for existing rows
        DB::statement('UPDATE ticket_tiers SET total_quantity = available_quantity');
    }

    public function down(): void
    {
        Schema::table('ticket_tiers', function (Blueprint $table) {
            $table->dropColumn('total_quantity');
        });
    }
};


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ticket_tiers', function (Blueprint $table) {
            //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_tiers', function (Blueprint $table) {
            //
        });
    }
};
