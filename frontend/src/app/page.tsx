'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  Flame, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Ticket, 
  TrendingUp,
  Filter,
  Loader2,
  LogIn,
  UserPlus,
  Star,
  Music,
  ArrowRight,
  QrCode,
  Globe,
  Users,
  CheckCircle2,
  HelpCircle,
  Headphones,
  Calendar,
  MapPin,
  Clock,
  Heart,
  ChevronRight,
  Gift
} from 'lucide-react';
import ConcertCard from '@/components/ConcertCard';
import { concertApi, ApiConcert } from '@/lib/api';
import { Concert } from '@/types';
import { useAuth } from '@/context/AuthContext';

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
    totalStock: c.total_stock,
    remainingStock: c.remaining_stock,
    isSoldOut: c.is_sold_out,
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

export default function LandingPage() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Flash sale timer countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    concertApi.list()
      .then(res => {
        if (!cancelled && res.data?.length > 0) {
          setConcerts(res.data.map(mapApiConcert));
        }
      })
      .catch(() => {
        if (!cancelled) setConcerts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const categories = [
    { id: 'all', label: 'Semua', icon: Music },
    { id: 'pop', label: 'Pop', icon: Headphones },
    { id: 'rock', label: 'Rock', icon: Sparkles },
    { id: 'edm', label: 'EDM', icon: Zap },
    { id: 'jazz', label: 'Jazz', icon: Music },
    { id: 'festival', label: 'Festival', icon: Globe },
    { id: 'indie', label: 'Indie', icon: Star },
    { id: 'kpop', label: 'K-Pop', icon: Flame },
  ];

  const filteredConcerts = selectedCategory === 'all' 
    ? concerts 
    : concerts.filter(c => c.category?.toLowerCase() === selectedCategory);

  const heroConcert = concerts[0] || null;

  return (
    <div className="space-y-16 pb-20">
      
      {/* ═══════════════════════════════════════════════════════
          1. HERO PANORAMIC STADIUM BANNER (PERSIS DI STITCH)
          ═══════════════════════════════════════════════════════ */}
      <section className="container-custom pt-4">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-[#090C12] border border-cyan-500/20 group">
          
          {/* Main Background Image */}
          <div 
            className="relative min-h-[540px] md:min-h-[580px] w-full flex items-end p-6 sm:p-10 md:p-14 bg-cover bg-center transition-transform duration-700"
            style={{ 
              backgroundImage: `url(${heroConcert?.bannerImage || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80'})` 
            }}
          >
            {/* Ambient Dark Gradient Scrims (Cyber Cyan Tint) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Hero Interactive Content */}
            <div className="relative z-10 max-w-3xl flex flex-col gap-5">
              
              {/* Badges & Live Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Presale Dibuka
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#151C2C]/90 text-cyan-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-cyan-500/30">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Live in Jakarta
                </span>
                <span className="px-3.5 py-1 rounded-full bg-cyan-950/60 text-cyan-200 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-cyan-500/20">
                  Tur Musik Terbesar 2026
                </span>
              </div>

              {/* Headline & Tour Title */}
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">Tur Stadion Bersejarah</p>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                  {heroConcert?.title || 'Coldplay: Music of the Spheres'}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                    World Tour Stadium Experience
                  </span>
                </h1>
              </div>

              {/* Meta Grid (Date, Venue, Time) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-slate-300 text-sm">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{heroConcert?.date || '15 November 2026'}</span>
                </div>
                <span className="hidden sm:inline text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-white">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{heroConcert?.venue || 'Gelora Bung Karno Stadium'}, {heroConcert?.city || 'Jakarta'}</span>
                </div>
                <span className="hidden sm:inline text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Open Gate: {heroConcert?.time || '16:00'} WIB</span>
                </div>
              </div>

              {/* Price Callout & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-3 border-t border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Harga Tiket Presale</span>
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
                    Mulai dari Rp{(heroConcert?.minPrice || 1250000).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link 
                    href={`/concert/${heroConcert?.id || 1}`}
                    className="btn-primary px-6 py-3.5 text-sm font-black flex items-center gap-2 shadow-[0_8px_32px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all text-slate-950"
                  >
                    <Ticket className="w-4 h-4" />
                    Beli Tiket Sekarang
                  </Link>
                  <Link 
                    href={`/concert/${heroConcert?.id || 1}`}
                    className="px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-[#151C2C]/80 hover:bg-[#1E273D] border border-slate-700/80 backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. KATEGORI MUSIK CHIPS (PERSIS DI STITCH)
          ═══════════════════════════════════════════════════════ */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Kategori Musik Pilihan</span>
          <span className="text-xs text-slate-400">Menampilkan konser dan festival resmi</span>
        </div>
        
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-105' 
                    : 'bg-[#151C2C] text-slate-300 hover:text-white hover:bg-[#1E273D] border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. SECTION "SEGERA DIMULAI" (4-COLUMN GRID PERSIS STITCH)
          ═══════════════════════════════════════════════════════ */}
      <section id="jadwal-konser" className="container-custom space-y-6 scroll-mt-24">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Waktu Menipis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Segera Dimulai
            </h2>
          </div>
          <Link 
            href="/explore" 
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
          >
            <span>Lihat Semua Konser</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="ml-3 text-sm text-slate-400">Memuat jadwal konser...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredConcerts.slice(0, 4).map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. FLASH SALE / PROMO PAYDAY BANNER (PERSIS DI STITCH)
          ═══════════════════════════════════════════════════════ */}
      <section className="container-custom">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/70 via-[#151C2C] to-[#101522] p-8 md:p-10 shadow-2xl border border-cyan-500/20">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 top-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Promo Header & Information */}
            <div className="flex items-center gap-6 max-w-2xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Promo Kilat
                  </span>
                  <span className="text-slate-400 text-xs font-medium">Gunakan Kode: <strong className="text-cyan-300 font-mono">STAGE2026</strong></span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Flash Sale Tiket Konser Spesial Payday!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Diskon instan <strong className="text-emerald-400 font-bold">10%</strong> untuk setiap transaksi pembelian tiket konser resmi menggunakan Midtrans QRIS atau Virtual Account bank rekanan.
                </p>
              </div>
            </div>

            {/* Urgency Countdown Box & Action */}
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto justify-end">
              <div className="flex items-center gap-2 bg-[#0B0E14]/90 px-6 py-3 rounded-2xl border border-slate-700/80 backdrop-blur-md">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">Jam</span>
                </div>
                <span className="text-lg font-bold text-slate-600 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">Menit</span>
                </div>
                <span className="text-lg font-bold text-slate-600 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">Detik</span>
                </div>
              </div>

              <Link 
                href="/explore"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Gift className="w-4 h-4" />
                <span>Klaim Voucher Sekarang</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. SECTION "POPULER & TRENDING" (4-COLUMN GRID PERSIS STITCH)
          ═══════════════════════════════════════════════════════ */}
      <section className="container-custom space-y-6">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-extrabold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Paling Banyak Dicari</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Populer &amp; Trending
            </h2>
          </div>
          <Link 
            href="/explore" 
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
          >
            <span>Eksplorasi Lineup</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="ml-3 text-sm text-slate-400">Memuat konser trending...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {concerts.slice(0, 8).map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. STATISTIK TRUST & KEUNGGULAN (B2B & B2C TRUST)
          ═══════════════════════════════════════════════════════ */}
      <section id="tentang-stagetix" className="container-custom scroll-mt-24">
        <div className="rounded-3xl p-8 sm:p-12 glass-card border border-cyan-500/20 bg-[#101522]/90 space-y-12">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">50.000+</div>
              <div className="text-xs mt-1 text-slate-400 font-medium">Tiket Terdistribusi Resmi</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">120+</div>
              <div className="text-xs mt-1 text-slate-400 font-medium">Konser &amp; Festival Musik</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">100%</div>
              <div className="text-xs mt-1 text-slate-400 font-medium">Garansi Valid di Scanner Gate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-200">30.000+</div>
              <div className="text-xs mt-1 text-slate-400 font-medium">Penikmat Musik Aktif</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#151C2C] border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Tiket Resmi Terenkripsi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Setiap tiket dilengkapi kode unik dinamis dan sistem *atomic row-locking* di database untuk mencegah calo dan tiket palsu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151C2C] border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Midtrans Snap Checkout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pembayaran otomatis dalam hitungan detik via QRIS semua e-wallet dan Virtual Account bank tanpa repot upload bukti transfer manual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151C2C] border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">E-Tiket Siap Scan di Venue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tunjukkan QR code e-ticket dari ponsel Anda langsung di Scanner Gate petugas untuk check-in secepat 0.5 detik per penonton.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
