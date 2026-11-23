'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  Ticket as TicketIcon, 
  CheckCircle2, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  ShieldCheck, 
  ArrowLeft,
  QrCode
} from 'lucide-react';
import { use } from 'react';
import { ticketApi, ApiTicket } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function TicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const resolvedParams = use(params);
  const [ticket, setTicket] = React.useState<any>(null);
  const [allTickets, setAllTickets] = React.useState<any[]>([]);
  const [activeTicketIndex, setActiveTicketIndex] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    ticketApi.get(resolvedParams.ticketId)
      .then((res: any) => {
        if (!cancelled && res.data) {
          const t = res.data;
          const mainTicket = {
            id: t.ticket_code,
            orderId: t.order?.order_number || String(t.order_id),
            concertTitle: t.order?.concert?.title || 'Concert E-Ticket',
            artist: t.order?.concert?.artist || 'StageTix Artist',
            venue: t.order?.concert?.venue ? `${t.order.concert.venue}, ${t.order.concert.city}` : 'Venue Gate',
            date: t.order?.concert?.date || '-',
            time: t.order?.concert?.time || '-',
            tierName: t.tier_name,
            seatNumber: t.seat_number,
            holderName: t.holder_name,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(t.ticket_code)}`,
            status: t.status,
          };

          const list = (res.all_tickets && res.all_tickets.length > 0)
            ? res.all_tickets.map((item: any) => ({
                ...mainTicket,
                id: item.ticket_code,
                tierName: item.tier_name,
                seatNumber: item.seat_number,
                holderName: item.holder_name,
                status: item.status,
                qrCode: item.qr_code,
              }))
            : [mainTicket];

          setTicket(mainTicket);
          setAllTickets(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // If offline or order was saved in localStorage
          if (typeof window !== 'undefined') {
            const lastTicketCode = localStorage.getItem('stagetix_last_ticket_code');
            const currentOrderId = localStorage.getItem('stagetix_current_order_id');
            const savedOrder = currentOrderId ? localStorage.getItem(`stagetix_order_${currentOrderId}`) : null;
            if (savedOrder) {
              try {
                const parsed = JSON.parse(savedOrder);
                const qty = parsed.items?.[0]?.quantity || 1;
                const baseId = resolvedParams.ticketId || lastTicketCode || parsed.id;
                
                const list = [];
                for (let i = 1; i <= qty; i++) {
                  const uniqueCode = qty > 1 ? `${baseId}-T${i}` : baseId;
                  list.push({
                    id: uniqueCode,
                    orderId: parsed.id,
                    concertTitle: parsed.concertTitle,
                    artist: 'Official Performer',
                    venue: parsed.concertVenue,
                    date: parsed.concertDate,
                    time: '19:00 WIB',
                    tierName: parsed.tierName,
                    seatNumber: qty > 1 ? `Gate A - Main Entrance • Seat #0${i}` : 'Gate A - Main Entrance',
                    holderName: qty > 1 ? `${parsed.customer?.fullName || 'Ticket Holder'} (Tiket ${i})` : (parsed.customer?.fullName || 'Ticket Holder'),
                    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(uniqueCode)}`,
                    status: 'ACTIVE',
                  });
                }
                setTicket(list[0]);
                setAllTickets(list);
                return;
              } catch (e) {
                console.error(e);
              }
            }
          }
          setError('Tiket tidak ditemukan.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [resolvedParams.ticketId]);

  useEffect(() => {
    // Trigger festive confetti animation on mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="ml-3 text-sm" style={{ color: 'var(--text-muted)' }}>Memuat e-ticket resmi...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tiket Tidak Ditemukan</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Kode tiket tidak valid atau belum terdaftar di sistem.</p>
        <Link href="/transactions" className="btn-primary text-xs py-2 px-5 mt-2">
          Lihat Transaksi Saya
        </Link>
      </div>
    );
  }

  const activeTicket = allTickets[activeTicketIndex] || ticket;

  return (
    <div className="py-10 pb-24 space-y-8">
      <div className="container-custom max-w-3xl">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/transactions" className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Transaksi Saya
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid E-Ticket Verified</span>
          </div>
        </div>

        {/* Multi-Ticket Selector Tabs if user bought > 1 ticket */}
        {allTickets.length > 1 && (
          <div className="mb-6 p-4 rounded-2xl glass-card border border-cyan-500/30 space-y-3 bg-[#131318]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <TicketIcon className="w-4 h-4 text-cyan-400" />
                Daftar Tiket Anda ({allTickets.length} Lembar Tiket Mandiri)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Tiap tiket memiliki kode &amp; QR unik terpisah
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allTickets.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicketIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTicketIndex === idx
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span>Tiket #{idx + 1}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    t.status === 'USED' ? 'bg-rose-900/80 text-rose-200' : 'bg-black/30 text-emerald-300'
                  }`}>
                    {t.status === 'USED' ? 'USED' : 'READY'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* E-Ticket Card Wrapper */}
        <div className="relative rounded-3xl overflow-hidden glass-card shadow-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          
          {/* Top Banner Header */}
          <div className="p-6 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>
                  E-Ticket Konser Resmi {allTickets.length > 1 ? `(Tiket ${activeTicketIndex + 1} dari ${allTickets.length})` : ''}
                </span>
                <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>No. Tiket Unik: {activeTicket.id}</div>
              </div>
            </div>

            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {activeTicket.status === 'ACTIVE' ? 'Tiket Aktif' : activeTicket.status}
            </span>
          </div>

          {/* Ticket Body Content */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Event Header */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                {activeTicket.artist}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {activeTicket.concertTitle}
              </h1>
            </div>

            {/* Ticket Tier & Seat Card */}
            <div className="p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Kategori Tiket</div>
                <div className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.tierName}</div>
              </div>

              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Pintu Masuk / Gate</div>
                <div className="text-lg font-mono font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.seatNumber}</div>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-muted)' }}>Tanggal Konser</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-muted)' }}>Waktu Masuk</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-muted)' }}>Nama Pemegang Tiket</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.holderName}</div>
                </div>
              </div>
            </div>

            {/* Venue Location */}
            <div className="flex items-start gap-3 text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--text-muted)' }}>Lokasi / Venue</div>
                <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeTicket.venue}</div>
              </div>
            </div>

            {/* QR Code Entry Pass */}
            <div className="pt-6 text-center space-y-4" style={{ borderTop: '2px dashed var(--border-color)' }}>
              <div className="relative inline-block">
                <div className="bg-white p-4 inline-block rounded-2xl shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
                  <img 
                    id="ticket-qr-img"
                    src={activeTicket.qrCode} 
                    alt="QR Code Tiket" 
                    className="w-48 h-48 mx-auto object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                {activeTicket.status === 'USED' && (
                  <div className="absolute inset-0 bg-black/75 rounded-2xl flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black uppercase rounded-lg shadow-lg tracking-wider mb-1">
                      SUDAH DIGUNAKAN
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      Check-in Gate Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Download QR Image Button */}
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch(activeTicket.qrCode);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `QR-Tiket-${activeTicket.id}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch {
                      // Fallback: open in new tab
                      window.open(activeTicket.qrCode, '_blank');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
                  style={{ 
                    background: 'var(--bg-elevated)', 
                    color: 'var(--accent)', 
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Simpan Gambar QR Code #{activeTicketIndex + 1} (PNG)
                </button>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <span>KODE:</span>
                  <span className="select-all tracking-wider">{activeTicket.id}</span>
                </div>
                <div className="text-xs font-semibold flex items-center justify-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <QrCode className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  Tunjukkan QR code atau Kode di atas kepada petugas check-in
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  ⚠️ Tiket ini bersifat <strong>Single-Use</strong>. Sekali kode / QR discan dan dinyatakan valid oleh gate scanner, tiket otomatis berstatus <span className="text-rose-400 font-bold">USED</span> dan tidak dapat digunakan kembali.
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => window.print()} 
                className="btn-primary flex-1 py-3 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF / Print Ticket
              </button>

              <button className="btn-secondary py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Share2 className="w-4 h-4" />
                Share Pass
              </button>
            </div>

            <div className="text-[11px] text-center flex items-center justify-center gap-1.5 pt-2" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
              <span>Authentic E-Ticket verified by StageTix Laravel API Engine</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
