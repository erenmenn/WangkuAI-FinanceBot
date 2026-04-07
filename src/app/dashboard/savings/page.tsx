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

// ── Retro Vault Visual ─────────────────────────────────────────────────
function RetroVault({ pct, jiggle }: { pct: number; jiggle: boolean }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes jiggle {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(-8deg) scale(1.1); }
          40%  { transform: rotate(8deg) scale(1.1); }
          60%  { transform: rotate(-4deg) scale(1.05); }
          80%  { transform: rotate(4deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes floatVault {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .vault-wrap {
          animation: ${jiggle ? 'jiggle 0.5s ease' : 'floatVault 3s ease-in-out infinite'};
          font-size: 130px;
          filter: drop-shadow(8px 8px 0px rgba(28, 25, 23, 0.2));
        }
      `}</style>
      
      <div className="vault-wrap">🏦</div>

      {/* Percentage badge */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        background: '#1C1917', color: '#FFCA28',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 12, padding: '6px 12px', borderRadius: 4,
        border: '3px solid #FF8F00', letterSpacing: 1,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
      }}>
        {Math.round(Math.min(pct, 100))}%
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

function StatBox({ icon, label, val, color }: { icon: string; label: string; val: string; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '3px solid #1C1917',
      boxShadow: '3px 3px 0 #1C1917', borderRadius: 6,
      padding: '16px 14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.1))' }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#1C1917', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color, lineHeight: 1.5 }}>{val}</div>
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
    showMsg('ok', `🏦 Berhasil simpan ${formatRp(amt)} ke tabungan!`);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFDE7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, animation: 'floatVault 1.5s ease-in-out infinite' }}>🏦</div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#FF8F00', marginTop: 12 }}>Memuat brankas…</p>
        </div>
        <style>{`@keyframes floatVault{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FFCA28; border-radius: 3px; }

        .scroll-wrapper {
          height: calc(100vh - 62px);
          overflow-y: auto;
          overflow-x: hidden;
          background: #FFFDE7;
        }
        
        .sav-page { 
          max-width: 980px; 
          margin: 0 auto; 
          padding: 32px 24px 80px; 
          font-family: 'Pixelify Sans', sans-serif;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 820px) {
          .main-grid { grid-template-columns: 340px 1fr; }
        }

        .pixel-card { background: #fff; border: 4px solid #1C1917; box-shadow: 6px 6px 0px #1C1917; border-radius: 8px; overflow: hidden; }
        .pixel-card-yellow { background: #FBBF24; border: 4px solid #1C1917; box-shadow: 6px 6px 0px #1C1917; border-radius: 8px; overflow: hidden; }
        
        .pixel-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 18px; border: 4px solid #1C1917; box-shadow: 4px 4px 0px #1C1917; border-radius: 4px;
          font-family: 'Press Start 2P', monospace; font-size: 10px; color: #1C1917;
          cursor: pointer; transition: all 0.1s; line-height: 1.5;
        }
        .pixel-btn:hover:not(:disabled) { transform: translate(2px,2px); box-shadow: 2px 2px 0px #1C1917; }
        .pixel-btn:disabled { opacity: 0.6; cursor: default; }
        .pixel-btn-orange { background: #E65100; color: white; }
        .pixel-btn-yellow { background: #FFCA28; }

        .pixel-input {
          width: 100%; padding: 12px 16px; border: 3px solid #1C1917; border-radius: 4px;
          font-family: 'Pixelify Sans', sans-serif; font-weight: 700; font-size: 16px;
          background: #fff; color: #1C1917; outline: none; transition: box-shadow 0.2s;
        }
        .pixel-input:focus { box-shadow: 0 0 0 3px rgba(255, 143, 0, 0.4); }

        .progress-bar-track { width: 100%; height: 28px; background: #fff; border: 3px solid #1C1917; border-radius: 4px; overflow: hidden; position: relative; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #E65100, #FFCA28); border-right: 3px solid #1C1917; transition: width 1s cubic-bezier(.4,0,.2,1); position: relative; overflow: hidden; }
        .progress-bar-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
        
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        .animate-up { animation: slideUp 0.4s ease both; }

        .history-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 2px dotted #e5e7eb; transition: background 0.15s; }
        .history-row:hover { background: #fefce8; }
        .history-row:last-child { border-bottom: none; }
      `}</style>

      <CoinBurst active={coinBurst} />

      {/* NAVBAR */}
      <nav style={{
        background: '#FFFDE7',
        borderBottom: '4px solid #1C1917',
        padding: '0 28px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🏦</span>
          <div>
            <div style={{ fontFamily: "'Pixelify Sans'", fontSize: 17, fontWeight: 700, color: '#1C1917' }}>Brankas Uang</div>
            <div style={{ fontSize: 11, color: '#E65100' }}>Savings Tracker — WangkuAI</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', background: '#fff',
            color: '#1C1917', border: '3px solid #1C1917',
            boxShadow: '3px 3px 0 #1C1917', borderRadius: 4,
          }}>
            📊 Dashboard
          </Link>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', background: '#FF8F00',
            color: '#fff', border: '3px solid #1C1917',
            boxShadow: '3px 3px 0 #1C1917', borderRadius: 4,
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

      <div className="scroll-wrapper">
        <div className="sav-page">

          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: 40 }} className="animate-up">
            <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 24, color: '#1C1917', marginBottom: 12 }}>
              🏦 BRANKAS TABUNGAN
            </h1>
            <p style={{ color: '#E65100', fontSize: 16, fontFamily: "'Pixelify Sans'", fontWeight: 600 }}>
              Pantau aset dan setorkan tabunganmu dengan mudah
            </p>
          </div>

          <div className="main-grid">

            {/* LEFT COLUMN: Visual & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Saldo Warning/Info */}
              {data && (
                <div className="pixel-card animate-up" style={{ padding: '16px 20px', background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color:'#0369A1' }}>Saldo Tersedia</span>
                  <span style={{ fontFamily:"'Press Start 2P'", fontSize: 12, color:'#0284C7' }}>{formatRp(data.balance)}</span>
                </div>
              )}

              {/* Vault & Progress */}
              <div className="pixel-card-yellow animate-up" style={{ padding: '32px 24px', textAlign: 'center' }}>
                <RetroVault pct={pct} jiggle={jiggle} />
                
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>Progress Tabungan</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#E65100' }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 24 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                
                {data && data.goal > 0 && remaining > 0 && (
                  <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#92400e', background: '#FEF3C7', border: '2px solid #E65100', borderRadius: 4, padding: '8px' }}>
                    ⏳ Kurang {formatRp(remaining)}
                  </div>
                )}
                {data && data.goal > 0 && remaining === 0 && (
                  <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#166534', background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 4, padding: '8px' }}>
                    🎉 GOAL TERCAPAI!
                  </div>
                )}
              </div>

              {/* Stat cards 2x2 */}
              {data && (
                <div className="animate-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <StatBox icon="🏦" label="Tersimpan" val={formatRp(data.saved)} color="#16a34a" />
                  <StatBox icon="🎯" label="Target" val={data.goal ? formatRp(data.goal) : 'Belum'} color="#E65100" />
                  <StatBox icon="⏳" label="Sisa Hari" val={`${daysLeft} Hari`} color="#f59e0b" />
                  <StatBox icon="📈" label="Per Hari" val={perDay ? formatRp(perDay) : '-'} color="#9333ea" />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Actions vertically stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Form 1: Setor Uang */}
              <div className="pixel-card animate-up" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  💸 Setor ke Brankas
                </h2>
                <p style={{ fontSize: 13, marginBottom: 16 }}>Nominal akan memotong Saldo Tersedia Anda.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[25000, 50000, 100000].map(q => (
                    <button key={q} onClick={() => setDepositInput(String(q))}
                      style={{
                        padding: '6px 12px', fontSize: 12, fontWeight: 700, border: '2px solid #1C1917', borderRadius: 4, cursor: 'pointer',
                        background: depositInput === String(q) ? '#FF8F00' : '#fff', color: depositInput === String(q) ? '#fff' : '#1C1917',
                      }}>
                      {formatRp(q)}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="number" className="pixel-input" placeholder="Atau ketik sendiri..." value={depositInput} onChange={e => setDepositInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDeposit()} />
                  <button className="pixel-btn pixel-btn-orange" onClick={handleDeposit} disabled={depositLoading || !depositInput} style={{ width: '120px' }}>
                    {depositLoading ? '...' : 'SETOR'}
                  </button>
                </div>
              </div>

              {/* Form 2: Set Target */}
              <div className="pixel-card animate-up" style={{ padding: 24, animationDelay: '0.1s' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎯 Target Bulan Ini
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[500000, 1000000, 2000000].map(q => (
                    <button key={q} onClick={() => setGoalInput(String(q))}
                      style={{
                        padding: '6px 12px', fontSize: 12, fontWeight: 700, border: '2px solid #1C1917', borderRadius: 4, cursor: 'pointer',
                        background: goalInput === String(q) ? '#FFCA28' : '#fff', color: '#1C1917',
                      }}>
                      {formatRp(q)}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="number" className="pixel-input" placeholder="Baru: misal 1000000" value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSetGoal()} />
                  <button className="pixel-btn pixel-btn-yellow" onClick={handleSetGoal} disabled={goalLoading || !goalInput} style={{ width: '120px' }}>
                    {goalLoading ? '...' : 'UBAH'}
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="pixel-card animate-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', animationDelay: '0.2s', minHeight: 300 }}>
                <div style={{ padding: '16px 20px', background: 'linear-gradient(90deg, #FFCA28, #FFFDE7)', borderBottom: '4px solid #1C1917', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0 }}>📋 Riwayat</h2>
                  <div style={{ fontSize: 11, background: '#1C1917', color: '#FFCA28', padding: '4px 8px', borderRadius: 4, fontFamily: "'Press Start 2P'" }}>{data?.history.length ?? 0} Txn</div>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {data && data.history.length > 0 ? (
                    data.history.map((tx) => (
                      <div key={tx.id} className="history-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 4, background: '#E65100', border: '2px solid #1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '2px 2px 0 #1C1917' }}>🪙</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{tx.description || 'Simpan ke brankas'}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{formatDate(tx.date)}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#16a34a' }}>
                          +{formatRp(tx.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Belum ada setoran.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
