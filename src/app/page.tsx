"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mic, PiggyBank, LayoutDashboard, LogOut, Settings, Mail, Info } from 'lucide-react';

// ─── Utilities ───────────────────────────────────────────────
const formatRp  = (num: number) => 'Rp ' + Math.floor(num || 0).toLocaleString('id-ID');
const getTime   = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

type Message = { id: number; role: 'user' | 'bot'; text: string; time: string };

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  // ─── State ────────────────────────────────────────────────
  const [balance,      setBalance]      = useState(0);
  const [income,       setIncome]       = useState(0);
  const [expense,      setExpense]      = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgetLimit,  setBudgetLimit]  = useState(0);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [inputValue,   setInputValue]   = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening,  setIsListening]  = useState(false);
  const [showTooltip,  setShowTooltip]  = useState(false);
  const [showDash,     setShowDash]     = useState(false);   // ← toggle dashboard panel

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Data Loaders ─────────────────────────────────────────
  const loadData = async () => {
    try {
      const res  = await fetch('/api/stats/today');
      if (res.status === 401) { router.push('/auth/login'); return; }
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setIncome(data.today_income);
        setExpense(data.today_expense);
        setTransactions(data.transactions || []);
      }
    } catch (e) { console.error(e); }
  };

  const loadBudget = async () => {
    try {
      const res  = await fetch('/api/budget');
      if (res.status === 401) { router.push('/auth/login'); return; }
      const data = await res.json();
      if (data.success) setBudgetLimit(data.daily_limit || 0);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
    loadBudget();
    const id = setInterval(loadBudget, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // ─── Send Message ─────────────────────────────────────────
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;

    const playSendSound = () => {
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    };

    setInputValue('');
    playSendSound();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: getTime() }]);
    setIsProcessing(true);

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      });
      if (res.status === 401) { router.push('/auth/login'); return; }
      const data = await res.json();

      setMessages(prev => [...prev, {
        id:   Date.now() + 1,
        role: 'bot',
        text: data.success ? data.response : 'Maaf, ada kendala teknis. Coba lagi ya!',
        time: getTime(),
      }]);
      loadData();
      loadBudget();
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: 'Gagal terhubung ke server. Cek koneksi internetmu!',
        time: getTime(),
      }]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const onChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // ─── Voice Input ──────────────────────────────────────────
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Browser ini tidak mendukung Voice-to-Text. Gunakan Chrome.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r  = new SR();
    r.lang = 'id-ID'; r.continuous = false; r.interimResults = false;
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onerror  = () => setIsListening(false);
    r.onresult = (ev: any) => {
      const t = ev.results[0][0].transcript;
      setInputValue(t);
      setTimeout(() => document.getElementById('btnSend')?.click(), 300);
    };
    try { r.start(); } catch { setIsListening(false); }
  };

  // ─── Derived UI values ────────────────────────────────────
  const pct      = budgetLimit > 0 ? Math.min((expense / budgetLimit) * 100, 100) : 0;
  const lampCls  = pct >= 100 ? 'lamp-dot danger' : pct >= 75 ? 'lamp-dot warning' : 'lamp-dot';
  const net      = income - expense;
  const userName = session?.user?.name?.split(' ')[0] ?? 'Kamu';

  // ─── Format chat text (markdown-lite: **bold**, newlines) ─
  const formatBubble = (txt: string) =>
    txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      {/* Clean background is applied from globals.css */}
      <div className="app">

        {/* ══════════════════════════ SIDEBAR ══════════════════════════ */}
        <aside className="sidebar">

          {/* Logo */}
          <div className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9l3-3 3 3h-2v4zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div className="logo-texts">
              <div className="logo-name">
                MinoAI
                <span style={{ fontSize:10, background:'rgba(255, 160, 0,0.1)', color:'#E65100', borderRadius:6, padding:'2px 6px', marginLeft:6, fontWeight:600, verticalAlign:'middle' }}>AI</span>
                <div className="btn-info" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                  i
                  {showTooltip && (
                    <div className="info-tooltip visible" style={{ left:60, top:0, position:'absolute' }}>
                      <div className="info-tooltip-title">MinoAI</div>
                      <div className="info-tooltip-desc">Asisten keuangan pribadi yang memahami bahasa sehari-hari.</div>
                      <ul className="info-tooltip-list">
                        <li>Catat pemasukan &amp; pengeluaran</li>
                        <li>Catat banyak item sekaligus</li>
                        <li>Cek saldo &amp; riwayat transaksi</li>
                        <li>Tips &amp; laporan keuangan</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="logo-sub">Halo, {userName}!</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="sidebar-stats">
            <div className="glass-card card-balance">
              <div className="stat-label-sm">Total Saldo</div>
              <div className="balance-val">{formatRp(balance)}</div>
            </div>
            <div className="stat-grid">
              <div className="glass-card card-income">
                <div className="stat-mini-label">Masuk Hari Ini</div>
                <div className="stat-mini-val" style={{ color:'#065F46' }}>+{formatRp(income)}</div>
              </div>
              <div className="glass-card card-expense">
                <div className="stat-mini-label">Keluar Hari Ini</div>
                <div className="stat-mini-val" style={{ color:'#991B1B' }}>-{formatRp(expense)}</div>
              </div>
            </div>
          </div>


          {/* Budget progress bar */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Budget Harian</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize:14, fontWeight: 'bold', color: pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#10b981' }}>
                  {budgetLimit > 0 ? `${pct.toFixed(0)}%` : '0%'}
                </span>
                <button
                  onClick={() => {
                    const v = prompt('Set budget harian (contoh: 100000):');
                    if (v && !isNaN(Number(v))) {
                      fetch('/api/budget', {
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ daily_limit: Number(v) })
                      }).then(loadBudget);
                    }
                  }}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#4b5563', fontWeight: 600, cursor: 'pointer', padding: '4px 8px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Edit
                </button>
              </div>
            </div>
            <div style={{ height: '8px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#10b981',
                transition: 'width 0.5s ease',
                borderRadius: '4px'
              }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>{formatRp(expense)} dipakai</span>
              <span style={{ fontSize:12, color:'#6b7280', fontWeight:600 }}>dari {budgetLimit > 0 ? formatRp(budgetLimit) : 'Belum diset'}</span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="section-label">Transaksi Terbaru</div>
          <div className="tx-list">
            {transactions.length > 0 ? (
              transactions.slice(0, 6).map((tx, i) => (
                <div className="tx-item" key={i}>
                  <div className={`tx-dot ${tx.type}`} />
                  <div className="tx-info">
                    <div className="tx-desc">{tx.description || tx.type}</div>
                    <div className="tx-amount" style={{ color: tx.type==='income' ? '#10b981' : '#ef4444' }}>
                      {tx.type==='expense' ? '−' : '+'}{formatRp(tx.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', padding:'14px 0' }}>Belum ada transaksi</div>
            )}
          </div>

          {/* Bottom links & User Profile */}
          <div style={{ display:'flex', flexDirection:'column', gap: '10px', marginTop:'auto', paddingTop:'20px' }}>
            
            {/* User Profile / Email */}
            <div style={{ display:'flex', alignItems:'center', gap: '12px', padding: '12px', background:'rgba(255,255,255,0.4)', borderRadius:'16px', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{userName}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {session?.user?.email || 'user@example.com'}
                </div>
              </div>
            </div>

            <Link
              href="/voice"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px',
                background: 'linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #eab308 100%)',
                color: '#fff', borderRadius: '14px', textDecoration: 'none', fontWeight: 700, fontSize: '14px',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)', transition: 'all 0.2s ease', border: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)'; }}
            >
              <Mic size={18} /> VOICE AI
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link
                href="/dashboard/savings"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '12px 6px', background: 'rgba(255, 255, 255, 0.7)', color: '#be185d',
                  borderRadius: '14px', textDecoration: 'none', fontWeight: 600, fontSize: '12px',
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.2s ease', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}
              >
                <PiggyBank size={20} /> Celengan
              </Link>

              <Link
                href="/dashboard"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '12px 6px', background: 'rgba(255, 255, 255, 0.7)', color: '#0369a1',
                  borderRadius: '14px', textDecoration: 'none', fontWeight: 600, fontSize: '12px',
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link
                href="/settings"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 6px', background: 'rgba(243, 244, 246, 0.8)', color: '#4b5563',
                  borderRadius: '14px', textDecoration: 'none', fontWeight: 600, fontSize: '13px',
                  border: '1px solid rgba(229, 231, 235, 0.5)', transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(229, 231, 235, 0.9)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(243, 244, 246, 0.8)'; }}
              >
                <Settings size={16} /> Setting
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 6px', background: 'rgba(254, 226, 226, 0.8)', color: '#dc2626',
                  borderRadius: '14px', border: '1px solid rgba(252, 165, 165, 0.5)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(252, 165, 165, 0.8)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(254, 226, 226, 0.8)'; }}
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════ CHAT AREA ═══════════════════════ */}
        <main className="chat-area">

          {/* Top bar */}
          <div className="topbar">
            <div className="topbar-title">Chat dengan MinoAI</div>
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="status-dot" />
                <span>MinoAI Online ✦ Hybrid NLP</span>
              </div>

            </div>
          </div>

          {/* Messages */}
          <div className="messages" id="messageContainer">
            <div className="messages-inner">

              {/* Welcome screen (hanya saat belum ada pesan) */}
              {messages.length === 0 && (
                <div className="welcome-screen">

                  {/* ── Dashboard Cards di welcome ─────────── */}
                  <div className="mascot-wrap" style={{ position: 'relative', display:'flex', justifyContent:'center', marginBottom:'20px' }}>
                    <style>{`
                      @keyframes wiggle {
                        0%, 100% { transform: rotate(-2deg) translateY(0); }
                        50% { transform: rotate(2deg) translateY(-5px); }
                      }
                      @keyframes sparkle-anim {
                        0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                        50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
                      }
                      @keyframes glowPulse {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                        50% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
                      }
                      .mascot-wiggle {
                        animation: wiggle 3s ease-in-out infinite;
                      }
                      .sparkle {
                        position: absolute;
                        font-size: 28px;
                        color: #FFCA28;
                        animation: sparkle-anim 2.5s ease-in-out infinite;
                        pointer-events: none;
                        filter: drop-shadow(2px 2px 0px #1C1917);
                        z-index: 2;
                      }
                      .glow-bg {
                        position: absolute;
                        top: 50%; left: 50%;
                        width: 260px; height: 260px;
                        background: radial-gradient(circle, rgba(250, 204, 21, 1) 0%, rgba(250, 204, 21, 0.6) 30%, rgba(250, 204, 21, 0) 70%);
                        border-radius: 50%;
                        z-index: 0;
                        animation: glowPulse 3s ease-in-out infinite;
                        filter: blur(10px);
                      }
                      .sp-1 { top: 10%; left: 30%; animation-delay: 0.1s; }
                      .sp-2 { top: 50%; right: 30%; animation-delay: 1.2s; font-size: 22px; }
                      .sp-3 { bottom: 15%; left: 35%; animation-delay: 0.8s; font-size: 24px; }
                      .sp-4 { top: 20%; right: 38%; animation-delay: 0.4s; font-size: 18px; }
                    `}</style>
                    <div className="glow-bg" />
                    <span className="sparkle sp-1">✨</span>
                    <span className="sparkle sp-2">⭐</span>
                    <span className="sparkle sp-3">✨</span>
                    <span className="sparkle sp-4">✨</span>
                    <img className="mascot-wiggle" src="/img/robot-cat.png" alt="MinoAI Mascot" style={{ height:'220px', width:'auto', imageRendering:'pixelated', filter:'drop-shadow(6px 6px 0px #1C1917)', position: 'relative', zIndex: 1 }} />
                  </div>
                  <div className="welcome-dashboard">
                    <div className="wd-card wd-balance">
                      <div className="wd-label">SALDO SAAT INI</div>
                      <div className="wd-amount">{formatRp(balance)}</div>
                    </div>
                    <div className="wd-row">
                      <div className="wd-card wd-income">
                        <div className="wd-label">MASUK HARI INI</div>
                        <div className="wd-val" style={{ color:'#10b981' }}>+{formatRp(income)}</div>
                      </div>
                      <div className="wd-card wd-expense">
                        <div className="wd-label">KELUAR HARI INI</div>
                        <div className="wd-val" style={{ color:'#ef4444' }}>-{formatRp(expense)}</div>
                      </div>
                    </div>
                    {budgetLimit > 0 && (
                      <div className="wd-card wd-budget">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                          <div className="wd-label">BUDGET HARIAN</div>
                          <span style={{ fontSize:11, fontWeight:700, color: pct>=100?'#ef4444':pct>=75?'#f59e0b':'#10b981' }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="dash-bar-track">
                          <div className="dash-bar-fill" style={{
                            width:`${pct}%`,
                            background: pct>=100?'#ef4444':pct>=75?'#f59e0b':'#10b981'
                          }} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                          <span style={{ fontSize:10, color:'#ef4444', fontWeight:600 }}>{formatRp(expense)} dipakai</span>
                          <span style={{ fontSize:10, color:'var(--muted)' }}>dari {formatRp(budgetLimit)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="welcome-heading">MinoAI</div>
                  <div className="welcome-sub">Catat pengeluaran, cek saldo, atau minta analitik. Asisten simpel yang minimalis.</div>

                  {/* Quick action chips */}
                  <div className="quick-chips">
                    {['Cek saldo', 'Masuk hari ini', 'Ringkasan bulan ini', 'Riwayat transaksi'].map(chip => (
                      <button key={chip} className="q-chip" onClick={() => {
                        setInputValue(chip);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}>{chip}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map(m => (
                <div key={m.id} className={`msg ${m.role}`}>
                  <div className="msg-avatar">
                    {m.role === 'bot' ? (
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="white"/>
                      </svg>
                    ) : 'U'}
                  </div>
                  <div className="msg-content">
                    <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: formatBubble(m.text) }} />
                    <div className="msg-meta"><span>{m.time}</span></div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isProcessing && (
                <div className="msg bot">
                  <div className="msg-avatar">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="white"/>
                    </svg>
                  </div>
                  <div className="msg-content">
                    <div className="msg-bubble" style={{ padding:'14px 18px' }}>
                      <div className="typing"><span /><span /><span /></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          {/* ─── INPUT BAR ─────────────────────────────── */}
          <div className="input-container">
            <div className="input-box-wrapper">
              {/* Voice button */}
              <button
                className={`voice-btn ${isListening ? 'active' : ''}`}
                title="Gunakan Suara (Voice-to-Text)"
                onClick={startVoice}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8"  y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              {/* Textarea — now with correct id + ref */}
              <textarea
                id="userInput"
                ref={inputRef}
                rows={1}
                placeholder="Ketik pesan... (mis: beli makan 25rb dan kopi 15rb)"
                value={inputValue}
                onChange={onChangeTextarea}
                onKeyDown={onKeyDown}
                disabled={isProcessing}
              />

              {/* Send button */}
              <button
                id="btnSend"
                className="send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                title="Kirim (Enter)"
              >
                Kirim
              </button>
            </div>

            {/* Hint */}
            <div className="input-hint">
              {isListening
                ? 'Sedang mendengarkan... bicara sekarang!'
                : 'Klik mic atau text prompt · Enter untuk kirim'}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
