'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Search, CreditCard, User, Music, Menu, X, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="container-custom h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? "/explore" : "/"} className="flex items-center gap-3 group text-decoration-none">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105" style={{ background: 'var(--brand-gradient)' }}>
            <Ticket className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Stage<span style={{ color: 'var(--primary)' }}>Tix</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Tiket Resmi
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden xl:flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link href="/explore" className="font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap hover:opacity-80" style={{ color: 'var(--primary)' }}>
                <Music className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                Jelajah Konser
              </Link>
              <Link href="/transactions" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <Ticket className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                Tiket Saya
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="font-bold flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg shadow-[0_0_16px_rgba(0,229,255,0.25)] transition-colors" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                Beranda
              </Link>
              <Link href="/#jadwal-konser" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap hover:text-white" style={{ color: 'var(--text-secondary)' }}>
                Jadwal Konser
              </Link>
              <Link href="/#tentang-stagetix" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap hover:text-white" style={{ color: 'var(--text-secondary)' }}>
                Tentang StageTix
              </Link>
            </>
          )}

          {/* Admin & Crew Tools (Concise and discrete) */}
          {user && isAdmin && (
            <div className="flex items-center gap-3 pl-2" style={{ borderLeft: '1px solid var(--border-color)' }}>
              <Link href="/gate-scanner" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs px-2.5 py-1 rounded-lg hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Scanner Gate
              </Link>
              <Link href="/organizer" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs px-2.5 py-1 rounded-lg hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Promotor
              </Link>
              {isSuperAdmin && (
                <Link href="/admin" className="font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs px-2.5 py-1 rounded-lg hover:opacity-80" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right CTA / Search / Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border transition-all hover:scale-105 cursor-pointer"
            style={{ 
              background: 'var(--bg-elevated)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative hidden 2xl:block">
            <input 
              type="text" 
              placeholder="Cari konser atau lokasi..." 
              className="text-xs rounded-xl pl-9 pr-3 py-2 w-48 focus:outline-none transition-all"
              style={{ 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all group shrink-0"
                style={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border-color)' 
                }}
                title="Kelola Profil & Foto"
              >
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  <img 
                    src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full border object-cover group-hover:scale-105 transition-transform shrink-0"
                    style={{ borderColor: 'var(--accent)' }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold whitespace-nowrap group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
                className="p-2 rounded-xl border transition-all shrink-0 cursor-pointer hover:opacity-80"
                style={{ 
                  background: 'var(--bg-elevated)', 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-muted)' 
                }}
                title="Keluar / Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex items-center justify-center font-bold text-sm px-4 py-2 rounded-xl transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
                Masuk
              </Link>
              <Link href="/login?mode=register" className="btn-primary text-sm py-2 px-5 font-bold">
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border cursor-pointer"
            style={{ 
              background: 'var(--bg-elevated)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border"
            style={{ 
              background: 'var(--bg-elevated)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b px-6 py-6 space-y-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          {user ? (
            <>
              <Link 
                href="/explore" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-lg py-2"
                style={{ color: 'var(--accent)' }}
              >
                🎵 Jelajah Konser
              </Link>
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                🏠 Beranda
              </Link>
              <Link 
                href="/checkout" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                💳 Checkout
              </Link>
              <Link 
                href="/transactions" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                🎫 Tiket Saya
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-lg py-2"
                style={{ color: 'var(--text-primary)' }}
              >
                🏠 Beranda
              </Link>
              <Link 
                href="/#jadwal-konser" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                🔥 Jadwal Konser
              </Link>
              <Link 
                href="/#tentang-stagetix" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                ⭐ Tentang StageTix
              </Link>
            </>
          )}

          {user && isAdmin && (
            <>
              <Link 
                href="/gate-scanner" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--success)' }}
              >
                🔒 Scanner Gate
              </Link>
              <Link 
                href="/organizer" 
                onClick={() => setMobileMenuOpen(false)}
                className="block font-medium text-lg py-2"
                style={{ color: 'var(--warning)' }}
              >
                📊 Dashboard Promotor
              </Link>
              {isSuperAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-bold text-lg py-2"
                  style={{ color: 'var(--warning)' }}
                >
                  ⚡ Portal Super Admin
                </Link>
              )}
            </>
          )}

          <div className="pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            {user ? (
              <button
                onClick={async () => { 
                  await signOut(); 
                  setMobileMenuOpen(false); 
                  window.location.href = '/';
                }}
                className="btn-secondary w-full text-center cursor-pointer"
                style={{ color: 'var(--danger)' }}
              >
                Sign Out ({user.user_metadata?.full_name || user.email})
              </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
