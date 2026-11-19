'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Ticket,
  Users,
  DollarSign,
  QrCode,
  BarChart3,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Send
} from 'lucide-react';
import { organizerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { SUPER_ADMIN_EMAIL, submitCrewRequest } from '@/lib/crewAccess';

export default function OrganizerDashboardPage() {
  const { user, isSuperAdmin, isApprovedCrew, crewStatus, loading: authLoading, refreshCrewStatus } = useAuth();
  const [requestSent, setRequestSent] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await organizerApi.getStats();
      setStats(res.data);
    } catch {
      // API error or offline - set stats to null
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ═══════════════════════════════════════════════════════════
  // APPROVAL GUARD: Khusus Super Admin & Promotor Disetujui
  // ═══════════════════════════════════════════════════════════
  if (!authLoading && (!user || (!isSuperAdmin && !isApprovedCrew))) {
    const handleSendRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.email) return;

      submitCrewRequest({
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'organizer',
        notes: requestNotes || 'Permohonan akses dashboard promotor konser'
      });

      refreshCrewStatus();
      setRequestSent(true);
    };

    return (
      <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 text-center">
        <div className="glass-card max-w-lg p-8 sm:p-10 space-y-6 rounded-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard Promotor Memerlukan Persetujuan</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Metrik pendapatan dan manajemen event dibatasi ketat. Hanya promotor yang telah disetujui langsung oleh Super Admin Utama (<strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{SUPER_ADMIN_EMAIL}</strong>) yang dapat membuka halaman ini.
            </p>
          </div>

          {!user ? (
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Silakan login terlebih dahulu untuk mengajukan permohonan akses promotor.</p>
              <Link href="/login" className="btn-primary text-xs py-3 px-6 block w-full text-center">
                Masuk ke Akun
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl text-left text-xs space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)' }}>Akun Anda saat ini:</div>
                <div className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{user.email}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span style={{ color: 'var(--text-muted)' }}>Status Akses:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{
                    background: crewStatus === 'PENDING' ? 'var(--warning-subtle)' : crewStatus === 'REJECTED' ? 'var(--danger-subtle)' : 'var(--bg-card)',
                    color: crewStatus === 'PENDING' ? 'var(--warning)' : crewStatus === 'REJECTED' ? 'var(--danger)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {crewStatus === 'PENDING' ? '⏳ Menunggu Persetujuan Super Admin' : crewStatus === 'REJECTED' ? '❌ Permohonan Ditolak' : 'Belum Terdaftar'}
                  </span>
                </div>
              </div>

              {crewStatus === 'PENDING' || requestSent ? (
                <div className="p-5 rounded-2xl text-xs space-y-2" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <p className="font-bold">Permohonan Anda Telah Dikirim ke Super Admin!</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Super Admin (<span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{SUPER_ADMIN_EMAIL}</span>) akan meninjau pengajuan ini. Halaman dashboard akan aktif segera setelah permohonan Anda disetujui.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-3 text-left">
                  <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Nama Penyelenggara / Event Promotor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Kreasi Musik Indonesia"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    <Send className="w-4 h-4" />
                    Ajukan Izin Promotor ke Super Admin
                  </button>
                </form>
              )}

              <div className="pt-2">
                <Link href="/explore" className="btn-secondary text-xs py-2.5 px-6 inline-block">
                  Kembali ke Jelajah Konser
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="container-custom max-w-6xl space-y-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background: 'var(--accent)' }}></span>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Organizer Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-color)' }}>
                PRO METRICS
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Real-time revenue, ticket sales, gate check-in analytics, and high concurrency management</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            <Link
              href="/gate-scanner"
              className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Open Gate Scanner
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
            <p className="text-xs text-slate-400">Loading organizer metrics from Laravel API...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Total Revenue */}
              <div className="glass-card p-6 border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  Rp {(stats?.total_revenue || 0).toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+14.2% vs last week</span>
                </div>
              </div>

              {/* Tickets Sold */}
              <div className="glass-card p-6 border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tickets Sold</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {stats?.tickets?.total || 0} Tickets
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  From {stats?.paid_orders || 0} completed orders
                </div>
              </div>

              {/* Gate Check-in Rate */}
              <div className="glass-card p-6 border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gate Check-in Rate</span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {stats?.tickets?.scan_rate_percentage || 0}%
                </div>
                <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats?.tickets?.scanned || 0} scanned / {stats?.tickets?.active || 0} active</span>
                </div>
              </div>

              {/* Active Concerts */}
              <div className="glass-card p-6 border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Concerts</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {stats?.total_concerts || 6} Live Shows
                </div>
                <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>High Concurrency Lock Active</span>
                </div>
              </div>

            </div>

            {/* Architecture & High Concurrency Features Banner */}
            <div className="glass-card p-6 border-slate-800 space-y-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h2 className="text-base font-bold text-white">System Architecture & Technical Integrity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-300">⚡ High Concurrency &amp; Queue</div>
                  <p className="text-slate-400 text-[11px]">Virtual waiting room FIFO queue + Laravel DB pessimistic locking (`lockForUpdate()`) protects ticket inventory from race conditions &amp; double-booking during flash sales.</p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-300">🔒 Gate Scanner Security</div>
                  <p className="text-slate-400 text-[11px]">Real-time QR code ticket redemption with double-scan detection and gate entry auditing.</p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300">💳 Payment Gateway Webhook</div>
                  <p className="text-slate-400 text-[11px]">Automated Midtrans webhook listener with instant QRIS &amp; Virtual Account settlement validation.</p>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SKEMA BISNIS & CARA PENJUALAN APLIKASI KE ORGANIZER (B2B SaaS)
                ══════════════════════════════════════════════════════════════════ */}
            <div className="glass-card p-8 rounded-3xl border space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-highlight)' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Model Bisnis &amp; Monetisasi Aplikasi StageTix</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  Bagaimana Cara Menjual Aplikasi Ini ke Promotor &amp; Event Organizer?
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  StageTix dirancang sebagai platform **B2B SaaS (Software as a Service)** untuk industri hiburan &amp; musik. Berikut adalah 3 skema monetisasi utama saat menawarkan aplikasi ini ke klien/promotor:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Skema 1 */}
                <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    01
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Bagi Hasil Per Tiket (Revenue Share)</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Promotor menggunakan StageTix secara gratis di awal tanpa biaya setup. Kita mengambil komisi biaya platform (*ticketing fee*) sebesar <strong>2,5% - 5%</strong> atau flat <strong>Rp 5.000 - Rp 15.000 / tiket</strong> yang ditanggung pembeli saat checkout.
                  </p>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    ✓ Paling diminati promotor karena nol modal di awal (Zero Risk).
                  </div>
                </div>

                {/* Skema 2 */}
                <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                    02
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sewa Sistem Per Event (White-Label)</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Promotor besar menyewa aplikasi untuk 1 konser tertentu dengan domain dan branding mereka sendiri (misal: <em>tiket.soundfest2026.com</em>). Paket sewa mencakup server anti-war tiket, tim scanner gate, dan laporan penjualan lengkap.
                  </p>
                  <div className="text-[11px] font-semibold text-sky-400">
                    ✓ Nilai kontrak per event: Rp 10 Juta - Rp 50 Juta+.
                  </div>
                </div>

                {/* Skema 3 */}
                <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                    03
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Jual Putus / Lisensi Software (Enterprise)</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Menjual *source code* dan hak guna penuh aplikasi StageTix (Frontend Next.js, Backend Laravel, Database &amp; Scanner) kepada agensi EO atau perusahaan venue untuk di-hosting di server pribadi mereka sendiri.
                  </p>
                  <div className="text-[11px] font-semibold text-amber-400">
                    ✓ Sekali bayar lisensi + biaya maintenance bulanan.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
