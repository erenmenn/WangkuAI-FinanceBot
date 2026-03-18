'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  alat: '🔧', kuliah: '🎓', keperluan_kuliah: '✏️', elektronik: '💻',
  perawatan_diri: '💅', kebutuhan_rumah: '🏠',
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  makanan: '#f59e0b',      minuman: '#0ea5e9',       transport: '#10b981',
  bbm: '#f97316',          belanja: '#8b5cf6',        fashion: '#ec4899',
  game: '#6366f1',         topup: '#14b8a6',          streaming: '#a855f7',
  listrik: '#eab308',      air: '#06b6d4',            internet: '#FFCA28',
  pulsa: '#22c55e',        kesehatan: '#ef4444',      pendidikan: '#f97316',
  hiburan: '#d946ef',      investasi: '#8b5cf6',      tabungan: '#10b981',
  makanan_online: '#f59e0b', lainnya: '#1C1917',      alat: '#78716c',
  kuliah: '#0284c7',       keperluan_kuliah: '#0891b2', elektronik: '#6366f1',
  perawatan_diri: '#db2777', kebutuhan_rumah: '#92400e',
};

// ── Daftar semua intents + kategori yang tersedia ──────────────────────────
const ALL_INTENT_OPTIONS = [
  { value: 'all',     label: 'Semua Intent',   icon: '🔍' },
  { value: 'expense', label: 'Pengeluaran',    icon: '💸' },
  { value: 'income',  label: 'Pemasukan',      icon: '💰' },
];

const ALL_CATEGORY_OPTIONS = [
  { value: 'all',              label: 'Semua Kategori',    icon: '🔍' },
  { value: 'makanan',          label: 'Makanan',           icon: '🍜' },
  { value: 'minuman',          label: 'Minuman',           icon: '☕' },
  { value: 'transport',        label: 'Transport',         icon: '🚗' },
  { value: 'bbm',              label: 'BBM',               icon: '⛽' },
  { value: 'belanja',          label: 'Belanja',           icon: '🛒' },
  { value: 'fashion',          label: 'Fashion',           icon: '👗' },
  { value: 'kuliah',           label: 'Kuliah',            icon: '🎓' },
  { value: 'keperluan_kuliah', label: 'Keperluan Kuliah',  icon: '✏️' },
  { value: 'pendidikan',       label: 'Pendidikan',        icon: '📚' },
  { value: 'alat',             label: 'Alat / Perkakas',   icon: '🔧' },
  { value: 'elektronik',       label: 'Elektronik',        icon: '💻' },
  { value: 'game',             label: 'Game',              icon: '🎮' },
  { value: 'topup',            label: 'Top Up',            icon: '💳' },
  { value: 'streaming',        label: 'Streaming',         icon: '📺' },
  { value: 'pulsa',            label: 'Pulsa / Data',      icon: '📱' },
  { value: 'internet',         label: 'Internet',          icon: '📶' },
  { value: 'listrik',          label: 'Listrik',           icon: '⚡' },
  { value: 'kesehatan',        label: 'Kesehatan',         icon: '🏥' },
  { value: 'kesehatan_gym',    label: 'Gym / Olahraga',    icon: '💪' },
  { value: 'perawatan_diri',   label: 'Perawatan Diri',    icon: '💅' },
  { value: 'kebutuhan_rumah',  label: 'Kebutuhan Rumah',   icon: '🏠' },
  { value: 'hiburan',          label: 'Hiburan',           icon: '🎉' },
  { value: 'makanan_online',   label: 'Makanan Online',    icon: '🛵' },
  { value: 'investasi',        label: 'Investasi',         icon: '📈' },
  { value: 'tabungan',         label: 'Tabungan',          icon: '🏦' },
  { value: 'lainnya',          label: 'Lainnya',           icon: '📦' },
];

interface DashboardData {
  intentTable: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: string;
  }[];
}

