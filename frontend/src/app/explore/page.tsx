'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Search, 
  Flame, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Ticket, 
  Filter,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Music,
  CheckCircle2
} from 'lucide-react';
import ConcertCard from '@/components/ConcertCard';
import { concertApi, ApiConcert } from '@/lib/api';
import { Concert } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Map API concert to frontend Concert type
function mapApiConcert(c: ApiConcert): Concert {
  return {
    id: String(c.id),
    slug: c.slug,
    title: c.title,
    artist: c.artist,
    category: c.category as Concert['category'],
    date: c.date,
    time: c.time,
    venue: c.venue,
    city: c.city,
    image: c.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    bannerImage: c.banner_image || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    description: c.description,
    isPopular: c.is_popular,
    isSellingFast: c.is_selling_fast,
    minPrice: c.min_price,
    ticketTiers: (c.ticket_tiers || []).map(t => ({
      id: String(t.id),
      name: t.name,
      price: t.price,
      description: t.description,
      available: t.available_quantity,
      perks: t.perks || [],
    })),
  };
}

export default function ExploreAppPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const categories = ['All', 'Pop', 'Rock', 'EDM', 'Jazz', 'Festival'];

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    concertApi.list({ category: selectedCategory, search: searchQuery })
      .then(res => {
        if (!cancelled) {
          setConcerts(res.data.map(mapApiConcert));
          setApiError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConcerts([]);
          setApiError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedCategory, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat aplikasi StageTix...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const featuredConcert = concerts[0] || null;
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Sobat Musik';

  return (
    <div className="space-y-12 pb-20 pt-4">
      
      {/* APP HEADER & USER GREETING BAR */}
      <section className="container-custom">
        <div className="rounded-2xl p-6 sm:p-7 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Selamat datang kembali, {userName}!
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Temukan jadwal konser terbaru dan pesan tiket resmi tanpa khawatir calo.
              </p>
            </div>

            {/* Quick Access Links */}
            <div className="flex flex-wrap items-center gap-2">
              <Link 
                href="/transactions" 
                className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-2"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Tiket Saya</span>
              </Link>

              <Link 
                href="/profile" 
                className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil</span>
              </Link>

              {isAdmin && (
                <Link 
                  href="/gate-scanner" 
                  className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-2 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Scanner Masuk</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CONCERT SPOTLIGHT */}
      {featuredConcert && (
        <section className="container-custom">
          <div className="rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    Pilihan Utama
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {featuredConcert.venue}, {featuredConcert.city}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {featuredConcert.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                  {featuredConcert.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    <Calendar className="w-4 h-4" />
                    <span>{featuredConcert.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    <Clock className="w-4 h-4" />
                    <span>{featuredConcert.time} WIB</span>
                  </div>
                  <div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Harga mulai</div>
                    <div className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      Rp {featuredConcert.minPrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link 
                    href={`/concert/${featuredConcert.id}`} 
                    className="btn-primary text-xs py-3 px-6 inline-flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Beli Tiket
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-60 lg:h-72 rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <img 
                  src={featuredConcert.bannerImage} 
                  alt={featuredConcert.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <span className="font-medium">{featuredConcert.artist}</span>
                  <span className="text-[11px] font-semibold text-emerald-300">Tiket Resmi</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH & FILTER TOOLBAR */}
      <section className="container-custom">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Music className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                Katalog Konser & Festival Musik
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Pilih konser, tentukan kategori kursi, dan langsung amankan tiketmu.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari konser, artis, atau kota..."
                className="w-full text-xs py-3 pl-10 pr-4 rounded-xl focus:outline-none transition-all shadow-inner"
                style={{ 
                  background: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer`}
                style={
                  selectedCategory === cat
                    ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)', transform: 'scale(1.05)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONCERT GRID */}
      <section className="container-custom">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card h-96 animate-pulse rounded-2xl" style={{ background: 'var(--bg-elevated)' }} />
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl max-w-lg mx-auto" style={{ border: '1px solid var(--border-color)' }}>
            <Music className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tidak ada konser ditemukan</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
              Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
            </p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="btn-secondary text-xs py-2 px-4"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
