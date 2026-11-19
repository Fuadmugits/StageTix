<?php

namespace Database\Seeders;

use App\Models\Concert;
use App\Models\Promo;
use App\Models\TicketTier;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ConcertSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles & Users
        User::firstOrCreate(
            ['email' => 'admin@stagetix.com'],
            [
                'name' => 'StageTix Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '081100000001',
            ]
        );

        User::firstOrCreate(
            ['email' => 'gate@stagetix.com'],
            [
                'name' => 'Gate Entrance Officer',
                'password' => Hash::make('password123'),
                'role' => 'gate_staff',
                'phone' => '081100000002',
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@stagetix.com'],
            [
                'name' => 'Concert Goer',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567890',
            ]
        );

        // 2. Seed Venues
        $gbk = Venue::firstOrCreate(
            ['name' => 'Gelora Bung Karno Stadium', 'city' => 'Jakarta'],
            ['address' => 'Jl. Pintu Satu Senayan, Gelora, Jakarta Pusat', 'capacity' => 78000]
        );

        $iceBsd = Venue::firstOrCreate(
            ['name' => 'ICE BSD City Hall 5-6', 'city' => 'Tangerang'],
            ['address' => 'Jl. BSD Grand Boulevard, Tangerang', 'capacity' => 15000]
        );

        // 3. Seed Promos
        Promo::firstOrCreate(
            ['code' => 'STAGE2026'],
            [
                'type' => 'percentage',
                'value' => 10,
                'min_purchase' => 500000,
                'max_discount' => 200000,
                'quota' => 500,
                'used_count' => 12,
                'is_active' => true,
            ]
        );

        Promo::firstOrCreate(
            ['code' => 'HEMAT50K'],
            [
                'type' => 'fixed',
                'value' => 50000,
                'min_purchase' => 300000,
                'quota' => 250,
                'used_count' => 5,
                'is_active' => true,
            ]
        );

        // 4. Seed Concert Events with Ticket Categories
        $concertData = [
            [
                'title' => 'Coldplay: Music of the Spheres World Tour 2026',
                'slug' => 'coldplay-music-of-the-spheres-2026',
                'artist' => 'Coldplay',
                'description' => 'The legendary British rock band returns to Jakarta with immersive LED wristbands and sustainable energy kinetic dance floors.',
                'venue_id' => $gbk->id,
                'venue' => $gbk->name,
                'city' => $gbk->city,
                'category' => 'Rock',
                'genre' => 'Alternative Rock',
                'status' => 'on_sale',
                'date' => '2026-11-15',
                'time' => '16:00',
                'image' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
                'banner_image' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
                'min_price' => 1250000,
                'is_popular' => true,
                'is_selling_fast' => true,
                'tiers' => [
                    ['tier_name' => 'Cat 3 (Restricted View)', 'price' => 1250000, 'total' => 2500, 'available' => 450],
                    ['tier_name' => 'Cat 2 (Numbered Seating)', 'price' => 2500000, 'total' => 4000, 'available' => 1200],
                    ['tier_name' => 'Festival (Free Standing)', 'price' => 3500000, 'total' => 8000, 'available' => 2100],
                    ['tier_name' => 'VIP Ultimate Experience', 'price' => 8500000, 'total' => 500, 'available' => 85],
                ]
            ],
            [
                'title' => 'Taylor Swift: The Eras Tour Encore Asia',
                'slug' => 'taylor-swift-the-eras-tour-encore',
                'artist' => 'Taylor Swift',
                'description' => 'A three-hour journey through musical eras, featuring spectacular stage visuals, acoustic sets, and costume changes.',
                'venue_id' => $gbk->id,
                'venue' => $gbk->name,
                'city' => $gbk->city,
                'category' => 'Pop',
                'genre' => 'Pop',
                'status' => 'on_sale',
                'date' => '2026-12-05',
                'time' => '15:30',
                'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
                'banner_image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
                'min_price' => 1500000,
                'is_popular' => true,
                'is_selling_fast' => true,
                'tiers' => [
                    ['tier_name' => 'Cat 4 (Upper Deck)', 'price' => 1500000, 'total' => 3000, 'available' => 320],
                    ['tier_name' => 'Cat 1 Seating', 'price' => 3800000, 'total' => 4500, 'available' => 640],
                    ['tier_name' => 'Front Field Floor VIP', 'price' => 9900000, 'total' => 800, 'available' => 45],
                ]
            ],
            [
                'title' => 'Wave to Earth: The Play Tour Jakarta',
                'slug' => 'wave-to-earth-play-tour',
                'artist' => 'Wave to Earth',
                'description' => 'South Korean indie jazz-pop trio performing their mellow, nostalgic melodies for intimate fans.',
                'venue_id' => $iceBsd->id,
                'venue' => $iceBsd->name,
                'city' => $iceBsd->city,
                'category' => 'Jazz',
                'genre' => 'Indie',
                'status' => 'on_sale',
                'date' => '2026-10-30',
                'time' => '18:00',
                'image' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
                'banner_image' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
                'min_price' => 850000,
                'is_popular' => false,
                'is_selling_fast' => true,
                'tiers' => [
                    ['tier_name' => 'General Admission', 'price' => 850000, 'total' => 3500, 'available' => 1200],
                    ['tier_name' => 'VIP Soundcheck Package', 'price' => 2300000, 'total' => 300, 'available' => 0], // Sold out demonstration
                ]
            ],
        ];

        foreach ($concertData as $c) {
            $concert = Concert::updateOrCreate(
                ['slug' => $c['slug']],
                [
                    'venue_id' => $c['venue_id'],
                    'title' => $c['title'],
                    'artist' => $c['artist'],
                    'description' => $c['description'],
                    'category' => $c['category'],
                    'genre' => $c['genre'],
                    'status' => $c['status'],
                    'date' => $c['date'],
                    'time' => $c['time'],
                    'venue' => $c['venue'],
                    'city' => $c['city'],
                    'image' => $c['image'],
                    'banner_image' => $c['banner_image'],
                    'min_price' => $c['min_price'],
                    'is_popular' => $c['is_popular'],
                    'is_selling_fast' => $c['is_selling_fast'],
                    'sales_start_at' => now()->subDays(5),
                    'sales_end_at' => now()->addDays(60),
                ]
            );

            foreach ($c['tiers'] as $tier) {
                TicketTier::updateOrCreate(
                    [
                        'concert_id' => $concert->id,
                        'name' => $tier['tier_name']
                    ],
                    [
                        'price' => $tier['price'],
                        'total_quantity' => $tier['total'],
                        'available_quantity' => $tier['available'],
                        'description' => 'Official verified ticket tier for ' . $concert->title,
                    ]
                );
            }
        }
    }
}
