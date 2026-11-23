'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, Flame, Sparkles, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Concert } from '../types';
import { useAuth } from '@/context/AuthContext';

interface ConcertCardProps {
  concert: Concert;
}

export default function ConcertCard({ concert }: ConcertCardProps) {
  const { user } = useAuth();

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(concert.minPrice);

  // Calculate live stock from tiers or backend direct fields
  const remainingStock = concert.remainingStock ?? (
    concert.ticketTiers && concert.ticketTiers.length > 0 
      ? concert.ticketTiers.reduce((acc, t) => acc + (t.available || 0), 0)
      : undefined
  );

  const totalStock = concert.totalStock ?? (
    concert.ticketTiers && concert.ticketTiers.length > 0
      ? concert.ticketTiers.reduce((acc, t) => acc + (t.available || 0), 0)
      : undefined
  );

  const isSoldOut = concert.isSoldOut || (remainingStock !== undefined && remainingStock <= 0);
  const isLowStock = remainingStock !== undefined && remainingStock > 0 && remainingStock <= 50;

  return (
    <div className="glass-card group overflow-hidden flex flex-col h-full rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-cyan-500/30">
      {/* Concert Poster Banner */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <img 
          src={concert.image} 
          alt={concert.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-main), transparent)' }} />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 sm:gap-2 max-w-[85%]">
          {isSoldOut ? (
            <span className="badge bg-rose-500/90 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-lg backdrop-blur-md">
              SOLD OUT
            </span>
          ) : isLowStock ? (
            <span className="badge badge-danger shadow-lg text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 animate-pulse">
              <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5" style={{ color: 'var(--danger)' }} />
              Sisa {remainingStock} Tiket!
            </span>
          ) : concert.isSellingFast ? (
            <span className="badge badge-danger shadow-lg text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
              <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5" style={{ color: 'var(--danger)' }} />
              Selling Fast
            </span>
          ) : null}

          {concert.isPopular && !isSoldOut && (
            <span className="badge badge-primary shadow-lg text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" style={{ color: 'var(--accent)' }} />
              Popular
            </span>
          )}
        </div>

        {/* Category Tag & Live Stock pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-md" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {concert.category}
          </span>

          {remainingStock !== undefined && (
            <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-md border ${
              isSoldOut 
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' 
                : isLowStock 
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            }`}>
              {isSoldOut ? 'Tiket Habis' : `Tersedia: ${remainingStock} tiket`}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--accent)' }}>
            {concert.artist}
          </div>
          <h3 className="text-base sm:text-lg font-bold line-clamp-1 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            {concert.title}
          </h3>

          <div className="mt-2.5 space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="truncate">{concert.date} • {concert.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="truncate">{concert.venue}, {concert.city}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Starts from</div>
            <div className="text-sm sm:text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {formattedPrice}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {isSoldOut ? (
              <button 
                disabled 
                className="w-full sm:w-auto text-xs py-2 px-3 sm:px-4 rounded-xl font-bold bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              >
                Sold Out
              </button>
            ) : user ? (
              <Link 
                href={`/concert/${concert.id}`}
                className="btn-primary w-full sm:w-auto text-xs py-2 px-3 sm:px-4 shadow-none flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                Buy Ticket
              </Link>
            ) : (
              <Link 
                href="/login"
                className="btn-primary w-full sm:w-auto text-xs py-2 px-3 sm:px-4 shadow-none flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login to Buy
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
