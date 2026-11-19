'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Flame, 
  Sparkles,
  CreditCard,
  Loader2,
  Users,
  Timer,
  AlertCircle
} from 'lucide-react';
import { concertApi, queueApi, ApiConcert, ApiQueueStatus } from '@/lib/api';
import { Concert, TicketTier } from '@/types';
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

export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [loadingConcert, setLoadingConcert] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Queue state for high-demand ticket sales
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueData, setQueueData] = useState<ApiQueueStatus | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

  // Polling queue status
  useEffect(() => {
    if (!queueModalOpen || !queueData?.session_id || queueData.queue_status === 'admitted' || queueData.queue_status === 'expired') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await queueApi.getStatus(resolvedParams.id, queueData.session_id);
        if (res.data) {
          setQueueData(res.data);
          if (res.data.queue_status === 'admitted') {
            // Success admitted: directly proceed to checkout after 1.5s
            setTimeout(() => {
              proceedWithOrderData();
            }, 1200);
          }
        }
      } catch (err: any) {
        console.error('Queue poll error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [queueModalOpen, queueData?.session_id, queueData?.queue_status, resolvedParams.id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Fetch real concert from API
  useEffect(() => {
    setLoadingConcert(true);
    concertApi.get(resolvedParams.id)
      .then(res => {
        if (res.data) {
          const mapped = mapApiConcert(res.data);
          setConcert(mapped);
          if (mapped.ticketTiers.length > 0) {
            setSelectedTier(mapped.ticketTiers[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed fetching concert:', err);
        setConcert(null);
      })
      .finally(() => {
        setLoadingConcert(false);
      });
  }, [resolvedParams.id]);

  // Show loading while checking auth or concert
  if (authLoading || !user || loadingConcert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="ml-3 text-sm" style={{ color: 'var(--text-muted)' }}>Memuat detail konser...</span>
      </div>
    );
  }

  if (!concert || !selectedTier) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Konser Tidak Ditemukan</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Konser yang Anda cari mungkin telah berakhir atau tidak tersedia.</p>
        <Link href="/explore" className="btn-primary text-xs py-2 px-5 mt-2">
          Kembali ke Jelajah Konser
        </Link>
      </div>
    );
  }

  const subtotal = selectedTier.price * quantity;
  const serviceFee = 25000 * quantity;
  const grandTotal = subtotal + serviceFee;

  const proceedWithOrderData = () => {
    const orderData = {
      concertId: concert.id,
      concertTitle: concert.title,
      concertImage: concert.image,
      concertDate: concert.date,
      concertVenue: `${concert.venue}, ${concert.city}`,
      items: [
        {
          tierId: selectedTier.id,
          tierName: selectedTier.name,
          price: selectedTier.price,
          quantity: quantity
        }
      ],
      subtotal,
      serviceFee,
      total: grandTotal,
      queueNumber: queueData?.queue_number || null,
      queueSessionId: queueData?.session_id || null
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('stagetix_draft_order', JSON.stringify(orderData));
    }

    router.push('/checkout');
  };

  const handleProceedToCheckout = async () => {
    setQueueLoading(true);
    setQueueError(null);
    setQueueModalOpen(true);

    try {
      // Get existing session id if any
      const existingSession = typeof window !== 'undefined' ? localStorage.getItem(`stagetix_queue_${concert.id}`) : null;
      const res = await queueApi.join(concert.id, existingSession || undefined);
      
      if (res.data) {
        setQueueData(res.data);
        if (typeof window !== 'undefined' && res.data.session_id) {
          localStorage.setItem(`stagetix_queue_${concert.id}`, res.data.session_id);
        }

        // If directly admitted, go straight to checkout!
        if (res.data.queue_status === 'admitted') {
          setTimeout(() => {
            proceedWithOrderData();
          }, 1000);
        }
      }
    } catch (err: any) {
      console.warn('Queue join offline/fallback, bypassing queue directly:', err);
      // Fallback: if backend queue unavailable, proceed normally
      proceedWithOrderData();
    } finally {
      setQueueLoading(false);
    }
  };

  return (
    <div className="pb-16 space-y-10">
      {/* Top Banner Hero */}
      <div className="relative h-80 sm:h-[420px] w-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <img 
          src={concert.bannerImage} 
          alt={concert.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-main), transparent 70%)' }} />

        <div className="absolute top-6 left-6 z-20">
          <Link href="/explore" className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Jelajah Konser
          </Link>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="container-custom">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-primary">{concert.category}</span>
              {concert.isSellingFast && (
                <span className="badge badge-warning">
                  <Flame className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} /> Selling Fast
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {concert.title}
            </h1>
            <p className="text-base font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
              Presented by {concert.artist}
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Event Overview & Ticket Tier Selection */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Details Bar */}
            <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{concert.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Showtime</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{concert.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Venue</div>
                  <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{concert.venue}</div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="glass-card p-6 sm:p-8 space-y-4" style={{ border: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                About the Event
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {concert.description}
              </p>
            </div>

            {/* Ticket Tier Options */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Ticket className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Select Ticket Tier
              </h2>

              <div className="space-y-4">
                {concert.ticketTiers.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className="glass-card p-6 cursor-pointer transition-all rounded-2xl"
                      style={
                        isSelected
                          ? { border: '2px solid var(--accent)', background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-md)' }
                          : { border: '1px solid var(--border-color)', background: 'var(--bg-card)' }
                      }
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                              style={
                                isSelected 
                                  ? { borderColor: 'var(--accent)', background: 'var(--accent)' }
                                  : { borderColor: 'var(--border-highlight)' }
                              }
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{tier.name}</h3>
                          </div>
                          <p className="text-xs pl-8" style={{ color: 'var(--text-muted)' }}>{tier.description}</p>
                          
                          {/* Perks */}
                          <div className="pl-8 flex flex-wrap gap-2 pt-1">
                            {tier.perks.map((perk, idx) => (
                              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                ✓ {perk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                            Rp {tier.price.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {tier.available} tickets left
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Trigger */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 glass-card p-6 space-y-6 shadow-2xl" style={{ border: '1px solid var(--border-color)' }}>
              <h3 className="text-lg font-bold pb-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                Booking Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Selected Tier</div>
                  <div className="font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedTier.name}</div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                  <div className="flex items-center gap-3 rounded-xl p-1" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-base px-2" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(4, quantity + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Ticket Price ({quantity}x)</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Service & Processing Fee</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rp {serviceFee.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-end" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Grand Total</div>
                    <div className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleProceedToCheckout}
                  disabled={queueLoading}
                  className="btn-primary w-full py-3.5 text-base mt-4 font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {queueLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memasuki Antrean Tiket...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Beli Tiket &amp; Masuk Antrean</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  <span>Sistem Antrean Adil &amp; Penguncian Kursi 15 Menit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          VIRTUAL WAITING ROOM / MODAL ANTREAN TIKET RESMI
          ══════════════════════════════════════════════════════════════════ */}
      {queueModalOpen && queueData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="glass-card max-w-md w-full p-8 rounded-3xl relative overflow-hidden shadow-2xl border space-y-6 text-center animate-in fade-in zoom-in duration-200" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            
            {/* Top Status Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
              background: queueData.queue_status === 'admitted' ? 'var(--success-subtle)' : 'var(--accent-subtle)',
              color: queueData.queue_status === 'admitted' ? 'var(--success)' : 'var(--accent)',
              border: '1px solid var(--border-highlight)'
            }}>
              {queueData.queue_status === 'admitted' ? (
                <Check className="w-8 h-8 stroke-[3]" />
              ) : (
                <Timer className="w-8 h-8 animate-pulse" />
              )}
            </div>

            {/* Title & Concert Info */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block mb-1" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--accent)' }}>
                {queueData.queue_status === 'admitted' ? 'Giliran Anda Tiba!' : 'Virtual Waiting Room'}
              </span>
              <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {queueData.queue_status === 'admitted' ? 'Silakan Masuk ke Checkout' : 'Anda Sedang Dalam Antrean'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {concert.title} • {selectedTier.name} ({quantity} Tiket)
              </p>
            </div>

            {/* Nomor Antrean Box */}
            <div className="p-6 rounded-2xl border space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-highlight)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Nomor Antrean Anda
              </div>
              <div className="text-5xl font-black font-mono tracking-tight" style={{ color: 'var(--accent)' }}>
                #{queueData.queue_number.toLocaleString('id-ID')}
              </div>
              
              {queueData.queue_status === 'waiting' && (
                <div className="pt-2 flex items-center justify-center gap-4 text-xs font-medium border-t mt-3" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span>Sisa di depan: <strong style={{ color: 'var(--text-primary)' }}>{queueData.position_in_line} orang</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span>Estimasi: <strong style={{ color: 'var(--text-primary)' }}>{queueData.estimated_wait_human}</strong></span>
                  </div>
                </div>
              )}

              {queueData.queue_status === 'admitted' && (
                <div className="text-xs font-semibold py-1" style={{ color: 'var(--success)' }}>
                  Sesi checkout Anda aktif selama 10 menit. Mengalihkan ke pembayaran...
                </div>
              )}
            </div>

            {/* Waiting animation bar */}
            {queueData.queue_status === 'waiting' && (
              <div className="space-y-3">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full animate-pulse transition-all duration-500" style={{ width: `${Math.max(10, 100 - (queueData.position_in_line * 2))}%`, background: 'var(--accent)' }}></div>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Mohon jangan tutup atau refresh halaman ini. Sistem secara otomatis memperbarui antrean Anda setiap beberapa detik.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2">
              {queueData.queue_status === 'admitted' ? (
                <button
                  onClick={proceedWithOrderData}
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Lanjut ke Formulir Pembayaran</span>
                  <CreditCard className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setQueueModalOpen(false)}
                  className="text-xs py-2 px-4 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Tutup / Batalkan Antrean
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
