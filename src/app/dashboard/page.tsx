'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  BarController,
} from 'chart.js';

Chart.register(
  BarElement, CategoryScale, LinearScale, Tooltip, Legend,
  ArcElement, DoughnutController, BarController
);

// ── helpers ─────────────────────────────────────────────────────────────────
function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

const CATEGORY_ICONS: Record<string, string> = {
  makanan: '🍜', minuman: '☕', transport: '🚗', bbm: '⛽',
  belanja: '🛒', fashion: '👗', game: '🎮', topup: '💳',
  streaming: '📺', listrik: '⚡', air: '💧', internet: '📶',
  pulsa: '📱', kesehatan: '🏥', obat: '💊', pendidikan: '📚',
  hiburan: '🎉', investasi: '📈', tabungan: '🏦', lainnya: '📦',
  makanan_online: '🛵', kesehatan_gym: '💪', 'lain-lain': '📦',
};

const COLORS = [
  '#FF8F00','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#f97316','#0ea5e9','#84cc16',
];

const CATEGORY_COLOR_MAP: Record<string, string> = {
  makanan: '#f59e0b', minuman: '#0ea5e9', transport: '#10b981',
  bbm: '#f97316', belanja: '#8b5cf6', fashion: '#ec4899',
  game: '#6366f1', topup: '#14b8a6', streaming: '#a855f7',
  listrik: '#eab308', air: '#06b6d4', internet: '#FFCA28',
  pulsa: '#22c55e', kesehatan: '#ef4444', pendidikan: '#f97316',
  hiburan: '#d946ef', investasi: '#8b5cf6', tabungan: '#10b981',
  makanan_online: '#f59e0b', lainnya: '#1C1917',
};

interface DashboardData {
  currentBalance: number;
  incomeMonth: number;
  expenseMonth: number;
  txCountMonth: number;
  chartLabels: string[];
  chartExp: number[];
  chartInc: number[];
  chartCatLabels: string[];
  chartCatData: number[];
  todayExpense: number;
  todayIncome: number;
  todayTxCount: number;
  todayCatRows: { name: string; total: number }[];
  todayCatTotal: number;
  intentTable: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: string;
  }[];
}

