'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, Flame, Sparkles, LogIn } from 'lucide-react';
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

  return (
    <div className="glass-card group overflow-hidden flex flex-col h-full">
      {/* Concert Poster Banner */}
      <div className="relative h-56 w-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <img 
          src={concert.image} 
          alt={concert.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-main), transparent)' }} />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {concert.isSellingFast && (
            <span className="badge badge-danger shadow-lg">
              <Flame className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              Selling Fast
            </span>
          )}
          {concert.isPopular && (
            <span className="badge badge-primary shadow-lg">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Popular
            </span>
          )}
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-md" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {concert.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--accent)' }}>
            {concert.artist}
          </div>
          <h3 className="text-lg font-bold line-clamp-1 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            {concert.title}
          </h3>

          <div className="mt-3 space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>{concert.date} • {concert.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="truncate">{concert.venue}, {concert.city}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Starts from</div>
            <div className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {formattedPrice}
            </div>
          </div>

          {user ? (
            <Link 
              href={`/concert/${concert.id}`}
              className="btn-primary text-xs py-2 px-4 shadow-none"
            >
              <Ticket className="w-3.5 h-3.5" />
              Buy Ticket
            </Link>
          ) : (
            <Link 
              href="/login"
              className="btn-primary text-xs py-2 px-4 shadow-none flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login to Buy
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
