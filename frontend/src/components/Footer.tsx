import React from 'react';
import Link from 'next/link';
import { Ticket, Shield, Zap, Lock, CreditCard, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="pt-16 pb-12 mt-12" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--text-primary)' }}>
                <Ticket className="w-5 h-5" style={{ color: 'var(--text-inverse)' }} />
              </div>
              <span className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Stage<span style={{ color: 'var(--accent)' }}>Tix</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Platform tiket konsert &amp; festival musik resmi dengan sistem pembayaran instan dan keamanan e-tiket terenkripsi.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg w-fit" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Shield className="w-4 h-4" />
              Enkripsi Keamanan 256-Bit
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>Kategori Event</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/" className="hover:opacity-80 transition-opacity">Pop &amp; Internasional</Link></li>
              <li><Link href="/" className="hover:opacity-80 transition-opacity">EDM &amp; Festival Musik</Link></li>
              <li><Link href="/" className="hover:opacity-80 transition-opacity">Rock &amp; Konser Indie</Link></li>
              <li><Link href="/" className="hover:opacity-80 transition-opacity">Jazz &amp; Pertunjukan Akustik</Link></li>
            </ul>
          </div>

          {/* Payment Gateway Features */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>Metode Pembayaran</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} /> QRIS Instan All-Bank &amp; E-Wallet</li>
              <li className="flex items-center gap-2"><CreditCard className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Virtual Account (BCA, Mandiri, BRI)</li>
              <li className="flex items-center gap-2"><Lock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Kartu Kredit / Debit 3D Secure</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4" style={{ color: 'var(--warning)' }} /> Gerai Retail (Alfamart / Indomaret)</li>
            </ul>
          </div>

          {/* Integration Status */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>Penyelenggara Event</h4>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Ingin mengadakan konser atau festival musik di StageTix? Akses dashboard manajemen event dan scanner gate resmi kami.
            </p>
            <Link 
              href="/organizer" 
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all hover:opacity-80"
              style={{ 
                color: 'var(--text-primary)', 
                background: 'var(--bg-elevated)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <span>Dashboard Penyelenggara</span>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--accent)' }}></span>
            </Link>
          </div>
        </div>

        {/* Payment Partner Logos Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Supported Payments:</span>
            {['QRIS', 'BCA VA', 'MANDIRI VA', 'BRIVA', 'VISA / MC', 'ALFAMART'].map((label) => (
              <span key={label} className="px-2.5 py-1 rounded font-bold" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <span>© 2026 StageTix. Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 fill-current inline" style={{ color: 'var(--danger)' }} />
            <span>untuk Penikmat Musik Konser.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
