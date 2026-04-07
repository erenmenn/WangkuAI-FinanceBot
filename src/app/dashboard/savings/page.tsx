'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface SavingTx {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface SavingsData {
  goal: number;
  saved: number;
  balance: number;
  history: SavingTx[];
}

// ── Animated Piggy Bank SVG ─────────────────────────────────────────────────
function PiggyBank({ pct, jiggle }: { pct: number; jiggle: boolean }) {
  const fillHeight = Math.min(pct, 100);
  return (
    <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
      <style>{`
        @keyframes jiggle {
          0%   { transform: rotate(0deg) scale(1); }
          15%  { transform: rotate(-8deg) scale(1.08); }
          30%  { transform: rotate(8deg) scale(1.08); }
          45%  { transform: rotate(-5deg) scale(1.04); }
          60%  { transform: rotate(5deg) scale(1.04); }
          75%  { transform: rotate(-2deg) scale(1.01); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes coinDrop {
          0%   { transform: translateY(-30px); opacity:0; }
          60%  { transform: translateY(4px); opacity:1; }
          100% { transform: translateY(0px); opacity:1; }
        }
        @keyframes fillRise {
          from { height: 0%; }
          to   { height: ${fillHeight}%; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatPig {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        .pig-wrap {
          animation: ${jiggle ? 'jiggle 0.6s ease' : 'floatPig 3s ease-in-out infinite'};
          transform-origin: center bottom;
        }
        .coin-drop { animation: coinDrop 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      <div className="pig-wrap" style={{ width: '100%', height: '100%' }}>
        <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <clipPath id="pigBody">
              <ellipse cx="105" cy="118" rx="78" ry="68" />
            </clipPath>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="shimmerGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Tail */}
          <path d="M175 130 Q200 120 195 105 Q190 90 178 98" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Body */}
          <ellipse cx="105" cy="118" rx="78" ry="68" fill="url(#bodyGrad)" />

          {/* Liquid fill inside body */}
          <g clipPath="url(#pigBody)">
            <rect
              x="27" y={118 + 68 - (136 * fillHeight / 100)}
              width="156" height={136 * fillHeight / 100}
              fill="url(#fillGrad)"
              style={{ transition: 'all 1s cubic-bezier(.4,0,.2,1)' }}
            />
            {/* Wave on top of fill */}
            {fillHeight > 0 && (
              <g style={{ transition: 'all 1s' }}>
                <path
                  d={`M27,${118 + 68 - (136 * fillHeight / 100)} 
                    Q55,${118 + 68 - (136 * fillHeight / 100) - 6} 
                    83,${118 + 68 - (136 * fillHeight / 100)} 
                    Q111,${118 + 68 - (136 * fillHeight / 100) + 6} 
                    139,${118 + 68 - (136 * fillHeight / 100)}
                    Q167,${118 + 68 - (136 * fillHeight / 100) - 6}
                    183,${118 + 68 - (136 * fillHeight / 100)}`}
                  fill="none" stroke="#fbbf24" strokeWidth="3" strokeOpacity="0.7"
                />
              </g>
            )}
          </g>

          {/* Body outline */}
          <ellipse cx="105" cy="118" rx="78" ry="68" stroke="#1C1917" strokeWidth="4" fill="none" />

          {/* Coin slot on top */}
          <rect x="88" y="52" width="30" height="7" rx="3.5" fill="#1C1917" />

          {/* Head */}
          <circle cx="170" cy="100" r="32" fill="#fda4af" stroke="#1C1917" strokeWidth="4" />

          {/* Snout */}
          <ellipse cx="187" cy="112" rx="14" ry="10" fill="#fb7185" stroke="#1C1917" strokeWidth="3" />
          <circle cx="183" cy="112" r="3" fill="#1C1917" />
          <circle cx="191" cy="112" r="3" fill="#1C1917" />

          {/* Eye */}
          <circle cx="163" cy="94" r="5" fill="white" stroke="#1C1917" strokeWidth="2.5" />
          <circle cx="164" cy="95" r="2.5" fill="#1C1917" />

          {/* Ear */}
          <ellipse cx="160" cy="72" rx="10" ry="14" fill="#fda4af" stroke="#1C1917" strokeWidth="3.5" />
          <ellipse cx="160" cy="74" rx="5" ry="8" fill="#fb7185" />

          {/* Legs */}
          {[65, 90, 118, 143].map((x, i) => (
            <rect key={i} x={x} y="174" width="18" height="28" rx="9" fill="#fda4af" stroke="#1C1917" strokeWidth="3.5" />
          ))}

          {/* Shine */}
          <ellipse cx="82" cy="90" rx="16" ry="10" fill="rgba(255,255,255,0.28)" transform="rotate(-30 82 90)" />
        </svg>
      </div>

      {/* Percentage badge */}
      <div style={{
        position: 'absolute', bottom: 12, right: 0,
        background: '#1C1917', color: '#fbbf24',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 11, padding: '4px 10px', borderRadius: 6,
        border: '2px solid #fbbf24', letterSpacing: 1,
      }}>
        {Math.round(fillHeight)}%
      </div>
    </div>
  );
}

// ── Coin animation overlay ───────────────────────────────────────────────────
function CoinBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const coins = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {coins.map(i => (
        <div key={i} style={{
          position: 'absolute',
          top: '40%', left: `${20 + i * 9}%`,
          fontSize: 28,
          animation: `coinBurst${i % 3} 0.8s ease-out both`,
          animationDelay: `${i * 0.06}s`,
        }}>🪙</div>
      ))}
      <style>{`
        @keyframes coinBurst0 { from{transform:translateY(0) scale(0.5);opacity:1}to{transform:translateY(-120px) scale(1.2) rotate(20deg);opacity:0} }
        @keyframes coinBurst1 { from{transform:translateY(0) scale(0.5);opacity:1}to{transform:translateY(-80px) translateX(40px) scale(1.1) rotate(-15deg);opacity:0} }
        @keyframes coinBurst2 { from{transform:translateY(0) scale(0.5);opacity:1}to{transform:translateY(-100px) translateX(-30px) scale(1.2) rotate(30deg);opacity:0} }
      `}</style>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SavingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [depositInput, setDepositInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [jiggle, setJiggle] = useState(false);
  const [coinBurst, setCoinBurst] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'goal' | 'history'>('deposit');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login');
  }, [status, router]);

  const fetchData = useCallback(async () => {
    const r = await fetch('/api/savings');
    if (r.ok) {
      const d = await r.json();
      setData(d);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
  }, [status, fetchData]);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleDeposit = async () => {
    const amt = parseInt(depositInput.replace(/\D/g, ''), 10);
    if (!amt || amt <= 0) { showMsg('err', 'Masukkan nominal yang valid!'); return; }
    setDepositLoading(true);
    const r = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deposit', amount: amt }),
    });
    const d = await r.json();
    setDepositLoading(false);
    if (!d.success) { showMsg('err', d.error); return; }
    showMsg('ok', `🐷 Berhasil simpan ${formatRp(amt)} ke celengan!`);
    setDepositInput('');
    setJiggle(true);
    setCoinBurst(true);
    setTimeout(() => setJiggle(false), 700);
    setTimeout(() => setCoinBurst(false), 1000);
    await fetchData();
  };

  const handleSetGoal = async () => {
    const g = parseInt(goalInput.replace(/\D/g, ''), 10);
    if (!g || g <= 0) { showMsg('err', 'Masukkan nominal target yang valid!'); return; }
    setGoalLoading(true);
    const r = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_goal', goal: g }),
    });
    const d = await r.json();
    setGoalLoading(false);
    if (!d.success) { showMsg('err', d.error); return; }
    showMsg('ok', `🎯 Target tabungan ${formatRp(g)} berhasil diset!`);
    setGoalInput('');
    await fetchData();
  };

  const pct = data && data.goal > 0 ? Math.min((data.saved / data.goal) * 100, 100) : 0;
  const remaining = data ? Math.max(0, data.goal - data.saved) : 0;
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const perDay = daysLeft > 0 && remaining > 0 ? Math.ceil(remaining / daysLeft) : 0;

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff0f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, animation: 'floatPig 1.5s ease-in-out infinite' }}>🐷</div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e879a0', marginTop: 12 }}>Memuat celengan…</p>
        </div>
        <style>{`@keyframes floatPig{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Pixelify Sans', sans-serif; background: #fff0f5; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #f9a8d4; border-radius: 2px; }

        .sav-page { max-width: 960px; margin: 0 auto; padding: 28px 20px 80px; }

        .pixel-card {
          background: #fff;
          border: 4px solid #1C1917;
          box-shadow: 6px 6px 0px #1C1917;
          border-radius: 8px;
          overflow: hidden;
        }
        .pixel-card-pink {
          background: linear-gradient(135deg, #fff0f5 0%, #fce7f3 100%);
          border: 4px solid #1C1917;
          box-shadow: 6px 6px 0px #1C1917;
          border-radius: 8px;
          overflow: hidden;
        }
        .pixel-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px;
          border: 3px solid #1C1917;
          box-shadow: 4px 4px 0px #1C1917;
          border-radius: 6px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: all 0.1s;
          width: 100%;
        }
        .pixel-btn:hover:not(:disabled) { transform: translate(2px,2px); box-shadow: 2px 2px 0px #1C1917; }
        .pixel-btn:disabled { opacity: 0.6; cursor: default; }
        .pixel-btn-pink { background: #f472b6; color: white; }
        .pixel-btn-yellow { background: #fbbf24; color: #1C1917; }

        .pixel-input {
          width: 100%;
          padding: 12px 16px;
          border: 3px solid #1C1917;
          border-radius: 6px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 16px;
          background: #fff;
          color: #1C1917;
          outline: none;
          transition: box-shadow 0.2s;
        }
        .pixel-input:focus { box-shadow: 0 0 0 3px rgba(244,114,182,0.3); }

        .tab-btn {
          padding: 10px 20px;
          border: 3px solid #1C1917;
          border-radius: 6px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          transition: all 0.1s;
          background: #fff; color: #1C1917;
        }
        .tab-btn.active { background: #f472b6; color: #fff; box-shadow: 3px 3px 0 #1C1917; }
        .tab-btn:hover:not(.active) { background: #fce7f3; }

        .progress-bar-track {
          width: 100%; height: 28px;
          background: #f3f4f6;
          border: 3px solid #1C1917;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f472b6, #fbbf24);
          border-radius: 20px;
          transition: width 1.2s cubic-bezier(.4,0,.2,1);
          position: relative;
          overflow: hidden;
        }
        .progress-bar-fill::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }

        .stat-mini {
          background: #fff;
          border: 3px solid #1C1917;
          box-shadow: 4px 4px 0 #1C1917;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .history-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 2px solid #fce7f3;
          transition: background 0.15s;
        }
        .history-row:hover { background: #fff0f5; }
        .history-row:last-child { border-bottom: none; }

        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        .animate-up { animation: slideUp 0.4s ease both; }
      `}</style>

      <CoinBurst active={coinBurst} />

      {/* NAVBAR */}
      <nav style={{
        background: '#fff0f5',
        borderBottom: '4px solid #1C1917',
        padding: '0 28px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🐷</span>
          <div>
            <div style={{ fontFamily: "'Pixelify Sans'", fontSize: 17, fontWeight: 700, color: '#1C1917' }}>Celengan Babi</div>
            <div style={{ fontSize: 11, color: '#e879a0' }}>Savings Tracker — WangkuAI</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', background: '#fff',
            color: '#1C1917', border: '3px solid #1C1917',
            boxShadow: '3px 3px 0 #1C1917', borderRadius: 6,
          }}>
            📊 Dashboard
          </Link>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', background: '#f472b6',
            color: '#fff', border: '3px solid #1C1917',
            boxShadow: '3px 3px 0 #1C1917', borderRadius: 6,
          }}>
            💬 Chat
          </Link>
        </div>
      </nav>

      {/* TOAST MESSAGE */}
      {msg && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: msg.type === 'ok' ? '#1C1917' : '#ef4444',
          color: msg.type === 'ok' ? '#fbbf24' : 'white',
          padding: '12px 24px', borderRadius: 8,
          border: '3px solid', borderColor: msg.type === 'ok' ? '#fbbf24' : '#1C1917',
          fontFamily: "'Pixelify Sans'", fontSize: 14, fontWeight: 700,
          zIndex: 9998, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease',
        }}>
          {msg.text}
        </div>
      )}

      <div className="sav-page">

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="animate-up">
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: '#1C1917', marginBottom: 8 }}>
            🐷 Celengan Babi
          </h1>
          <p style={{ color: '#e879a0', fontSize: 14 }}>
            Simpan uang dari saldo & pantau progress target tabunganmu
          </p>
          {data && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12,
              background: '#fff', border: '3px solid #1C1917',
              boxShadow: '3px 3px 0 #1C1917', borderRadius: 8, padding: '8px 20px',
            }}>
              <span style={{ fontSize: 12, color: '#1C1917', fontWeight: 600 }}>💰 Saldo Tersedia:</span>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: '#16a34a', fontWeight: 800 }}>
                {formatRp(data.balance)}
              </span>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, marginBottom: 24 }}>

          {/* LEFT — Piggy Bank Visual */}
          <div className="pixel-card-pink animate-up" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <PiggyBank pct={pct} jiggle={jiggle} />

            {/* Progress bar */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1917' }}>Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f472b6' }}>{Math.round(pct)}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Saved / Goal */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '🏦 Tersimpan', value: data ? formatRp(data.saved) : '-', color: '#16a34a' },
                { label: '🎯 Target', value: data?.goal ? formatRp(data.goal) : 'Belum diset', color: '#e879a0' },
              ].map((s, i) => (
                <div key={i} className="stat-mini">
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: s.color, fontWeight: 800, lineHeight: 1.4 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Remaining info */}
            {data && data.goal > 0 && remaining > 0 && (
              <div style={{
                width: '100%', background: '#fff',
                border: '3px solid #fbbf24', borderRadius: 8,
                padding: '12px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700 }}>
                  ⏳ Kurang {formatRp(remaining)}
                </div>
                {perDay > 0 && (
                  <div style={{ fontSize: 10, color: '#b45309', marginTop: 4 }}>
                    ~${formatRp(perDay)}/hari selama {daysLeft} hari
                  </div>
                )}
              </div>
            )}

            {data && data.goal > 0 && remaining === 0 && (
              <div style={{
                width: '100%', background: '#dcfce7',
                border: '3px solid #16a34a', borderRadius: 8,
                padding: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18 }}>🎉</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#15803d', marginTop: 4 }}>
                  GOAL TERCAPAI!
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Tab buttons */}
            <div style={{ display: 'flex', gap: 8 }} className="animate-up">
              {([
                { key: 'deposit', label: '🐷 Setor Tabungan' },
                { key: 'goal', label: '🎯 Set Target' },
                { key: 'history', label: '📋 Riwayat' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB: Deposit */}
            {activeTab === 'deposit' && (
              <div className="pixel-card animate-up" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: "'Pixelify Sans'", fontSize: 18, color: '#1C1917', marginBottom: 6 }}>
                  🐷 Setor ke Celengan
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                  Uang akan dipotong dari saldo kamu dan masuk ke celengan babi. 
                  Kamu juga bisa ketik <code style={{ background:'#fce7f3', padding:'2px 6px', borderRadius:4, color:'#e879a0' }}>"simpan 50rb ke tabungan"</code> di chat!
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
                    Nominal Tabungan
                  </label>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    {[10000, 25000, 50000, 100000].map(q => (
                      <button
                        key={q}
                        onClick={() => setDepositInput(String(q))}
                        style={{
                          padding: '6px 14px', fontSize: 12, fontWeight: 700,
                          border: '2px solid #1C1917', borderRadius: 6,
                          background: depositInput === String(q) ? '#f472b6' : '#fff',
                          color: depositInput === String(q) ? '#fff' : '#1C1917',
                          cursor: 'pointer', transition: 'all 0.1s',
                        }}
                      >
                        {formatRp(q)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    className="pixel-input"
                    placeholder="Atau ketik nominal sendiri, misal: 75000"
                    value={depositInput}
                    onChange={e => setDepositInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDeposit()}
                    id="deposit-amount"
                  />
                  {depositInput && parseInt(depositInput) > 0 && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#e879a0', fontWeight: 700 }}>
                      = {formatRp(parseInt(depositInput) || 0)}
                    </div>
                  )}
                </div>

                <button
                  className="pixel-btn pixel-btn-pink"
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositInput}
                  id="deposit-btn"
                >
                  {depositLoading ? '⏳ Menyimpan…' : '🐷 Simpan ke Celengan!'}
                </button>
              </div>
            )}

            {/* TAB: Set Goal */}
            {activeTab === 'goal' && (
              <div className="pixel-card animate-up" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: "'Pixelify Sans'", fontSize: 18, color: '#1C1917', marginBottom: 6 }}>
                  🎯 Set Target Tabungan
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                  Tentukan berapa yang ingin kamu tabung bulan ini. Target baru akan menggantikan yang lama.
                  Kamu juga bisa bilang <code style={{ background:'#fce7f3', padding:'2px 6px', borderRadius:4, color:'#e879a0' }}>"aku mau nabung 1 juta bulan ini"</code> di chat!
                </p>

                {data?.goal ? (
                  <div style={{
                    background: '#fff0f5', border: '3px solid #f9a8d4',
                    borderRadius: 8, padding: '14px 20px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 24 }}>🎯</span>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Target saat ini</div>
                      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 13, color: '#e879a0', fontWeight: 800 }}>
                        {formatRp(data.goal)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#fef9c3', border: '3px solid #fcd34d', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: '#92400e' }}>⚠️ Belum ada target tabungan. Yuk set sekarang!</span>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
                    Target Tabungan Bulan Ini
                  </label>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    {[250000, 500000, 1000000, 2000000].map(q => (
                      <button
                        key={q}
                        onClick={() => setGoalInput(String(q))}
                        style={{
                          padding: '6px 14px', fontSize: 12, fontWeight: 700,
                          border: '2px solid #1C1917', borderRadius: 6,
                          background: goalInput === String(q) ? '#fbbf24' : '#fff',
                          color: '#1C1917', cursor: 'pointer', transition: 'all 0.1s',
                        }}
                      >
                        {formatRp(q)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    className="pixel-input"
                    placeholder="Misal: 1000000"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSetGoal()}
                    id="goal-amount"
                  />
                  {goalInput && parseInt(goalInput) > 0 && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#92400e', fontWeight: 700 }}>
                      = {formatRp(parseInt(goalInput) || 0)}
                    </div>
                  )}
                </div>

                <button
                  className="pixel-btn pixel-btn-yellow"
                  onClick={handleSetGoal}
                  disabled={goalLoading || !goalInput}
                  id="set-goal-btn"
                >
                  {goalLoading ? '⏳ Menyimpan…' : '🎯 Set Target Tabungan!'}
                </button>
              </div>
            )}

            {/* TAB: History */}
            {activeTab === 'history' && (
              <div className="pixel-card animate-up" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '18px 24px',
                  borderBottom: '4px solid #1C1917',
                  background: 'linear-gradient(90deg, #fff0f5 0%, #fff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontFamily: "'Pixelify Sans'", fontSize: 16, fontWeight: 700 }}>📋 Riwayat Setoran</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Semua uang yang masuk ke celengan</div>
                  </div>
                  <div style={{
                    background: '#f472b6', color: '#fff',
                    fontFamily: "'Press Start 2P'", fontSize: 10,
                    padding: '6px 12px', borderRadius: 6,
                    border: '2px solid #1C1917',
                  }}>
                    {data?.history.length ?? 0} txn
                  </div>
                </div>

                {data && data.history.length > 0 ? (
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {data.history.map((tx, i) => (
                      <div key={tx.id} className="history-row" style={{ animationDelay: `${i * 0.04}s` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: 'linear-gradient(135deg, #f9a8d4, #f472b6)',
                            border: '2px solid #1C1917',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                          }}>🪙</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{tx.description || 'Simpan ke celengan'}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{formatDate(tx.date)}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: '#16a34a', fontWeight: 800 }}>
                          +{formatRp(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🐷</div>
                    <div style={{ fontFamily: "'Pixelify Sans'", fontSize: 14, color: '#9ca3af' }}>
                      Belum ada setoran ke celengan.<br />Yuk mulai menabung sekarang!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tip box */}
            <div style={{
              background: '#fffbeb', border: '3px solid #fcd34d',
              borderRadius: 8, padding: '16px 20px',
            }} className="animate-up">
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e', marginBottom: 6 }}>💡 Cara Menabung via Chat:</div>
              <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.8 }}>
                Kamu bisa langsung bilang ke MinoAI di chat:<br />
                <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>"simpan 50rb ke tabungan"</code><br />
                <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>"tabung 100 ribu dari saldo"</code><br />
                <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>"masukin 200rb ke celengan"</code>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM — Stats summary */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="animate-up">
            {[
              { icon: '🐷', label: 'Total Tersimpan', value: formatRp(data.saved), color: '#16a34a' },
              { icon: '🎯', label: 'Target Bulan Ini', value: data.goal ? formatRp(data.goal) : '—', color: '#e879a0' },
              { icon: '⏳', label: 'Sisa Hari', value: `${daysLeft} hari`, color: '#f59e0b' },
              { icon: '💰', label: 'Saldo Tersedia', value: formatRp(data.balance), color: '#0ea5e9' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '4px solid #1C1917',
                boxShadow: '5px 5px 0 #1C1917', borderRadius: 8,
                padding: '18px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: s.color, fontWeight: 800, lineHeight: 1.5 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
