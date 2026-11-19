'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Ticket, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Eye, 
  EyeOff, 
  Layers 
} from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, sendEmailVerification } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/explore');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Anda harus menyetujui Syarat & Ketentuan StageTix.');
      return;
    }

    setIsSubmitting(true);
    setRegisterSuccess(false);

    try {
      if (email.includes('@')) {
        await sendEmailVerification(email);
      }
      setRegisterSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      {/* Background Subtle Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'var(--accent-glow)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[130px] pointer-events-none" style={{ background: 'var(--primary-glow)' }} />

      <div className="w-full max-w-[1280px] mx-auto relative z-10">
        
        {/* Main Card Wrapper */}
        <div className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[760px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          
          {/* LEFT STAGE: Registration Benefits */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-screen pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80')`
              }}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-main), var(--bg-secondary) 50%, transparent)' }} />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Tiket Resmi &amp; Terpercaya</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Buat Akun Baru</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Pesan Tiket Lebih Cepat di StageTix
                </h1>
                <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--text-muted)' }}>
                  Daftarkan akun untuk menyimpan riwayat e-ticket, checkout lebih cepat saat penjualan tiket konser dibuka, dan terima notifikasi jadwal pertunjukan artis favorit.
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-3 pt-4">
                {[
                  {
                    title: 'Akses Penjualan Tiket Cepat',
                    desc: 'Data identitas tersimpan aman sehingga Anda bisa langsung pesan tiket favorit.',
                  },
                  {
                    title: 'E-Ticket QR Digital di HP',
                    desc: 'Tiket masuk langsung tersimpan di akun Anda dan siap di-scan saat hari-H konser.',
                  },
                  {
                    title: 'Jaminan Tiket Asli',
                    desc: 'Bekerja sama langsung dengan promotor resmi konser dan festival musik di Indonesia.',
                  },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{b.title}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 text-xs flex items-center gap-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Lock className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span>Privasi data KTP &amp; NIK dijamin sesuai UU Perlindungan Data Pribadi.</span>
            </div>
          </div>

          {/* RIGHT STAGE: Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center backdrop-blur-2xl" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <div className="w-full max-w-lg mx-auto space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Buat Akun Pemegang Tiket</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Lengkapi data diri resmi Anda di bawah ini untuk memulai.
                </p>
              </div>

              <div className="space-y-3">
                <GoogleSignInButton />
              </div>

              <div className="relative flex items-center my-4">
                <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }} />
                <span className="shrink-0 px-3 text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  atau lengkapi formulir pendaftaran
                </span>
                <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap (Sesuai KTP)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Fuad Mugits Hasdi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs py-3 px-4 pl-10 rounded-xl focus:outline-none transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* NIK */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nomor Induk Kependudukan (NIK)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        maxLength={16}
                        placeholder="16 Digit NIK KTP Anda"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono py-3 px-4 pl-10 rounded-xl focus:outline-none transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Email Utama</label>
                    <div className="relative">
                      <input 
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs py-3 px-4 pl-10 rounded-xl focus:outline-none transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nomor WhatsApp / HP</label>
                    <div className="relative">
                      <input 
                        type="tel"
                        required
                        placeholder="08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs font-mono py-3 px-4 pl-10 rounded-xl focus:outline-none transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Kata Sandi Akun</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter kombinasi huruf & angka"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs py-3 px-4 pl-10 pr-10 rounded-xl focus:outline-none transition-all"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded cursor-pointer" 
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="terms" className="text-[11px] leading-snug cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    Saya menyatakan data NIK dan identitas yang diisi adalah benar milik pribadi sesuai ketentuan konser dan bersedia mengikuti protokol keamanan tiket.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Mendaftarkan Akun...</span>
                  ) : (
                    <>
                      <span>Daftar Akun StageTix</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {registerSuccess && (
                <div className="p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pendaftaran berhasil! Silakan login untuk mengonfirmasi akses Anda.</span>
                </div>
              )}

              <div className="text-center text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Sudah memiliki akun StageTix?{' '}
                <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--text-primary)' }}>
                  Masuk Sekarang
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
