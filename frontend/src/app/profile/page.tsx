'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Camera, 
  Upload, 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  Save, 
  LogOut,
  Ticket,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarPreview(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
    }
  }, [user?.email, user?.id]);

  // Handle Upload Foto dari file komputer/HP
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
          setSaveSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan perubahan profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        avatar_url: avatarPreview || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-10 pb-24 relative min-h-[90vh]">
      {/* Background Subtle Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[120px] pointer-events-none rounded-full" style={{ background: 'var(--accent-glow)' }} />

      <div className="container-custom max-w-3xl relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/explore" className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Jelajah Konser
          </Link>

          <Link href="/transactions" className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2">
            <Ticket className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Tiket Saya
          </Link>
        </div>

        {/* Card Profil Utama */}
        <div className="glass-card p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
                <User className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                Profil Akun StageTix
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Kelola foto avatar konser Anda dan informasi identitas pemegang tiket.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ShieldCheck className="w-4 h-4" />
              <span>Akun Terverifikasi</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            {/* Bagian Foto Profil */}
            <div className="space-y-4">
              <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Foto Profil / Avatar Konser
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                {/* Avatar Preview */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg" style={{ borderColor: 'var(--border-highlight)', background: 'var(--bg-card)' }}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-2xl" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                        {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Ganti</span>
                  </div>
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Foto Baru
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview('')}
                        className="btn-secondary text-xs py-2 px-3 cursor-pointer"
                        style={{ color: 'var(--danger)' }}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Mendukung file PNG, JPG, GIF hingga 5MB. Foto otomatis tampil di Navbar dan status pemesanan.
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian Detail Informasi */}
            <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Nama Lengkap (Ditampilkan di Akun & Tiket)
                    </label>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {fullName.length} karakter (Min. 3 huruf)
                    </span>
                  </div>
                  <input 
                    type="text"
                    minLength={3}
                    maxLength={50}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setSaveSuccess(false);
                    }}
                    placeholder="Contoh: Fuad Hasdi"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Alamat Email (Akun Utama)
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      disabled
                      value={user?.email || 'user@example.com'}
                      className="w-full rounded-xl px-4 py-2.5 text-sm cursor-not-allowed pl-10"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Feedback sukses */}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold p-3 rounded-xl animate-fade-in" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Foto profil dan data akun berhasil disimpan!</span>
              </div>
            )}

            {/* Tombol Simpan & Logout */}
            <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push('/');
                }}
                className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--danger)' }}
              >
                <LogOut className="w-4 h-4" />
                Keluar Akun
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
