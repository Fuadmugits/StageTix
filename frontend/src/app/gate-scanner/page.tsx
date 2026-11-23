'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Ticket, 
  Clock, 
  Camera, 
  CameraOff, 
  Keyboard,
  UserCheck,
  Send
} from 'lucide-react';
import { ticketApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { SUPER_ADMIN_EMAIL, submitCrewRequest } from '@/lib/crewAccess';

export default function GateScannerPage() {
  const { user, isSuperAdmin, isApprovedCrew, crewStatus, loading: authLoading, refreshCrewStatus } = useAuth();
  const [requestSent, setRequestSent] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [ticketInput, setTicketInput] = useState('');
  const [gateName, setGateName] = useState('Gate A - Main Entrance');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<{
    result: 'GRANTED' | 'ALREADY_USED' | 'INVALID' | 'UNPAID' | null;
    message: string;
    data?: any;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<Array<{
    code: string;
    status: string;
    time: string;
    holder: string;
  }>>([]);

  const html5QrCodeRef = useRef<any>(null);
  const isProcessingScanRef = useRef<boolean>(false);
  const isStartingCameraRef = useRef<boolean>(false);

  // Core scan execution logic
  const executeScan = async (rawCode: string) => {
    let cleanCode = rawCode.trim();
    if (!cleanCode) return;

    // Support scanned QR JSON payloads e.g. {"ticket_code":"TCK-..."} or direct strings
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.ticket_code) {
          cleanCode = parsed.ticket_code;
        }
      } catch {
        // Fallback to raw string
      }
    }

    setTicketInput(cleanCode);
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await ticketApi.scan(cleanCode, gateName);
      setScanResult({
        result: res.result,
        message: res.message,
        data: res.data,
      });

      setScanHistory(prev => [
        {
          code: cleanCode,
          status: 'ACCESS GRANTED',
          time: new Date().toLocaleTimeString(),
          holder: res.data?.holder_name || 'Attendee',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      const msg = err.message || 'Ticket scanning failed.';
      let resultType: 'ALREADY_USED' | 'INVALID' | 'UNPAID' | 'WRONG_GATE' = 'INVALID';
      
      if (msg.includes('ALREADY')) resultType = 'ALREADY_USED';
      else if (msg.includes('WRONG GATE') || msg.includes('SALAH GERBANG')) resultType = 'WRONG_GATE';
      else if (msg.includes('unpaid') || msg.includes('expired')) resultType = 'UNPAID';

      setScanResult({
        result: resultType,
        message: msg,
      });

      setScanHistory(prev => [
        {
          code: cleanCode,
          status: resultType === 'ALREADY_USED' ? 'DUPLICATE' : resultType === 'WRONG_GATE' ? 'WRONG GATE' : 'INVALID',
          time: new Date().toLocaleTimeString(),
          holder: 'Unknown / Invalid',
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsScanning(false);
      setTimeout(() => {
        isProcessingScanRef.current = false;
      }, 2000);
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeScan(ticketInput);
  };

  // Start Camera QR Scanner
  const startCamera = async () => {
    // Prevent overlapping / concurrent start transitions
    if (isStartingCameraRef.current) return;
    isStartingCameraRef.current = true;
    setCameraError(null);

    try {
      const { Html5Qrcode, Html5QrcodeScannerState } = await import('html5-qrcode');
      
      const qrElement = document.getElementById('qr-reader');
      if (!qrElement) {
        isStartingCameraRef.current = false;
        return;
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      // Check current state before start
      const currentState = html5QrCodeRef.current.getState?.();
      if (currentState === Html5QrcodeScannerState.SCANNING || currentState === Html5QrcodeScannerState.PAUSED) {
        setIsCameraActive(true);
        isStartingCameraRef.current = false;
        return;
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        if (isProcessingScanRef.current) return;
        isProcessingScanRef.current = true;
        // Beep audio feedback on scan detect
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch {}
        executeScan(decodedText);
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 25, // Higher frame rate for snappier scanning
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            // Larger detection bounding box to catch QR from various distances easily
            const qrboxSize = Math.floor(minEdge * 0.88);
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          aspectRatio: 1.0,
          disableFlip: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true // Native hardware acceleration on modern Chrome/Android/iOS
          }
        },
        qrCodeSuccessCallback,
        undefined
      );

      setIsCameraActive(true);
    } catch (err: any) {
      // Don't show user-facing error if it was just an abort/transition race condition
      const errMsg = err?.message || String(err);
      if (errMsg.includes('transition') || errMsg.includes('already under transition')) {
        console.warn('Camera transition handled gracefully:', errMsg);
      } else {
        console.error('Camera QR start error:', err);
        setCameraError(
          err?.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.'
        );
      }
      setIsCameraActive(false);
    } finally {
      isStartingCameraRef.current = false;
    }
  };

  // Stop Camera QR Scanner
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        const { Html5QrcodeScannerState } = await import('html5-qrcode');
        const currentState = html5QrCodeRef.current.getState?.();
        if (currentState === Html5QrcodeScannerState.SCANNING || currentState === Html5QrcodeScannerState.PAUSED) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping camera gracefully:', err);
      }
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'camera') {
      // Delay slightly to ensure DOM element 'qr-reader' is ready
      const timer = setTimeout(() => {
        if (isMounted) startCamera();
      }, 150);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [activeTab]);

  // ═══════════════════════════════════════════════════════════
  // APPROVAL GUARD: Khusus Super Admin & Kru yang Disetujui
  // ═══════════════════════════════════════════════════════════
  if (!authLoading && (!user || (!isSuperAdmin && !isApprovedCrew))) {
    const handleSendRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.email) return;

      submitCrewRequest({
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'scanner',
        notes: requestNotes || `Permohonan kru gate scanner untuk ${gateName}`
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
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Akses Scanner Memerlukan Persetujuan</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Terminal Gate Scanner dibatasi ketat demi keamanan tiket. Hanya akun yang telah disetujui langsung oleh Super Admin Utama (<strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{SUPER_ADMIN_EMAIL}</strong>) yang diizinkan melakukan verifikasi tiket di gerbang venue.
            </p>
          </div>

          {!user ? (
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Silakan login terlebih dahulu untuk mengajukan permohonan akses kru gate.</p>
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
                  <span style={{ color: 'var(--text-muted)' }}>Status Akses Kru:</span>
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
                  <p className="font-bold">Permohonan Anda Telah Tercatat!</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Super Admin (<span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{SUPER_ADMIN_EMAIL}</span>) telah menerima pengajuan ini di panel kontrol. Terminal scanner akan aktif otomatis segera setelah permohonan Anda disetujui.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-3 text-left">
                  <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Catatan Pengajuan (Nama Gerbang / Event):</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Petugas Gate A Konser Coldplay"
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
                    Kirim Permohonan Akses ke Super Admin
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
      <div className="container-custom max-w-4xl space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Gate Ticket Scanner</h1>
                <span className="badge badge-success text-[10px]">
                  LIVE GATE MODE
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Scan QR Code tiket dengan kamera atau masukkan kode tiket di gerbang masuk</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/organizer" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Organizer Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Scanner Controller */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="glass-card p-6 space-y-6 rounded-2xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gate Location</label>
                <select 
                  value={gateName} 
                  onChange={(e) => setGateName(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option>Gate A - Main Entrance</option>
                  <option>Gate B - VIP & Fast Track</option>
                  <option>Gate C - East Gate</option>
                </select>
              </div>

              {/* Mode Toggle Tabs: Camera Scanner vs Manual Input */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  style={
                    activeTab === 'camera'
                      ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Camera className="w-4 h-4" />
                  Live Camera QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  style={
                    activeTab === 'manual'
                      ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-sm)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Keyboard className="w-4 h-4" />
                  Ketik Kode Manual
                </button>
              </div>

              {/* Camera Scanner View */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-dashed border-emerald-500/40 p-2 min-h-[300px] flex flex-col items-center justify-center">
                    <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-xl" />
                    
                    {cameraError && (
                      <div className="p-4 text-center space-y-2">
                        <CameraOff className="w-10 h-10 text-rose-400 mx-auto" />
                        <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    Arahkan kamera ke QR Code di layar HP tiket pengunjung
                  </p>
                </div>
              )}

              {/* Manual Input Form */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Scan Barcode / Masukkan Kode Tiket</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Masukkan Kode Tiket (cth: TCK-...)"
                        value={ticketInput}
                        onChange={(e) => setTicketInput(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 text-white font-mono text-sm py-3.5 px-4 pl-11 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase placeholder:normal-case"
                        autoFocus
                      />
                      <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isScanning || !ticketInput.trim()}
                      className="w-full btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Memverifikasi Tiket...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Scan & Redeem Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Scan Feedback Result Card */}
            {scanResult && (
              <div className={`glass-card p-6 border-2 transition-all animate-fade-in ${
                scanResult.result === 'GRANTED'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-2xl shadow-emerald-500/10'
                  : scanResult.result === 'ALREADY_USED'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-2xl shadow-amber-500/10'
                  : 'bg-rose-950/40 border-rose-500/80 shadow-2xl shadow-rose-500/10'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    scanResult.result === 'GRANTED' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : scanResult.result === 'ALREADY_USED'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {scanResult.result === 'GRANTED' && <CheckCircle2 className="w-8 h-8" />}
                    {scanResult.result === 'ALREADY_USED' && <AlertTriangle className="w-8 h-8" />}
                    {scanResult.result === 'WRONG_GATE' && <AlertTriangle className="w-8 h-8 text-rose-400" />}
                    {scanResult.result === 'INVALID' && <XCircle className="w-8 h-8" />}
                    {scanResult.result === 'UNPAID' && <AlertTriangle className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        scanResult.result === 'GRANTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : scanResult.result === 'ALREADY_USED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {scanResult.result === 'GRANTED' ? 'ACCESS GRANTED' : scanResult.result}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {scanResult.message}
                    </h3>

                    {scanResult.data && (
                      <div className="bg-slate-900/80 p-3 rounded-lg text-xs space-y-1 text-slate-300 font-mono mt-2 border border-slate-800">
                        <div><strong className="text-slate-400">Attendee:</strong> {scanResult.data.holder_name}</div>
                        <div><strong className="text-slate-400">Tier:</strong> {scanResult.data.tier_name} (Seat: {scanResult.data.seat_number})</div>
                        <div><strong className="text-slate-400">Concert:</strong> {scanResult.data.concert_title}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Gate Logs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">Live Gate Log History</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {scanHistory.length} Recent Scans
                </span>
              </div>

              {scanHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <Ticket className="w-8 h-8 mx-auto opacity-40" />
                  <p>Belum ada tiket yang di-scan pada sesi ini.</p>
                  <p className="text-[11px] text-slate-600">Scan QR Code dengan kamera atau masukkan kode di sebelah kiri.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scanHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-slate-200">{item.code}</div>
                        <div className="text-[11px] text-slate-400">{item.holder}</div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'ACCESS GRANTED' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.status}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
