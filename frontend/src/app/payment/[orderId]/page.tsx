'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Copy, 
  Check, 
  Zap, 
  QrCode, 
  ArrowRight,
  RefreshCw,
  XCircle,
  Sparkles,
  Ticket,
  Loader2
} from 'lucide-react';
import { Order } from '@/types';
import { webhookApi, orderApi } from '@/lib/api';

export default function PaymentStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem(`stagetix_order_${resolvedParams.orderId}`);
      if (savedOrder) {
        try {
          return JSON.parse(savedOrder);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds (300s)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem(`stagetix_order_${resolvedParams.orderId}`);
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          if (parsed.status) return parsed.status;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return 'PENDING';
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [firstTicketCode, setFirstTicketCode] = useState<string | null>(null);
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [selectedSnapMethod, setSelectedSnapMethod] = useState<'qris' | 'gopay' | 'bca_va' | 'mandiri_va' | 'bni_va' | 'bri_va' | 'card' | 'shopeepay'>('bca_va');

  // Sub-view in Snap: 'methods' | 'bca_va' | 'gopay_qris' | 'card' | 'shopeepay'
  const [snapView, setSnapView] = useState<'methods' | 'bca_va' | 'gopay_qris' | 'card' | 'shopeepay'>('methods');

  // Trigger Midtrans Snap Popup (prioritizing REAL official Midtrans Snap popup)
  const handleOpenMidtransSnap = async () => {
    if (typeof window === 'undefined') return;

    let snap = (window as any).snap;

    // Load official Snap script if not yet ready
    if (!snap) {
      await new Promise<void>((resolve) => {
        const existingScript = document.getElementById('snap-script');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          setTimeout(resolve, 800);
        } else {
          const script = document.createElement('script');
          script.id = 'snap-script';
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-TXkuAbg23IjtASqb');
          script.onload = () => resolve();
          document.head.appendChild(script);
          setTimeout(resolve, 800);
        }
      });
      snap = (window as any).snap;
    }

    let snapToken = (order as any)?.snapToken;

    // Fetch real official snap token from Next API route
    if (!snapToken && order) {
      try {
        const response = await fetch('/api/midtrans/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            grossAmount: order.total,
            customerName: order.customer?.fullName || 'StageTix Buyer',
            customerEmail: order.customer?.email || 'buyer@example.com',
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.token) {
            snapToken = data.token;
            const updated = { ...order, snapToken: data.token };
            setOrder(updated);
            localStorage.setItem(`stagetix_order_${order.id}`, JSON.stringify(updated));
          }
        }
      } catch (err) {
        console.warn('Could not fetch snap token from Next API route:', err);
      }
    }

    // Call official Midtrans Snap dialog
    if (snap && snapToken) {
      setShowSnapModal(false);
      try {
        (window as any).snap.pay(snapToken, {
          onSuccess: function(result: any) {
            console.log('Official Midtrans Success:', result);
            handleSimulatePaymentSuccess();
          },
          onPending: function(result: any) {
            console.log('Official Midtrans Pending:', result);
            handleSimulatePaymentSuccess();
          },
          onError: function(result: any) {
            console.error('Official Midtrans Error:', result);
            alert('Pembayaran Midtrans dibatalkan/gagal.');
          },
          onClose: function() {
            console.log('User closed official Snap modal');
          }
        });
        return;
      } catch (e) {
        console.warn('Snap pay error:', e);
      }
    }

    // Fallback only if network/script blocked
    setShowSnapModal(true);
  };

  // Auto-trigger official Midtrans popup on page load if pending
  useEffect(() => {
    if (paymentStatus === 'PENDING') {
      const timer = setTimeout(() => {
        handleOpenMidtransSnap();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Countdown Timer effect
  useEffect(() => {
    if (paymentStatus !== 'PENDING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('CANCELLED');
          if (typeof window !== 'undefined') {
            const savedOrder = localStorage.getItem(`stagetix_order_${resolvedParams.orderId}`);
            if (savedOrder) {
              try {
                const parsed = JSON.parse(savedOrder);
                localStorage.setItem(`stagetix_order_${resolvedParams.orderId}`, JSON.stringify({ ...parsed, status: 'CANCELLED' }));
              } catch (e) { console.error(e); }
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, resolvedParams.orderId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    if (!order) return;
    const textToCopy = order.paymentMethod === 'qris' 
      ? order.id 
      : (order.virtualAccountNo || '8800192837461928');
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Payment Success — calls Laravel webhook API
  const handleSimulatePaymentSuccess = async () => {
    if (!order) return;
    setIsSimulating(true);

    // The order.id might be "STX-XXXXXXXX" — use it as orderNumber for the API
    const orderNumber = order.id;

    try {
      // Try calling the real Laravel API first
      const result = await webhookApi.simulatePayment(orderNumber, 'settlement');
      
      // Extract first ticket code from API response
      const apiOrder = result.order;
      const tickets = apiOrder?.tickets;
      const ticketCode = tickets && tickets.length > 0 ? tickets[0].ticket_code : null;

      setFirstTicketCode(ticketCode);
      setPaymentStatus('PAID');

      if (typeof window !== 'undefined') {
        localStorage.setItem(`stagetix_order_${order.id}`, JSON.stringify({ ...order, status: 'PAID' }));
        if (ticketCode) {
          localStorage.setItem('stagetix_last_ticket_code', ticketCode);
        }
      }

      setIsSimulating(false);

      setTimeout(() => {
        router.push(`/ticket/${ticketCode || order.id}`);
      }, 1200);

    } catch {
      // Offline fallback: save order status and route to ticket
      setFirstTicketCode(order.id);
      setPaymentStatus('PAID');

      if (typeof window !== 'undefined') {
        localStorage.setItem(`stagetix_order_${order.id}`, JSON.stringify({ ...order, status: 'PAID' }));
        localStorage.setItem('stagetix_last_ticket_code', order.id);
      }
      setIsSimulating(false);

      setTimeout(() => {
        router.push(`/ticket/${order.id}`);
      }, 1200);
    }
  };

  const handleSimulateCancel = () => {
    if (!order) return;
    setPaymentStatus('CANCELLED');
    if (typeof window !== 'undefined') {
      localStorage.setItem(`stagetix_order_${order.id}`, JSON.stringify({ ...order, status: 'CANCELLED' }));
    }
  };

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pesanan Tidak Ditemukan</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Data pesanan tidak ditemukan atau sesi telah berakhir.</p>
        <Link href="/explore" className="btn-primary text-xs py-2.5 px-6 mt-2">
          Kembali ke Jelajah Konser
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 pb-24 space-y-8">
      <div className="container-custom max-w-4xl">
        
        {/* Top Status Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <span>Order ID: <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{order.id}</span></span>
          </div>

          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {paymentStatus === 'PENDING' && 'Menunggu Pembayaran'}
            {paymentStatus === 'PAID' && 'Pembayaran Berhasil!'}
            {paymentStatus === 'CANCELLED' && 'Pembayaran Kedaluwarsa / Dibatalkan'}
          </h1>

          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            {paymentStatus === 'PENDING' && 'Harap selesaikan pembayaran sebelum waktu hitung mundur habis untuk mengunci tiket Anda.'}
            {paymentStatus === 'PAID' && 'Transaksi Anda telah diverifikasi. Pengalihan otomatis ke e-ticket digital...'}
            {paymentStatus === 'CANCELLED' && 'Sesi pembayaran ini telah habis waktu (otomatis batal). Silakan buat pemesanan baru.'}
          </p>
        </div>

        {/* Countdown Timer Banner */}
        {paymentStatus === 'PENDING' && (
          <div className="glass-card p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'var(--warning-subtle)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse" style={{ background: 'var(--bg-card)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Batas Waktu Pembayaran</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Selesaikan pembayaran dalam waktu 5:00 menit</div>
              </div>
            </div>

            <div className="text-3xl font-mono font-extrabold tracking-wider" style={{ color: 'var(--warning)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Main Payment Details Box */}
        <div className="glass-card p-6 sm:p-10 space-y-8 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
          
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Jumlah yang Harus Dibayar</div>
              <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Rp {order.total.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              {paymentStatus === 'PENDING' && (
                <span className="badge badge-warning px-4 py-2 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menunggu Pembayaran
                </span>
              )}
              {paymentStatus === 'PAID' && (
                <span className="badge badge-success px-4 py-2 text-xs">
                  <Check className="w-4 h-4" /> Pembayaran Berhasil
                </span>
              )}
              {paymentStatus === 'CANCELLED' && (
                <span className="badge badge-danger px-4 py-2 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> Waktu Habis
                </span>
              )}
            </div>
          </div>

          {/* Payment Account Display */}
          {paymentStatus === 'PENDING' && (
            <div className="space-y-6">
              
              {/* QRIS Mode */}
              {order.paymentMethod === 'qris' ? (
                <div className="text-center space-y-4 py-4">
                  <div className="bg-white p-4 inline-block rounded-2xl shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
                    <img 
                      src={order.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STAGETIX-PAY-${order.id}`} 
                      alt="Kode QRIS" 
                      className="w-56 h-56 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-xs font-semibold flex items-center justify-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <QrCode className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    Bisa dibayar dengan GoPay, OVO, ShopeePay, DANA, BCA, Mandiri &amp; bank lainnya
                  </div>
                </div>
              ) : (
                /* Virtual Account / Retail Mode */
                <div className="p-6 rounded-2xl space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Nomor {order.paymentMethodName}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest" style={{ color: 'var(--text-primary)' }}>
                      {order.virtualAccountNo || '8800 1928 3746 1928'}
                    </div>

                    <button 
                      onClick={handleCopyCode}
                      className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4" style={{ color: 'var(--success)' }} /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Tersalin!' : 'Salin Nomor'}
                    </button>
                  </div>
                </div>
              )}

              {/* Midtrans Snap Popup Trigger - Always Available in Pending status */}
              <div className="pt-2">
                <button
                  onClick={handleOpenMidtransSnap}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  style={{ background: '#002B66', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Buka Pop-up Resmi Midtrans Snap (Bayar Sekarang)</span>
                </button>
                <p className="text-[11px] text-center pt-2" style={{ color: 'var(--text-muted)' }}>
                  Pilih metode bayar QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri langsung di pop-up Midtrans.
                </p>
              </div>

              {/* Concert & Order Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Konser:</span>
                  <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{order.concertTitle}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Pemesan:</span>
                  <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{order.customer.fullName} ({order.customer.email})</div>
                </div>
              </div>
            </div>
          )}

          {/* Success Redirect state */}
          {paymentStatus === 'PAID' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '2px solid rgba(16, 185, 129, 0.4)' }}>
                <Check className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Pembayaran Berhasil Dikonfirmasi</h3>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                  E-ticket konser resmi Anda telah aktif dan siap digunakan di venue.
                </p>
              </div>

              <Link href={`/ticket/${firstTicketCode || order.id}`} className="btn-primary py-3.5 px-8 text-sm font-bold inline-flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Buka E-Ticket Digital
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Cancelled state */}
          {paymentStatus === 'CANCELLED' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pesanan Dibatalkan</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Batas waktu pembayaran telah habis atau pesanan dibatalkan.</p>
              <Link href="/explore" className="btn-primary text-xs py-2.5 px-6 inline-block">
                Pilih Konser Lain
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MIDTRANS SNAP OFFICIAL MODAL (IDENTIK 100% PERSIS SNAP ASLI)
          ══════════════════════════════════════════════════════════════════ */}
      {showSnapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="w-full max-w-[420px] bg-white text-slate-900 rounded-[26px] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 font-sans">
            
            {/* Header: Customer Name / Back Button & Close */}
            <div className="px-6 pt-5 pb-1 flex items-center justify-between">
              {snapView === 'methods' ? (
                <span className="font-semibold text-sm text-slate-800 tracking-tight">
                  {order.customer.fullName || 'gilang adity ssaputra'}
                </span>
              ) : (
                <button 
                  onClick={() => setSnapView('methods')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold">‹</span> Kembali
                </button>
              )}
              <button 
                onClick={() => setShowSnapModal(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Total Amount & Order ID Row */}
            <div className="px-6 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[26px] font-black text-slate-900 tracking-tight">
                  Rp{order.total.toLocaleString('id-ID')}
                </span>
                <button 
                  onClick={handleCopyCode} 
                  title="Salin total"
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                <div className="flex items-center gap-1">
                  <span>Order ID #{order.id}</span>
                  <button onClick={handleCopyCode} className="text-slate-400 hover:text-slate-600">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">Details ▾</span>
              </div>
            </div>

            {/* Choose Within Timer Bar */}
            <div className="bg-[#f0f4f8] py-2 px-6 text-center text-xs font-semibold text-slate-700 border-y border-slate-200">
              {snapView === 'methods' ? 'Choose within 23:59:58' : 'Complete payment within 23:59:58'}
            </div>

            {/* ══ VIEW 1: METHOD SELECTION LIST ══ */}
            {snapView === 'methods' && (
              <div className="max-h-[380px] overflow-y-auto px-6 py-4 space-y-4">
                
                {/* Recommended payment method */}
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-2">Recommended payment method</span>
                  <div 
                    onClick={() => setSnapView('bca_va')}
                    className="flex items-center justify-between py-3.5 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-blue-700 border border-blue-200 bg-blue-50/80 px-2 py-0.5 rounded">BCA</span>
                      <span className="font-semibold text-xs text-slate-800">BCA virtual account</span>
                    </div>
                    <span className="text-slate-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform">›</span>
                  </div>
                </div>

                {/* All payment methods */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-medium text-slate-400 block">All payment methods</span>

                  {/* GoPay QRIS */}
                  <div 
                    onClick={() => setSnapView('gopay_qris')}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">GoPay QRIS</span>
                      <span className="text-slate-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform">›</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-cyan-600 font-extrabold flex items-center gap-1">● gopay</span>
                      <span className="text-cyan-800">gopay later</span>
                      <span className="text-slate-900 font-mono tracking-tighter uppercase font-black text-[10px] border border-slate-300 px-1 rounded">QRIS</span>
                    </div>
                  </div>

                  {/* Virtual Account Accordion */}
                  <div 
                    onClick={() => setSnapView('bca_va')}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">Virtual account</span>
                      <span className="text-slate-400 text-xs font-bold">▾</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap text-[10px] font-bold text-slate-700">
                      <span className="text-blue-700">BCA</span>
                      <span className="text-amber-700">mandiri</span>
                      <span className="text-teal-700">BNI</span>
                      <span className="text-blue-600">BRI</span>
                      <span className="text-slate-600">Permata Bank</span>
                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">+6</span>
                    </div>
                  </div>

                  {/* Card Payment */}
                  <div 
                    onClick={() => setSnapView('card')}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">Card Payment</span>
                      <span className="text-slate-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform">›</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] font-black">
                      <span className="text-blue-800 italic">VISA</span>
                      <span className="text-red-600">Mastercard</span>
                      <span className="text-green-700">JCB</span>
                      <span className="text-cyan-700">AMEX</span>
                    </div>
                  </div>

                  {/* ShopeePay QRIS */}
                  <div 
                    onClick={() => setSnapView('shopeepay')}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">ShopeePay QRIS</span>
                      <span className="text-slate-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform">›</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-orange-600 font-extrabold flex items-center gap-1">🟠 ShopeePay</span>
                      <span className="text-orange-800 font-semibold">SPayLater</span>
                      <span className="text-slate-900 font-mono tracking-tighter uppercase font-black text-[10px] border border-slate-300 px-1 rounded">QRIS</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ══ VIEW 2: BCA VIRTUAL ACCOUNT SUB-VIEW ══ */}
            {snapView === 'bca_va' && (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <span className="text-[12px] font-black text-blue-700 border border-blue-200 bg-blue-50/80 px-2.5 py-1 rounded">BCA</span>
                  <div>
                    <div className="font-bold text-sm text-slate-900">BCA Virtual Account</div>
                    <div className="text-[11px] text-slate-500">Bayar via m-BCA, KlikBCA, atau ATM BCA</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">Nomor Virtual Account:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                      {order.virtualAccountNo || '8800192837461928'}
                    </span>
                    <button 
                      onClick={handleCopyCode} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-1"
                    >
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>

                {/* Step Instructions */}
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">Cara Pembayaran m-BCA:</div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Buka aplikasi m-BCA &gt; m-Transfer</li>
                    <li>Pilih BCA Virtual Account &gt; Masukkan no VA di atas</li>
                    <li>Pastikan nama tagihan sesuai, masukkan PIN &gt; Selesai</li>
                  </ol>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => {
                    handleSimulatePaymentSuccess();
                  }}
                  disabled={isSimulating}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <span>Saya Sudah Bayar (Konfirmasi Otomatis)</span>
                  )}
                </button>
              </div>
            )}

            {/* ══ VIEW 3: GOPAY / SHOPEEPAY QRIS SUB-VIEW ══ */}
            {(snapView === 'gopay_qris' || snapView === 'shopeepay') && (
              <div className="p-6 space-y-4 text-center">
                <div className="font-bold text-sm text-slate-900">
                  {snapView === 'gopay_qris' ? 'GoPay QRIS' : 'ShopeePay QRIS'}
                </div>
                <p className="text-[11px] text-slate-500">Scan QR Code di bawah dengan aplikasi e-wallet Anda</p>

                <div className="bg-white p-3 inline-block rounded-xl border border-slate-200 shadow-sm">
                  <img 
                    src={order.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STAGETIX-PAY-${order.id}`} 
                    alt="QRIS Midtrans" 
                    className="w-44 h-44 mx-auto object-contain"
                  />
                </div>

                <button
                  onClick={() => {
                    handleSimulatePaymentSuccess();
                  }}
                  disabled={isSimulating}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <span>Saya Sudah Scan &amp; Bayar</span>
                  )}
                </button>
              </div>
            )}

            {/* ══ VIEW 4: CARD PAYMENT SUB-VIEW ══ */}
            {snapView === 'card' && (
              <div className="p-6 space-y-4">
                <div className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Kartu Kredit / Debit Online
                </div>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nomor Kartu (16 digit)" 
                    defaultValue="4000 1234 5678 9010"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="MM / YY" 
                      defaultValue="12/28"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <input 
                      type="password" 
                      placeholder="CVV" 
                      defaultValue="123"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleSimulatePaymentSuccess();
                  }}
                  disabled={isSimulating}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Kartu...</span>
                    </>
                  ) : (
                    <span>Bayar Sekarang Rp{order.total.toLocaleString('id-ID')}</span>
                  )}
                </button>
              </div>
            )}

            {/* Bottom Footer Notice */}
            <div className="bg-slate-50 px-6 py-2.5 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
              <span>🔒 Powered by</span>
              <span className="font-black text-slate-600">midtrans</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
