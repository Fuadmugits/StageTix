'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  Ticket, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Tag, 
  Zap, 
  AlertCircle,
  Building2,
  QrCode,
  Store,
  Loader2
} from 'lucide-react';
import { MOCK_PAYMENT_METHODS } from '@/data/mockData';
import { PaymentMethod } from '@/types';
import { orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Customer Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [phone, setPhone] = useState('');
  const [identityNo, setIdentityNo] = useState('');

  useEffect(() => {
    if (user) {
      if (!fullName && user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
      if (!email && user.email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  // Draft Order details (from local storage or fallback)
  const [order] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('stagetix_draft_order');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          return {
            concertTitle: parsed.concertTitle,
            concertDate: parsed.concertDate,
            concertVenue: parsed.concertVenue,
            tierName: parsed.items[0].tierName,
            quantity: parsed.items[0].quantity,
            price: parsed.items[0].price,
            subtotal: parsed.subtotal,
            serviceFee: parsed.serviceFee
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      concertTitle: 'Select Concert Ticket',
      concertDate: '-',
      concertVenue: '-',
      tierName: 'Standard',
      quantity: 1,
      price: 0,
      subtotal: 0,
      serviceFee: 0
    };
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(MOCK_PAYMENT_METHODS[0]); // QRIS by default
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate payment channel fee
  let paymentFee = selectedMethod.fee;
  if (selectedMethod.adminFeeType === 'percentage') {
    paymentFee = Math.round((order.subtotal * selectedMethod.fee) / 100);
  }

  const grandTotal = Math.max(0, order.subtotal + order.serviceFee + paymentFee - discountAmount);

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'STAGE2026' || promoCode.trim().toUpperCase() === 'DISCOUNT10') {
      const disc = Math.round(order.subtotal * 0.1);
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else if (promoCode.trim() === '') {
      setPromoError('Please enter a voucher code');
    } else {
      setPromoError('Invalid promo code. Use STAGE2026 for 10% discount');
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);

    // Try to read the draft order saved by the concert detail page
    let concertId: number | null = null;
    let ticketTierId: number | null = null;
    let quantity = order.quantity;

    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('stagetix_draft_order');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          concertId = parsed.concertId;
          ticketTierId = parsed.items?.[0]?.tierId;
          quantity = parsed.items?.[0]?.quantity || order.quantity;
        } catch (e) { console.error(e); }
      }
    }

    try {
      // Call Laravel API if we have the required IDs
      if (concertId && ticketTierId) {
        const result = await orderApi.checkout({
          concert_id: concertId,
          ticket_tier_id: ticketTierId,
          quantity,
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          customer_identity_no: identityNo,
          payment_method: selectedMethod.id,
          promo_code: promoApplied ? promoCode : undefined,
        });

        const apiOrder = result.data;
        const orderNumber = apiOrder.order_number;

        // Save to localStorage for the payment page to read
        const activeOrderData = {
          id: orderNumber,
          concertTitle: order.concertTitle,
          concertDate: order.concertDate,
          concertVenue: order.concertVenue,
          tierName: order.tierName,
          quantity,
          customer: { fullName, email, phone, identityNo },
          subtotal: apiOrder.subtotal,
          serviceFee: apiOrder.service_fee,
          paymentFee: apiOrder.payment_fee,
          discount: apiOrder.discount,
          total: apiOrder.total_amount,
          paymentMethod: selectedMethod.id,
          paymentMethodName: selectedMethod.name,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          expiresAt: apiOrder.expires_at,
          virtualAccountNo: apiOrder.virtual_account_no || selectedMethod.accountNumber || '8800192837461928',
          qrCodeUrl: apiOrder.qr_code_url,
          snapToken: (apiOrder as any).snap_token || null,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(`stagetix_order_${orderNumber}`, JSON.stringify(activeOrderData));
          localStorage.setItem('stagetix_current_order_id', orderNumber);
        }

        setIsProcessing(false);
        router.push(`/payment/${orderNumber}`);
        return;
      }
    } catch (err) {
      console.warn('API checkout failed, falling back to local demo mode:', err);
    }

    // Fallback: local-only demo mode (backend offline or no concert context)
    const generatedOrderId = `STX-${Date.now().toString().slice(-8)}`;
    const activeOrderData = {
      id: generatedOrderId,
      concertTitle: order.concertTitle,
      concertDate: order.concertDate,
      concertVenue: order.concertVenue,
      tierName: order.tierName,
      quantity: order.quantity,
      customer: { fullName, email, phone, identityNo },
      subtotal: order.subtotal,
      serviceFee: order.serviceFee,
      paymentFee,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod: selectedMethod.id,
      paymentMethodName: selectedMethod.name,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      virtualAccountNo: selectedMethod.accountNumber || '8800192837461928',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=STAGETIX-PAY-${generatedOrderId}`
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`stagetix_order_${generatedOrderId}`, JSON.stringify(activeOrderData));
      localStorage.setItem('stagetix_current_order_id', generatedOrderId);
    }

    setIsProcessing(false);
    router.push(`/payment/${generatedOrderId}`);
  };

  return (
    <div className="py-8 pb-20 space-y-8">
      <div className="container-custom">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Link href="/explore" className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Jelajah Konser
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Pembayaran Aman &amp; Terverifikasi</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Form */}
          <div className="lg:col-span-8 space-y-8">

            {/* Section 1: Customer Identity Form */}
            <div className="glass-card p-6 sm:p-8 space-y-6" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  1. Data Pemesan &amp; Pemegang Tiket
                </h2>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Wajib sesuai kartu identitas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap (sesuai KTP / Paspor)</label>
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Alamat Email (Penerima E-Ticket)</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: rian.pratama@gmail.com"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nomor WhatsApp / HP Aktif</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nomor Identitas (NIK KTP / Paspor)</label>
                  <input 
                    type="text"
                    value={identityNo}
                    onChange={(e) => setIdentityNo(e.target.value)}
                    placeholder="Contoh: 3171012903980001"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Midtrans Payment Gateway Integration */}
            <div className="glass-card p-6 sm:p-8 space-y-6" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CreditCard className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  2. Metode Pembayaran Resmi
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5" style={{ background: 'var(--accent-subtle)', borderColor: 'var(--border-highlight)', color: 'var(--accent)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Midtrans Payment Gateway
                </span>
              </div>

              {/* Midtrans Unified Gateway Card */}
              <div 
                className="p-6 rounded-2xl border transition-all space-y-4"
                style={{ background: 'linear-gradient(135deg, rgba(0, 43, 102, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg shrink-0" style={{ background: '#002B66' }}>
                      MT
                    </div>
                    <div>
                      <div className="font-extrabold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        Midtrans Multi-Payment (Semua Saluran Otomatis)
                        <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                          Resmi
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pilihan metode bayar (GoPay, QRIS, Virtual Account BCA/Mandiri/BRI/BNI, dan Kartu Kredit) akan langsung terbuka di pop-up resmi Midtrans.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supported Payment Logos Pills */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Saluran Didukung:</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">● GoPay &amp; QRIS</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">BCA VA</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">Mandiri VA</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">BRIVA</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700">ShopeePay</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">Visa / Mastercard</span>
                </div>
              </div>

              {/* Information Notice */}
              <div className="rounded-xl p-4 text-xs flex items-start gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Tidak perlu memilih bank secara manual di sini. Begitu Anda menekan tombol <strong>"Lanjutkan Pembayaran"</strong>, pop-up resmi Midtrans akan langsung terbuka agar Anda bebas memilih metode bayar yang diinginkan.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Order Breakdown & Promo */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 glass-card p-6 space-y-6 shadow-2xl" style={{ border: '1px solid var(--border-color)' }}>
              <h3 className="text-lg font-bold pb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                <Ticket className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Ringkasan Pesanan
              </h3>

              {/* Concert Info Snippet */}
              <div className="space-y-2 text-xs pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{order.concertTitle}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{order.concertVenue}</div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.concertDate}</div>
                <div className="pt-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    Kategori {order.tierName} • {order.quantity} Tiket
                  </span>
                </div>
              </div>

              {/* Promo Code Coupon Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  Punya Kode Promo / Voucher? (Coba STAGE2026)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Kode Voucher"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="rounded-xl px-3 py-2 text-xs uppercase font-mono w-full focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="btn-secondary py-2 px-4 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {promoApplied ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} /> : 'Gunakan'}
                  </button>
                </div>
                {promoError && <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--danger)' }}><AlertCircle className="w-3 h-3" />{promoError}</p>}
                {promoApplied && <p className="text-[11px] font-semibold" style={{ color: 'var(--success)' }}>✓ Voucher STAGE2026 berhasil diterapkan (Diskon 10%)!</p>}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 text-xs pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Harga Tiket</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Biaya Layanan &amp; Platform</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rp {order.serviceFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Biaya Gateway (Midtrans)</span>
                  <span className="font-semibold" style={{ color: 'var(--success)' }}>Gratis</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold" style={{ color: 'var(--success)' }}>
                    <span>Potongan Diskon</span>
                    <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="pt-4 flex justify-between items-end" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Pembayaran</div>
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Pay Now Button */}
              <button 
                onClick={handlePayNow}
                disabled={isProcessing}
                className="btn-primary w-full py-4 text-base font-bold cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghubungkan ke Sistem Pembayaran...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Lanjutkan Pembayaran • Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                )}
              </button>

              <div className="text-[11px] text-center space-y-1" style={{ color: 'var(--text-muted)' }}>
                <p>Dengan menekan tombol, Anda menyetujui syarat &amp; ketentuan StageTix.</p>
                <p className="font-medium" style={{ color: 'var(--success)' }}>🔒 Transaksi Dilindungi Enkripsi 256-Bit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
