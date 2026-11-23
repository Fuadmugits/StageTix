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
  Search,
  Filter,
  Download,
  AlertTriangle,
  Server,
  Layers,
  Activity,
  ArrowRight,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Mail,
  Phone,
  Check,
  X,
  Trash2,
  Lock,
  Crown
} from 'lucide-react';
import { organizerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  getCrewRequests, 
  updateRequestStatus, 
  revokeCrewAccess, 
  submitCrewRequest, 
  CrewRequest,
  SUPER_ADMIN_EMAIL 
} from '@/lib/crewAccess';

export default function AdminPortalPage() {
  const { user, isSuperAdmin, isAdmin, loading: authLoading, refreshCrewStatus } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'approvals' | 'gates'>('overview');

  // Crew & Admin Approvals State
  const [crewRequests, setCrewRequests] = useState<CrewRequest[]>([]);
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchCrew, setSearchCrew] = useState('');
  
  // Direct Add Crew Form Modal/Drawer State
  const [newCrewEmail, setNewCrewEmail] = useState('');
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewPhone, setNewCrewPhone] = useState('');
  const [newCrewRole, setNewCrewRole] = useState<'scanner' | 'organizer' | 'admin'>('scanner');
  const [newCrewNotes, setNewCrewNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadRequests = () => {
    setCrewRequests(getCrewRequests());
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await organizerApi.getStats();
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      loadRequests();
    }
  }, [isAdmin]);

  const handleApprove = (id: string, name: string) => {
    updateRequestStatus(id, 'APPROVED');
    loadRequests();
    refreshCrewStatus();
    setActionSuccessMsg(`Akses kru untuk "${name}" berhasil disetujui!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleReject = (id: string, name: string) => {
    updateRequestStatus(id, 'REJECTED');
    loadRequests();
    refreshCrewStatus();
    setActionSuccessMsg(`Akses kru untuk "${name}" telah ditolak.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleRevoke = (email: string, name: string) => {
    if (confirm(`Yakin ingin mencabut akses kru untuk ${name} (${email})?`)) {
      revokeCrewAccess(email);
      loadRequests();
      refreshCrewStatus();
      setActionSuccessMsg(`Izin akses untuk ${name} telah dicabut.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  const handleDirectAddCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewEmail.trim() || !newCrewName.trim()) {
      alert('Mohon isi email dan nama kru.');
      return;
    }

    const res = submitCrewRequest({
      email: newCrewEmail.trim(),
      fullName: newCrewName.trim(),
      phone: newCrewPhone.trim(),
      role: newCrewRole,
      notes: newCrewNotes.trim() || 'Ditambahkan langsung oleh Super Admin'
    });

    // Otomatis langsung approve karena ditambahkan oleh Super Admin
    updateRequestStatus(res.request.id, 'APPROVED');
    loadRequests();
    refreshCrewStatus();

    setNewCrewEmail('');
    setNewCrewName('');
    setNewCrewPhone('');
    setNewCrewNotes('');

    setActionSuccessMsg(`Kru ${newCrewName} (${newCrewEmail}) langsung diaktifkan sebagai ${res.request.roleLabel}!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  if (!authLoading && (!user || !isAdmin)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 text-center">
        <div className="glass-card max-w-md p-8 border-rose-500/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Akses Terbatas: Khusus Super Admin &amp; Kru</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman ini memerlukan persetujuan dari Super Admin Utama (<strong className="text-slate-200">{SUPER_ADMIN_EMAIL}</strong>).
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-primary text-xs py-2.5 px-6">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = crewRequests.filter(r => r.status === 'PENDING').length;
  const filteredRequests = crewRequests.filter(r => {
    const matchesFilter = approvalFilter === 'ALL' || r.status === approvalFilter;
    const matchesSearch = 
      r.fullName.toLowerCase().includes(searchCrew.toLowerCase()) ||
      r.email.toLowerCase().includes(searchCrew.toLowerCase()) ||
      r.roleLabel.toLowerCase().includes(searchCrew.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="container-custom max-w-[1400px] space-y-8">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: 'var(--accent)', color: '#ffffff' }}>
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Portal Super Admin</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  ADMIN UTAMA: {SUPER_ADMIN_EMAIL}
                </span>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase animate-pulse" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    {pendingCount} Permohonan Kru Menunggu
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Persetujuan kru gate scanner, manajemen hak akses promotor, dan monitoring live revenue tiket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/gate-scanner" 
              className="btn-secondary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Terminal Scanner Gate
            </Link>

            <button 
              onClick={() => { fetchStats(); loadRequests(); }}
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-3 pb-3 overflow-x-auto scrollbar-none" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveSubTab('overview')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            style={
              activeSubTab === 'overview'
                ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
            }
          >
            <BarChart3 className="w-4 h-4" />
            Ringkasan Finansial &amp; Event
          </button>

          <button
            onClick={() => setActiveSubTab('approvals')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative"
            style={
              activeSubTab === 'approvals'
                ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
            }
          >
            <UserCheck className="w-4 h-4" />
            Persetujuan Akses Kru &amp; Admin
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: 'var(--danger)' }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('gates')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            style={
              activeSubTab === 'gates'
                ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
            }
          >
            <Activity className="w-4 h-4" />
            Log Gate Scanner Real-Time
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════
            TAB 2: PERSETUJUAN KRU & ADMIN (APPROVAL MANAGEMENT)
            ═════════════════════════════════════════════════════════ */}
        {activeSubTab === 'approvals' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Super Admin Notice Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Sistem Otoritas Tunggal Admin Utama</span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Hanya email <strong className="text-white font-mono">{SUPER_ADMIN_EMAIL}</strong> yang dapat memberikan persetujuan akses bagi staf scanner gate dan mitra promotor. Akun tanpa persetujuan tidak dapat mengakses scanner dan data tiket penonton.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-white">{crewRequests.length}</div>
                  <div className="text-[10px] text-slate-400">Total Permohonan</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-rose-400">{pendingCount}</div>
                  <div className="text-[10px] text-slate-400">Menunggu</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {crewRequests.filter(r => r.status === 'APPROVED').length}
                  </div>
                  <div className="text-[10px] text-slate-400">Disetujui</div>
                </div>
              </div>
            </div>

            {/* Quick Add Crew Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#131318] border border-[#2D2D42] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <UserPlus className="w-5 h-5 text-[#00f5d4]" />
                <h3 className="text-base font-bold text-white">Izinkan Email Kru Secara Langsung (Pre-Approve)</h3>
              </div>

              <form onSubmit={handleDirectAddCrew} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Email Kru / Staff</label>
                  <input 
                    type="email"
                    required
                    placeholder="contoh: staff.gate2@stagetix.id"
                    value={newCrewEmail}
                    onChange={(e) => setNewCrewEmail(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00f5d4] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Nama Lengkap &amp; Jabatan</label>
                  <input 
                    type="text"
                    required
                    placeholder="contoh: Rizky Pratama (Koordinator Gate)"
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00f5d4] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Peran Izin</label>
                  <select
                    value={newCrewRole}
                    onChange={(e: any) => setNewCrewRole(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#00f5d4] focus:outline-none"
                  >
                    <option value="scanner">Kru Scanner Gate</option>
                    <option value="organizer">Promotor Event</option>
                    <option value="admin">Asisten Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Catatan Lokasi Gate</label>
                  <input 
                    type="text"
                    placeholder="Gate B - GBK"
                    value={newCrewNotes}
                    onChange={(e) => setNewCrewNotes(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2D2D42] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#00f5d4] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button 
                    type="submit"
                    className="w-full btn-primary text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 bg-[#00f5d4] text-slate-950 font-bold hover:bg-[#00f5d4]/90"
                  >
                    <Check className="w-4 h-4" />
                    Izinkan Akses
                  </button>
                </div>
              </form>
            </div>

            {/* Crew Requests Table with Search & Status Filters */}
            <div className="p-6 rounded-3xl bg-[#131318] border border-[#2D2D42] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#7c5cff]" />
                    Daftar Permohonan Izin Kru &amp; Admin
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tinjau permohonan staf dan berikan persetujuan untuk mengaktifkan terminal gate
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Cari email / nama..."
                      value={searchCrew}
                      onChange={(e) => setSearchCrew(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#ff3b5c]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter Status Pills */}
                  <div className="flex items-center gap-1.5">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setApprovalFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          approvalFilter === st
                            ? 'bg-[#7c5cff] text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table List */}
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Tidak ada data permohonan yang sesuai kriteria filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Nama &amp; Email Kru</th>
                        <th className="py-3 px-4">Peran Diminta</th>
                        <th className="py-3 px-4">Waktu Pengajuan</th>
                        <th className="py-3 px-4">Catatan / Gate</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{req.fullName}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{req.email}</div>
                            {req.phone && <div className="text-slate-500 text-[10px]">{req.phone}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-200">{req.roleLabel}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {new Date(req.requestedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                            {req.notes || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {req.status === 'APPROVED' && <Check className="w-3 h-3" />}
                              {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                              {req.status === 'REJECTED' && <X className="w-3 h-3" />}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {req.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(req.id, req.fullName)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md transition-all cursor-pointer"
                                    title="Setujui Akses Kru"
                                  >
                                    <Check className="w-3 h-3" />
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleReject(req.id, req.fullName)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    title="Tolak Akses Kru"
                                  >
                                    <X className="w-3 h-3" />
                                    Tolak
                                  </button>
                                </>
                              )}

                              {req.status === 'APPROVED' && (
                                <button
                                  onClick={() => handleRevoke(req.email, req.fullName)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 font-bold text-[11px] flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                                  title="Cabut Izin Akses"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Cabut Izin
                                </button>
                              )}

                              {req.status === 'REJECTED' && (
                                <button
                                  onClick={() => handleApprove(req.id, req.fullName)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                  title="Pulihkan & Setujui"
                                >
                                  <Check className="w-3 h-3" />
                                  Pulihkan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 1: OVERVIEW METRIK & STATISTIK
            ═════════════════════════════════════════════════════════ */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Revenue */}
              <div className="p-6 rounded-3xl bg-[#181824] border border-[#2D2D42] space-y-3 relative overflow-hidden group hover:border-[#7c5cff] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan Tiket</span>
                  <div className="w-9 h-9 rounded-xl bg-[#7c5cff]/20 text-[#cabeff] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    Rp {(stats?.total_revenue || 0).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Real-time pendapatan tersinkronisasi</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Sold Tickets */}
              <div className="p-6 rounded-3xl bg-[#181824] border border-[#2D2D42] space-y-3 relative overflow-hidden group hover:border-[#ff4d8d] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiket Terjual Lunas</span>
                  <div className="w-9 h-9 rounded-xl bg-[#ff4d8d]/20 text-[#ff80ab] flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats?.tickets?.total || 0} <span className="text-xs text-slate-400 font-sans font-normal">Lembar</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <span className="text-[#cabeff] font-bold">Slot Kuota Terkini</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Gate Scan Rate */}
              <div className="p-6 rounded-3xl bg-[#181824] border border-[#2D2D42] space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Check-in Gate Rate</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats?.tickets?.scan_rate_percentage || 0}%
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    <span>{stats?.tickets?.scanned || 0} dari {stats?.tickets?.total || 0} tiket masuk gate</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Active Audiences */}
              <div className="p-6 rounded-3xl bg-[#181824] border border-[#2D2D42] space-y-3 relative overflow-hidden group hover:border-purple-500 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi Lunas</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats?.paid_orders || 0} <span className="text-xs text-slate-400 font-sans font-normal">Pesanan</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <span>Total pesanan lunas terverifikasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Section: Real-time Concurrency & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-[#131318] border border-[#2D2D42] space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-5 h-5 text-[#7c5cff]" />
                      <h3 className="text-base font-bold text-white">Distribusi Kuota &amp; Kategori Tiket</h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      {stats?.tier_distribution?.concert_title || 'Sinkronisasi Database Live'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {stats?.tier_distribution?.tiers && stats.tier_distribution.tiers.length > 0 ? (
                      stats.tier_distribution.tiers.map((tier: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#181824] border border-[#2D2D42] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white">{tier.name}</span>
                              <span className="text-slate-400 ml-2 font-mono">{tier.price}</span>
                            </div>
                            <span className={`font-mono font-bold ${tier.is_sold_out ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {tier.is_sold_out ? 'SOLD OUT' : `${tier.percentage}% TERJUAL`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${tier.color || 'bg-emerald-400'} rounded-full transition-all duration-500`} 
                              style={{ width: `${Math.min(100, Math.max(tier.percentage, 5))}%` }} 
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span>Terjual: {tier.sold} tiket</span>
                            <span>Sisa Kuota: {tier.available} / {tier.cap} tiket</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">
                        Tidak ada data kuota tiket aktif.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-[#131318] border border-[#2D2D42] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Log Aktivitas Gate Scanner Real-Time</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      Live Stream
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(stats?.recent_scans || []).map((scan: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#181824] border border-[#2D2D42] flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{scan.code}</span>
                            <span className="text-[10px] text-slate-400">({scan.tier})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{scan.holder} • {scan.gate}</div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            scan.status === 'GRANTED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {scan.status === 'GRANTED' ? 'ACCESS GRANTED' : 'DUPLICATE / DENIED'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{scan.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <Link 
                      href="/gate-scanner" 
                      className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-2 border-slate-700"
                    >
                      Buka Gate Terminal Scanner
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            TAB 3: GATES & LIVE SCAN AUDIT
            ═════════════════════════════════════════════════════════ */}
        {activeSubTab === 'gates' && (
          <div className="p-8 rounded-3xl bg-[#131318] border border-[#2D2D42] space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  Terminal Integrasi Scanner Gate Konser
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pantau gate masuk yang sedang aktif dioperasikan oleh kru terverifikasi
                </p>
              </div>
              <Link href="/gate-scanner" className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500">
                Buka Layar Scanner Lapangan
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  gate: 'Gate A - Main Entrance', 
                  scanner: 'Petugas Scan Aktif', 
                  status: (stats?.tickets?.scanned || 0) > 0 ? 'ACTIVE' : 'READY', 
                  scanned: stats?.tickets?.scanned || 0, 
                  target: stats?.tickets?.total || 1 
                },
                { 
                  gate: 'Gate B - East Wing', 
                  scanner: 'Sistem Terhubung', 
                  status: 'READY', 
                  scanned: 0, 
                  target: stats?.tickets?.total || 1 
                },
                { 
                  gate: 'Gate C - VIP Entrance', 
                  scanner: 'Sistem Terhubung', 
                  status: 'READY', 
                  scanned: 0, 
                  target: stats?.tickets?.total || 1 
                },
              ].map((gt, idx) => {
                const pct = Math.min(100, Math.round((gt.scanned / gt.target) * 100));
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-[#181824] border border-[#2D2D42] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{gt.gate}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {gt.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">Status: <strong className="text-slate-200">{gt.scanner}</strong></div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Progres Gate Scan</span>
                        <span className="font-mono text-emerald-400 font-bold">{gt.scanned} / {gt.target} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
