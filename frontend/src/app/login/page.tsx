'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Ticket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Layers,
  Crown,
  AlertTriangle,
  Send,
  Clock
} from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuth } from '@/context/AuthContext';
import { checkCrewStatus, submitCrewRequest, SUPER_ADMIN_EMAIL } from '@/lib/crewAccess';

export default function LoginPage() {
  const router = useRouter();
  const { user, signOut, sendEmailVerification, refreshCrewStatus } = useAuth();
  const [role, setRole] = useState<'fan' | 'crew'>('fan');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Crew access request states
  const [showCrewRequestForm, setShowCrewRequestForm] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewRoleType, setCrewRoleType] = useState<'scanner' | 'organizer' | 'admin'>('scanner');
  const [crewNotes, setCrewNotes] = useState('');
  const [crewRequestFeedback, setCrewRequestFeedback] = useState('');

  const currentCrewStatus = identifier.includes('@') ? checkCrewStatus(identifier) : null;

  useEffect(() => {
    if (user) {
      router.push('/explore');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginSuccess(false);

    try {
      if (identifier.includes('@')) {
        await sendEmailVerification(identifier);
      }
      setLoginSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'var(--accent-glow)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'var(--primary-glow)' }} />

      <div className="w-full max-w-[1280px] mx-auto relative z-10">
        
        <div className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[720px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          
          {/* LEFT STAGE */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-screen pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80')`
              }}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, var(--bg-main), var(--bg-secondary) 40%, transparent)` }} />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                <span className="text-[11px] font-bold uppercase tracking-wider">Tiket Konser Resmi</span>
              </div>

              <div className="space-y-2 max-w-lg">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  Selamat Datang
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Akses Konser <br />
                  <span style={{ color: 'var(--accent)' }}>
                    Favoritmu
                  </span>
                </h1>
                <p className="text-sm leading-relaxed max-w-md pt-1" style={{ color: 'var(--text-secondary)' }}>
                  Masuk ke akun Anda untuk melihat jadwal konser, mengelola pesanan tiket, dan melihat e-ticket Anda.
                </p>
              </div>
            </div>

            {/* Middle: Urgency Banner & Ticket Stub */}
            <div className="relative z-10 my-8 space-y-4 max-w-lg">
              <div className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tiket Tersedia</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Pastikan akun Anda aktif untuk pemesanan tiket tanpa hambatan.</div>
                </div>
              </div>

              {/* Ticket Stub */}
              <div className="relative rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: 'var(--bg-main)', borderRight: '1px solid var(--border-color)' }} />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)' }} />

                <div className="flex items-center gap-4 pl-2">
                  <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>DES</span>
                    <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>28</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                        Antrean Terbuka
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stadion Madya GBK</span>
                    </div>
                    <div className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Sheila on 7 - Tunggu Aku di Jakarta</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--warning)' }}>Kapasitas Sisa War: 12% Slot</div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end pr-2 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <TrendingUp className="w-3 h-3" /> Server Traffic
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--success)' }}>99.98% Stabil</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 flex flex-wrap items-center gap-6 pt-4 text-xs" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>NIK Validation Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>&lt; 0.2s War Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Anti-Scalper Lock</span>
              </div>
            </div>
          </div>

          {/* RIGHT STAGE: Auth Form */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center backdrop-blur-2xl" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <div className="w-full max-w-md mx-auto space-y-6">
              
              {/* Role Switcher Tab */}
              <div className="p-1 rounded-xl flex items-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setRole('fan')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center`}
                  style={
                    role === 'fan'
                      ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  Penonton / Pembeli Tiket
                </button>
                <button
                  type="button"
                  onClick={() => setRole('crew')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center`}
                  style={
                    role === 'crew'
                      ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  Mitra Promotor / Kru Gate
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Selamat Datang Kembali</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {role === 'fan' 
                    ? 'Masuk ke akunmu untuk mengelola e-tiket, melihat status antrean war, dan riwayat konser.'
                    : 'Masuk ke dashboard promotor atau terminal gate scanner tiket konser.'}
                </p>
              </div>

              {/* Crew Status Banners */}
              {role === 'crew' && (
                <div className="space-y-3">
                  {identifier.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? (
                    <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2.5" style={{ background: 'var(--warning-subtle)', border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--warning)' }}>
                      <Crown className="w-5 h-5 shrink-0" style={{ color: 'var(--warning)' }} />
                      <div>
                        <div className="font-extrabold" style={{ color: 'var(--text-primary)' }}>Akun Super Admin Utama Teridentifikasi</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Memiliki otoritas penuh persetujuan kru &amp; portal admin</div>
                      </div>
                    </div>
                  ) : currentCrewStatus?.status === 'APPROVED' ? (
                    <div className="p-3 rounded-2xl text-xs flex items-center gap-2" style={{ background: 'var(--success-subtle)', border: '1px solid rgba(52, 211, 153, 0.2)', color: 'var(--success)' }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Akun Kru Terverifikasi &amp; Disetujui oleh Super Admin.</span>
                    </div>
                  ) : currentCrewStatus?.status === 'PENDING' ? (
                    <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2" style={{ background: 'var(--warning-subtle)', border: '1px solid rgba(251, 191, 36, 0.2)', color: 'var(--warning)' }}>
                      <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                      <div>
                        <div className="font-bold">Menunggu Persetujuan Super Admin</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Pengajuan akses kru sedang ditinjau oleh {SUPER_ADMIN_EMAIL}.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl text-xs space-y-2" style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--accent)' }}>
                        <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
                        <span>Kebijakan Otoritas Kru &amp; Promotor</span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Login kru gate/promotor harus memiliki persetujuan dari Super Admin Utama (<strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{SUPER_ADMIN_EMAIL}</strong>).
                      </p>
                      
                      {!showCrewRequestForm ? (
                        <button
                          type="button"
                          onClick={() => setShowCrewRequestForm(true)}
                          className="text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Send className="w-3 h-3" />
                          Ajukan Izin Akses Kru ke Super Admin →
                        </button>
                      ) : (
                        <div className="pt-2 space-y-2.5" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <div className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>Form Pengajuan Akses Kru:</div>
                          <input 
                            type="text"
                            placeholder="Nama Lengkap Anda"
                            value={crewName}
                            onChange={(e) => setCrewName(e.target.value)}
                            className="w-full text-[11px] py-2 px-3 rounded-lg focus:outline-none"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          />
                          <select
                            value={crewRoleType}
                            onChange={(e: any) => setCrewRoleType(e.target.value)}
                            className="w-full text-[11px] py-2 px-2.5 rounded-lg focus:outline-none"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          >
                            <option value="scanner">Kru Scanner Gate Masuk</option>
                            <option value="organizer">Mitra Promotor Event</option>
                            <option value="admin">Asisten Admin</option>
                          </select>
                          <input 
                            type="text"
                            placeholder="Lokasi Gate / Nama Event"
                            value={crewNotes}
                            onChange={(e) => setCrewNotes(e.target.value)}
                            className="w-full text-[11px] py-2 px-3 rounded-lg focus:outline-none"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!identifier.includes('@')) {
                                  alert('Silakan ketikkan alamat email Anda pada kolom form login terlebih dahulu.');
                                  return;
                                }
                                if (!crewName.trim()) {
                                  alert('Mohon isi nama lengkap Anda.');
                                  return;
                                }
                                const res = submitCrewRequest({
                                  email: identifier.trim(),
                                  fullName: crewName.trim(),
                                  role: crewRoleType,
                                  notes: crewNotes.trim()
                                });
                                refreshCrewStatus();
                                setCrewRequestFeedback(res.message);
                                setShowCrewRequestForm(false);
                              }}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                            >
                              <Send className="w-3 h-3" />
                              Kirim Pengajuan
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCrewRequestForm(false)}
                              className="px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}

                      {crewRequestFeedback && (
                        <div className="p-2.5 rounded-lg text-[11px] font-semibold" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                          {crewRequestFeedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Google OAuth */}
              <div className="space-y-3">
                <GoogleSignInButton />
              </div>

              <div className="relative flex items-center my-4">
                <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }} />
                <span className="shrink-0 px-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  atau masuk dengan email terdaftar
                </span>
                <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }} />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Alamat Email atau Nomor Ponsel</label>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Terdaftar di NIK</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="contoh: rafi.pratama@email.com atau 08123456789"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full text-xs py-3 px-4 pl-10 rounded-xl focus:outline-none transition-all"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Kata Sandi</label>
                    <Link href="#" className="text-[11px] hover:underline" style={{ color: 'var(--accent)' }}>
                      Lupa Kata Sandi?
                    </Link>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi akunmu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs py-3 px-4 pl-10 pr-10 rounded-xl focus:outline-none transition-all"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded" 
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                  style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-md)' }}
                >
                  {isSubmitting ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span>Masuk Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Banner */}
              <div className="p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--success)' }} />
                <span>Dilindungi Enkripsi 256-bit &amp; Cloudflare Turnstile Anti-Bot</span>
              </div>

              {/* Register Link */}
              <div className="text-center text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Belum punya akun StageTix?{' '}
                <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
                  Daftar Akun Baru
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