// ── komponenBarChart ─────────────────────────────────────────────────────────
function BarChartComp({ labels, exp, inc }: { labels: string[]; exp: number[]; inc: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d')!;

    const gradExp = ctx.createLinearGradient(0, 0, 0, 240);
    gradExp.addColorStop(0, 'rgba(220,38,38,0.85)');
    gradExp.addColorStop(1, 'rgba(220,38,38,0.15)');
    const gradInc = ctx.createLinearGradient(0, 0, 0, 240);
    gradInc.addColorStop(0, 'rgba(5,150,105,0.85)');
    gradInc.addColorStop(1, 'rgba(5,150,105,0.12)');

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Pengeluaran', data: exp, backgroundColor: gradExp, borderRadius: 8, barThickness: 14 },
          { label: 'Pemasukan',   data: inc, backgroundColor: gradInc, borderRadius: 8, barThickness: 14 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatRp(ctx.raw as number)}` } },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 160, 0,0.1)' },
            ticks: { callback: (v) => formatRp(v as number), font: { size: 10 }, color: '#BF360C' },
          },
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#BF360C' } },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [labels, exp, inc]);

  return <canvas ref={canvasRef} style={{ position: 'relative', zIndex: 1 }} />;
}

// ── DonutChart ───────────────────────────────────────────────────────────────
function DonutChartComp({ labels, data, total }: { labels: string[]; data: number[]; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d')!;

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: COLORS.slice(0, data.length),
          borderWidth: 4,
          borderColor: 'rgba(255,255,255,0.95)',
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatRp(ctx.raw as number)}` } },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [labels, data]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: '#1C1917', fontSize: '13px' }}>
        Belum ada pengeluaran bulan ini
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 22px 20px' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <canvas ref={canvasRef} width={180} height={180} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: '10px', color: '#1C1917', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total</span>
          <span style={{ fontFamily: "'Press Start 2P', system-ui", fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{formatRp(total)}</span>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {labels.map((lbl, i) => {
          const pct = total > 0 ? Math.round(data[i] / total * 100) : 0;
          const col = COLORS[i % COLORS.length];
          return (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '3px', background: col, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '12px', color: '#0f172a' }}>{lbl}</span>
              <span style={{ fontSize: '11px', color: '#1C1917', fontWeight: 600, minWidth: '28px', textAlign: 'right' }}>{pct}%</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', minWidth: '80px', textAlign: 'right' }}>{formatRp(data[i])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchCat, setSearchCat] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/stats/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFDE7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#1C1917', fontFamily: "'VT323', monospace" }}>Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // unique categories for filter
  const allCats = Array.from(new Set(data.intentTable.map(r => r.category.split(',')[0].trim().toLowerCase())));
  const filteredTable = data.intentTable.filter(r => {
    const cat = r.category.split(',')[0].trim().toLowerCase();
    const matchSearch = r.description.toLowerCase().includes(searchCat.toLowerCase()) || cat.includes(searchCat.toLowerCase());
    const matchFilter = filterCat === 'all' || cat === filterCat;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=Silkscreen:wght@400;700&family=VT323&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue:#E65100; --blue-mid:#FF8F00; --blue-soft:#FFCA28;
          --blue-pale:#FFF59D; --blue-light:#FFFDE7;
          --surface:rgba(255,255,255,0.82); --glass:rgba(255,255,255,0.65);
          --border:rgba(255, 160, 0,0.13); --border-soft:rgba(255, 160, 0,0.07);
          --text:#0f172a; --muted:#1C1917; --bg:#FFFDE7;
          --green:#059669; --red:#dc2626;
        }
        html, body { overflow-y: auto !important; 
    background-color: #FFFFFF;
  font-family: 'Pixelify Sans', sans-serif;
  letter-spacing: 0.5px;
}
        body { font-family: 'VT323', monospace; background:var(--bg); color:var(--text); overflow-x:hidden; 
    background-color: #FFFFFF;
  font-family: 'Pixelify Sans', sans-serif;
  letter-spacing: 0.5px;
}
        @keyframes floatSmoke { from{transform:translate(0,0) scale(1);opacity:1;} to{transform:translate(60px,50px) scale(1.15);opacity:.8;} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px);} to{opacity:1;transform:translateX(0);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{ transform: rotate(360deg); } }
        .dash-page { max-width:1160px; margin:0 auto; padding:28px 20px 80px; }
        .stat-card {
  background: #FBBF24;
  border: 4px solid #1C1917;
  border-radius: 4px;
  box-shadow: 6px 6px 0px #1C1917;
  padding: 18px;
  transition: transform 0.1s;
}
        .stat-card:hover {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0px #1C1917;
}
        .glass-card {
  background: #FBBF24;
  border: 4px solid #1C1917;
  border-radius: 4px;
  box-shadow: 6px 6px 0px #1C1917;
  padding: 14px 16px;
  transition: transform 0.1s;
}
        .cat-row { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius: 4px; background:rgba(255,255,255,.55); border:1px solid var(--border-soft); transition:all .18s; animation:slideIn .35s ease both; }
        .cat-row:hover { background:rgba(255, 245, 157,.7); border-color:var(--border); transform:translateX(3px); }
        .intent-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius: 4px; font-size:11px; font-weight:700; white-space:nowrap; }
        .table-row:hover { background:rgba(255, 245, 157,.5); }
        .btn-filter { padding:6px 14px; border-radius: 4px; font-size:12px; font-weight:600; cursor:pointer; border: '3px solid #1C1917'; background:'#FFFFFF'; color: #1C1917; transition:all .18s; font-family: 'VT323', monospace; }
        .btn-filter:hover, .btn-filter.active { background:linear-gradient(135deg,var(--blue-soft),var(--blue)); color:white; border-color:transparent; box-shadow:0 4px 12px rgba(255, 160, 0,.25); }
        input[type=text]:focus { outline:none; border-color:var(--blue-soft)!important; box-shadow: 0 0 0 3px rgba(255, 193, 7,.2); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--blue-pale); border-radius:2px; }
      `}</style>

      {/* Clean background handled by globals css */}


      {/* NAVBAR */}
      <nav style={{
        background:'#FFFFFF',
        /* no blur */
        borderBottom: '4px solid #1C1917',
        padding:'0 28px', height:'62px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div>
            <div style={{ fontFamily:"'Pixelify Sans', sans-serif",fontSize:'17px',fontWeight:700,color:'#1C1917' }}>WangkuAI Dashboard</div>
            <div style={{ fontSize:'11px',color:'#1C1917' }}>Laporan Keuangan Realtime</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <Link href="/" style={{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 16px',fontSize:'13px',fontWeight:600,textDecoration:'none',background:'#EA580C',color:'white',border: '4px solid #1C1917', boxShadow: '4px 4px 0px #1C1917', borderRadius: '4px' }}>
            ← Chat
          </Link>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:10 }}>
      <div className="dash-page">

        {/* STAT CARDS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'Saldo Saat Ini', value: formatRp(data.currentBalance), hint:'Realtime', color:'#1C1917' },
            { label:'Pemasukan Bulan Ini', value:'+'+formatRp(data.incomeMonth), hint: new Date().toLocaleString('id-ID',{month:'long',year:'numeric'}), color:'#065F46' },
            { label:'Pengeluaran Bulan Ini', value:'–'+formatRp(data.expenseMonth), hint:'Jaga pengeluaranmu', color:'#991B1B' },
            { label:'Total Transaksi', value: String(data.txCountMonth), hint:'bulan ini', color:'#1C1917' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i*0.08}s` }}>
              <div style={{ fontSize:'10.5px',fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',color:'#1C1917',marginBottom:'8px' }}>{s.label}</div>
              <div style={{ fontFamily: "'Press Start 2P', system-ui", fontWeight: 800, fontSize:'14px',color:s.color, marginTop:'6px' }}>{s.value}</div>
              <div style={{ fontSize:'11px',color:'#1C1917',marginTop:'6px' }}>{s.hint}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 320px', gap:'16px', marginBottom:'24px' }}>

          {/* Bar Chart */}
          <div className="glass-card" style={{ animationDelay:'.1s' }}>
            <div style={{ padding:'18px 22px',borderBottom: '4px solid #1C1917',background:'linear-gradient(90deg,rgba(255, 245, 157,.5) 0%,transparent 100%)' }}>
              <div style={{ fontFamily: "'Pixelify Sans', sans-serif",fontSize:'15px' }}>Aktivitas 7 Hari Terakhir</div>
              <div style={{ fontSize:'11px',color:'#1C1917',marginTop:'2px' }}>Pemasukan vs Pengeluaran</div>
            </div>
            <div style={{ padding:'16px 18px 18px' }}>
              <div style={{ position:'relative',height:'240px' }}>
                <BarChartComp labels={data.chartLabels} exp={data.chartExp} inc={data.chartInc} />
              </div>
            </div>
          </div>

          {/* Donut */}
          <div className="glass-card" style={{ animationDelay:'.2s' }}>
            <div style={{ padding:'18px 22px',borderBottom: '4px solid #1C1917',background:'linear-gradient(90deg,rgba(255, 245, 157,.5) 0%,transparent 100%)' }}>
              <div style={{ fontFamily: "'Pixelify Sans', sans-serif",fontSize:'15px' }}>Komposisi Pengeluaran</div>
              <div style={{ fontSize:'11px',color:'#1C1917',marginTop:'2px' }}>Kategori — {new Date().toLocaleString('id-ID',{month:'long',year:'numeric'})}</div>
            </div>
            <DonutChartComp labels={data.chartCatLabels} data={data.chartCatData} total={data.expenseMonth} />
          </div>

          {/* Hari Ini */}
          <div className="glass-card" style={{ animationDelay:'.3s' }}>
            <div style={{ padding:'18px 22px',borderBottom: '4px solid #1C1917',background:'linear-gradient(90deg,rgba(255, 245, 157,.5) 0%,transparent 100%)' }}>
              <div style={{ fontFamily: "'Pixelify Sans', sans-serif",fontSize:'15px' }}>Hari Ini</div>
              <div style={{ fontSize:'11px',color:'#1C1917',marginTop:'2px' }}>{new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}</div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderBottom: '4px solid #1C1917' }}>
              {[
                { lbl:'Keluar', val:'–'+formatRp(data.todayExpense), color:'#991B1B' },
                { lbl:'Masuk',  val:'+'+formatRp(data.todayIncome),  color:'#065F46' },
                { lbl:'Transaksi', val:String(data.todayTxCount)+' txn', color:'#1C1917' },
              ].map((it,i) => (
                <div key={i} style={{ padding:'13px 14px', borderRight: i<2 ? '1px solid rgba(255, 160, 0,.07)' : 'none' }}>
                  <div style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.6px',color:'#1C1917',marginBottom:'3px' }}>{it.lbl}</div>
                  <div style={{ fontFamily: "'Press Start 2P', system-ui", fontWeight: 800, fontSize:'10px',color:it.color }}>{it.val}</div>
                </div>
              ))}
            </div>
            {data.todayCatRows.length > 0 ? (
              <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:'6px', maxHeight:'260px', overflowY:'auto' }}>
                {data.todayCatRows.map((row, idx) => {
                  const pct = data.todayCatTotal > 0 ? Math.round(row.total/data.todayCatTotal*100) : 0;
                  const emoji = CATEGORY_ICONS[row.name] ?? '📦';
                  const color = COLORS[idx % COLORS.length];
                  const rankClass = idx === 0 ? { bg:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#78350f' }
                    : idx === 1 ? { bg:'linear-gradient(135deg,#cbd5e1,#94a3b8)', color:'#1e293b' }
                    : idx === 2 ? { bg:'linear-gradient(135deg,#fbbf24,#d97706)', color:'#78350f' }
                    : { bg:'#FFFDE7', color:'#1C1917' };
                  return (
                    <div key={row.name} className="cat-row" style={{ animationDelay:`${idx*.06}s` }}>
                      <div style={{ width:'20px',height:'20px',borderRadius:'50%',fontSize:'10px',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:rankClass.bg,color:rankClass.color }}>{idx+1}</div>
                      <span style={{ fontSize:'16px',flexShrink:0,width:'22px',textAlign:'center' }}>{emoji}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:'12px',fontWeight:600 }}>{row.name.charAt(0).toUpperCase()+row.name.slice(1)}</div>
                        <div style={{ height:'3px',background:'rgba(255, 160, 0,.1)',borderRadius:'2px',marginTop:'4px',overflow:'hidden' }}>
                          <div style={{ height:'100%',borderRadius:'2px',background:color,width:`${pct}%`,transition:'width .9s ease' }} />
                        </div>
                      </div>
                      <div style={{ textAlign:'right',flexShrink:0 }}>
                        <div style={{ fontSize:'12px',fontWeight:700,color:'#991B1B' }}>–{formatRp(row.total)}</div>
                        <div style={{ fontSize:'10px',color:'#1C1917' }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign:'center',padding:'32px 20px',color:'#1C1917',fontSize:'13px' }}>
                Belum ada pengeluaran hari ini
              </div>
            )}
          </div>
        </div>

        {/* LINK KE TABEL INTENT & KATEGORI */}
        <div style={{ marginBottom:'24px', animationDelay:'.4s' }}>
          <Link href="/dashboard/transactions" style={{ display:'block', textDecoration:'none' }}>
            <div className="glass-card table-link-card" style={{ padding:'26px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s ease', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <div>
                  <h3 style={{ fontFamily: "'Pixelify Sans', sans-serif", fontSize:'20px', color:'#1C1917', marginBottom:'4px' }}>Tabel Intent & Kategori Lengkap</h3>
                  <p style={{ fontSize:'13px', color:'#1C1917', margin:0 }}>Lihat riwayat lengkap transaksi, filter kategori NLP, dan download laporan sebagai CSV.</p>
                </div>
              </div>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'white', display:'flex', alignItems:'center', justifyContent:'center', color:'#1C1917', fontSize:'18px', border: '3px solid #1C1917', boxShadow: '3px 3px 0px #1C1917' }}>
                →
              </div>
            </div>
          </Link>
          <style>{`
            .table-link-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 16px rgba(0,0,0,0.05);
              background: #ffffff;
            }
          `}</style>
        </div>

        {/* TX LINK */}
        <div style={{ marginBottom:'24px', animationDelay:'.5s' }}>
          <Link href="/" style={{ display:'block', textDecoration:'none' }}>
            <div className="glass-card table-link-card" style={{ padding:'26px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s ease', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <div>
                  <h3 style={{ fontFamily: "'Pixelify Sans', sans-serif", fontSize:'20px', color:'#1C1917', marginBottom:'4px' }}>Kembali ke Chat WangkuAI</h3>
                  <p style={{ fontSize:'13px', color:'#1C1917', margin:0 }}>Kembali ke menu utama untuk mencatat pengeluaran dan melihat saldo.</p>
                </div>
              </div>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'white', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontSize:'18px', border: '3px solid #1C1917', boxShadow: '3px 3px 0px #1C1917' }}>
                →
              </div>
            </div>
          </Link>
        </div>

      </div>
      </div>
    </>
  );
}