// ── DropdownFilter component ──────────────────────────────────────────────
function DropdownFilter({
  label,
  icon,
  options,
  value,
  onChange,
  colorMap,
}: {
  label: string;
  icon: string;
  options: { value: string; label: string; icon: string }[];
  value: string;
  onChange: (v: string) => void;
  colorMap?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value) ?? options[0];
  const accentColor = colorMap && value !== 'all' ? (colorMap[value] ?? '#FF8F00') : '#FF8F00';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px',
          background: value === 'all' ? '#FFFFFF' : accentColor + '22',
          border: `3px solid ${value === 'all' ? '#1C1917' : accentColor}`,
          boxShadow: `3px 3px 0px ${value === 'all' ? '#1C1917' : accentColor}`,
          borderRadius: '4px', cursor: 'pointer', fontFamily: "'Pixelify Sans', sans-serif",
          fontSize: '13px', fontWeight: 700, color: value === 'all' ? '#1C1917' : accentColor,
          transition: 'all 0.1s', userSelect: 'none', minWidth: '160px',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{selected.icon}</span>
          <span>{selected.label}</span>
        </span>
        <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '4px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999,
          background: '#FFFDE7',
          border: '3px solid #1C1917',
          boxShadow: '6px 6px 0px #1C1917',
          borderRadius: '4px',
          minWidth: '220px',
          maxHeight: '340px',
          overflowY: 'auto',
          animation: 'dropIn 0.12s ease',
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.7px',
            textTransform: 'uppercase', color: '#1C1917',
            borderBottom: '2px solid #1C1917',
            background: 'rgba(255,245,157,0.6)',
            fontFamily: "'Pixelify Sans', sans-serif",
          }}>
            {icon} {label}
          </div>
          {options.map(opt => {
            const isActive = opt.value === value;
            const optColor = colorMap && opt.value !== 'all' ? (colorMap[opt.value] ?? '#1C1917') : '#1C1917';
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 14px',
                  background: isActive ? (optColor + '22') : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,160,0,0.08)',
                  cursor: 'pointer', fontSize: '13px', fontFamily: "'Pixelify Sans', sans-serif",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? optColor : '#1C1917',
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = optColor + '15'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? optColor + '22' : 'transparent'; }}
              >
                <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{opt.icon}</span>
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && <span style={{ fontSize: '12px' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchCat, setSearchCat] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterType, setFilterType] = useState('all');

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
          <p style={{ color: '#1C1917', fontFamily: "'VT323', monospace" }}>Memuat data transaksi…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredTable = data.intentTable.filter(r => {
    const cat = r.category.split(',')[0].trim().toLowerCase();
    const matchSearch = r.description.toLowerCase().includes(searchCat.toLowerCase()) || cat.includes(searchCat.toLowerCase());
    const matchCat = filterCat === 'all' || cat === filterCat;
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const exportCSV = () => {
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah', 'Tipe'];
    const rows = filteredTable.map(r => [
      `"${r.date}"`,
      `"${r.description}"`,
      `"${r.category.replace(/"/g, '""')}"`,
      `"${r.amount}"`,
      `"${r.type}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Catatan_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        html, body { overflow-y: auto !important; background-color: #FFFFFF; font-family: 'Pixelify Sans', sans-serif; letter-spacing: 0.5px; }
        body { font-family: 'Pixelify Sans', sans-serif; background:var(--bg); color:var(--text); overflow-x:hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{ transform: rotate(360deg); } }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
        .dash-page { max-width:1160px; margin:0 auto; padding:28px 20px 80px; }
        .glass-card {
          background: #FBBF24;
          border: 4px solid #1C1917;
          border-radius: 4px;
          box-shadow: 6px 6px 0px #1C1917;
          padding: 14px 16px;
          transition: transform 0.1s;
        }
        .glass-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
          border-radius: 0px;
          background: #F97316; color: #FFFFFF;
          border: 4px solid #1C1917;
          box-shadow: 4px 4px 0px #1C1917, inset -4px -4px 0px rgba(0,0,0,0.2);
          font-weight: 600; cursor: pointer; transition: all 0.1s;
          font-family: 'Pixelify Sans', sans-serif; text-transform: uppercase;
          text-decoration: none;
        }
        .glass-btn:hover { background: #EA580C; transform: translate(2px, 2px); box-shadow: 2px 2px 0px #1C1917; }
        .intent-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius: 4px; font-size:11px; font-weight:700; white-space:nowrap; }
        .table-row:hover { background:rgba(255, 245, 157,.5); }
        .btn-download {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
          border-radius: 0px; background: #10B981; color: #FFFFFF;
          border: 4px solid #1C1917;
          box-shadow: 4px 4px 0px #1C1917, inset -4px -4px 0px rgba(0,0,0,0.2);
          font-weight: 600; cursor: pointer; transition: all 0.1s;
          font-family: 'Pixelify Sans', sans-serif; text-transform: uppercase;
        }
        .btn-download:hover { background: #059669; transform: translate(2px, 2px); box-shadow: 2px 2px 0px #1C1917; }
        input[type=text]:focus { outline:none; border-color:var(--blue-soft)!important; box-shadow: 0 0 0 3px rgba(255, 193, 7,.2); }
        .table-scroll-glass { max-height:480px; overflow-y:auto; overflow-x:auto; position:relative; }
        .table-scroll-glass::-webkit-scrollbar { width:6px; height:6px; }
        .table-scroll-glass::-webkit-scrollbar-track { background:transparent; }
        .table-scroll-glass::-webkit-scrollbar-thumb { background:rgba(255, 160, 0,.2); border-radius:3px; }
        /* dropdown scrollbar */
        div[style*="maxHeight: '340px'"]::-webkit-scrollbar { width:4px; }
        div[style*="maxHeight: '340px'"]::-webkit-scrollbar-thumb { background: rgba(255,160,0,.3); border-radius:2px; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        background:'#FFFFFF',
        borderBottom: '4px solid #1C1917', padding:'0 28px', height:'62px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div>
            <div style={{ fontFamily:"'Pixelify Sans', sans-serif",fontSize:'17px',fontWeight:700,color:'#1C1917' }}>WangkuAI Transaksi</div>
            <div style={{ fontSize:'11px',color:'#1C1917' }}>Semua Riwayat Intent &amp; Kategori</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <Link href="/dashboard" className="glass-btn">
            Kembali Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:10 }}>
        <div className="dash-page">
          <div className="glass-card" style={{ marginBottom:'24px' }}>
            {/* Header */}
            <div style={{ padding:'18px 22px',borderBottom: '4px solid #1C1917',background:'linear-gradient(90deg,rgba(255, 245, 157,.5) 0%,transparent 100%)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px' }}>
              <div>
                <div style={{ fontFamily: "'Pixelify Sans', sans-serif",fontSize:'18px' }}>Tabel Daftar Transaksi Lengkap</div>
                <div style={{ fontSize:'12px',color:'#1C1917',marginTop:'2px' }}>Histori lengkap intent NLP &amp; kategori pengeluaran/pemasukan.</div>
              </div>
              <div style={{ display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap' }}>
                <input
                  type="text"
                  placeholder="Cari deskripsi atau kategori…"
                  value={searchCat}
                  onChange={e => setSearchCat(e.target.value)}
                  style={{ padding:'8px 16px',borderRadius: '4px',fontSize:'13px',border:'3px solid #1C1917',background:'#FFE082',fontFamily: '"Pixelify Sans", sans-serif',width:'220px',color:'#1C1917',transition:'all .18s', boxShadow:'3px 3px 0px #1C1917' }}
                />
                <button onClick={exportCSV} className="btn-download">
                  ⬇ Download CSV
                </button>
              </div>
            </div>

            {/* ── FILTER BAR: 2 dropdown tombol ── */}
            <div style={{ padding:'14px 22px', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center', borderBottom: '4px solid #1C1917', background:'rgba(255,249,196,.45)' }}>
              {/* Filter intent */}
              <DropdownFilter
                label="Filter Intent"
                icon="⚡"
                options={ALL_INTENT_OPTIONS}
                value={filterType}
                onChange={setFilterType}
              />

              {/* Filter kategori */}
              <DropdownFilter
                label="Filter Kategori"
                icon="🏷"
                options={ALL_CATEGORY_OPTIONS}
                value={filterCat}
                onChange={setFilterCat}
                colorMap={CATEGORY_COLOR_MAP}
              />

              {/* Active filter chips (visual feedback) */}
              {(filterType !== 'all' || filterCat !== 'all' || searchCat) && (
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'11px', color:'#1C1917', opacity:0.7 }}>Aktif:</span>
                  {filterType !== 'all' && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:'#FBBF24', border:'2px solid #1C1917', borderRadius:'4px', fontSize:'11px', fontWeight:700, color:'#1C1917' }}>
                      {ALL_INTENT_OPTIONS.find(o=>o.value===filterType)?.icon} {ALL_INTENT_OPTIONS.find(o=>o.value===filterType)?.label}
                      <button onClick={()=>setFilterType('all')} style={{ background:'none', border:'none', cursor:'pointer', color:'#1C1917', fontWeight:900, fontSize:'12px', lineHeight:1, marginLeft:'2px' }}>×</button>
                    </span>
                  )}
                  {filterCat !== 'all' && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', background: (CATEGORY_COLOR_MAP[filterCat]??'#FBBF24')+'33', border:`2px solid ${CATEGORY_COLOR_MAP[filterCat]??'#1C1917'}`, borderRadius:'4px', fontSize:'11px', fontWeight:700, color: CATEGORY_COLOR_MAP[filterCat]??'#1C1917' }}>
                      {ALL_CATEGORY_OPTIONS.find(o=>o.value===filterCat)?.icon} {ALL_CATEGORY_OPTIONS.find(o=>o.value===filterCat)?.label}
                      <button onClick={()=>setFilterCat('all')} style={{ background:'none', border:'none', cursor:'pointer', color: CATEGORY_COLOR_MAP[filterCat]??'#1C1917', fontWeight:900, fontSize:'12px', lineHeight:1, marginLeft:'2px' }}>×</button>
                    </span>
                  )}
                  {searchCat && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:'rgba(255,255,255,0.6)', border:'2px solid #1C1917', borderRadius:'4px', fontSize:'11px', fontWeight:700, color:'#1C1917' }}>
                      🔍 &quot;{searchCat}&quot;
                      <button onClick={()=>setSearchCat('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#1C1917', fontWeight:900, fontSize:'12px', lineHeight:1, marginLeft:'2px' }}>×</button>
                    </span>
                  )}
                  <button
                    onClick={()=>{ setFilterType('all'); setFilterCat('all'); setSearchCat(''); }}
                    style={{ padding:'3px 10px', background:'#ef4444', border:'2px solid #1C1917', borderRadius:'4px', fontSize:'11px', fontWeight:700, color:'white', cursor:'pointer' }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* TABLE */}
            <div className="table-scroll-glass">
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ background:'rgba(255, 245, 157,.3)', position:'sticky', top:0, zIndex:2 }}>
                    {['Tanggal','Deskripsi','Kategori / Intent','Jumlah'].map(h => (
                      <th key={h} style={{ padding:'14px 18px', textAlign:'left', fontSize:'11px', fontWeight:700, letterSpacing:'.6px', textTransform:'uppercase', color:'#1C1917', borderBottom: '4px solid #1C1917', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign:'center', padding:'40px', color:'#1C1917' }}>
                        Tidak ada transaksi ditemukan
                      </td>
                    </tr>
                  ) : filteredTable.map((row) => {
                    const cats = row.category.split(',').map(c=>c.trim().toLowerCase());
                    return (
                      <tr key={row.id} className="table-row" style={{ borderBottom: '4px solid #1C1917', transition:'background .15s' }}>
                        <td style={{ padding:'14px 18px', color:'#1C1917', fontSize:'13px', whiteSpace:'nowrap' }}>{row.date}</td>
                        <td style={{ padding:'14px 18px', maxWidth:'260px' }}>
                          <span style={{ fontWeight:500, color:'#1C1917', fontSize:'14px' }}>{row.description}</span>
                        </td>
                        <td style={{ padding:'14px 18px' }}>
                          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                            {cats.map(cat => (
                              <span
                                key={cat}
                                className="intent-badge"
                                style={{
                                  background: (CATEGORY_COLOR_MAP[cat]??'#1C1917')+'22',
                                  color: CATEGORY_COLOR_MAP[cat]??'#1C1917',
                                  border: `1px solid ${(CATEGORY_COLOR_MAP[cat]??'#1C1917')}44`,
                                  fontSize: '12px', padding: '4px 12px'
                                }}
                              >
                                {CATEGORY_ICONS[cat] ?? '📦'} {cat.charAt(0).toUpperCase()+cat.slice(1)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:'14px 18px', fontWeight:700, color: row.type==='income'?'#059669':'#dc2626', whiteSpace:'nowrap', textAlign:'right', fontSize:'14px' }}>
                          {row.type==='expense' ? '–' : '+'}{formatRp(row.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTable.length > 0 && (
              <div style={{ padding:'16px 22px',borderTop:'1px solid rgba(255, 160, 0,.07)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255, 249, 196,.3)',fontSize:'13px',color:'#1C1917' }}>
                <span>Menampilkan <strong style={{color:'#1C1917'}}>{filteredTable.length}</strong> dari <strong style={{color:'#1C1917'}}>{data.intentTable.length}</strong> transaksi</span>
                <span>Total Ditampilkan: <strong style={{color:'#1C1917'}}>{formatRp(filteredTable.reduce((s,r)=>s+(r.type==='expense'?-r.amount:r.amount),0))}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
