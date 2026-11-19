'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, ArrowRight, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email) {
      const userEmail = user.email.toLowerCase();
      const storedOrders: Order[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('stagetix_order_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            if (item && item.id && !storedOrders.some(o => o.id === item.id)) {
              const orderEmail = (item.customer?.email || item.customerEmail || item.userEmail || '').toLowerCase();
              // Only display orders that match this specific logged in user's email
              if (orderEmail === userEmail) {
                storedOrders.push(item);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setOrders(storedOrders);
    }
  }, [user?.email]);


  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="py-10 pb-24 space-y-8">
      <div className="container-custom">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Ticket className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              Riwayat Transaksi & Tiket
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Lihat pesanan aktif, status pembayaran, dan akses e-ticket digital Anda.
            </p>
          </div>

          {/* Filter Status Buttons */}
          <div className="flex items-center gap-2">
            {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={
                  filterStatus === st
                    ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
                }
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / Cards List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {ord.id}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Dibuat: {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {ord.concertTitle}
                  </h3>

                  <div className="text-xs space-x-3" style={{ color: 'var(--text-secondary)' }}>
                    <span>{ord.items?.[0]?.tierName || (ord as any).tierName || ord.concertVenue || 'Ticket'}</span>
                    <span>•</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      Rp {(ord.total || 0).toLocaleString('id-ID')}
                    </span>
                    <span>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{ord.paymentMethodName || 'Payment'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {ord.status === 'PAID' && (
                    <div className="flex items-center gap-3">
                      <span className="badge badge-success">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                      </span>
                      <Link href={`/ticket/${(ord as any).ticketCode || ord.id}`} className="btn-primary text-xs py-2 px-4">
                        Lihat E-Ticket
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {ord.status === 'PENDING' && (
                    <div className="flex items-center gap-3">
                      <span className="badge badge-warning">
                        <Clock className="w-3.5 h-3.5" /> PENDING
                      </span>
                      <Link href={`/payment/${ord.id}`} className="btn-primary text-xs py-2 px-4">
                        Selesaikan Pembayaran
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {ord.status === 'CANCELLED' && (
                    <span className="badge badge-danger">
                      <XCircle className="w-3.5 h-3.5" /> CANCELLED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center space-y-4 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
            <Ticket className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tidak Ada Transaksi</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum ada riwayat transaksi dengan status &quot;{filterStatus}&quot;.</p>
            <Link href="/explore" className="btn-primary text-xs py-2.5 px-6 inline-block">
              Jelajah Konser
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
