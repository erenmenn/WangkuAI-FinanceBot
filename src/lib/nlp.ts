/**
 * ══════════════════════════════════════════════════════════════
 *  nlp.ts  —  WangkuAI Hybrid NLP Engine
 *
 *  Pipeline:
 *  1. Zero-Shot NLI via Hugging Face (IndoBERT)  ← primary
 *  2. Rule-Based Regex Fallback                  ← jika HF gagal
 *  3. Rule-Based Extractor (amount, date, desc)  ← selalu aktif
 *
 *  ✅ TANPA Gemini. Semua intent (1-12) diselesaikan di sini.
 * ══════════════════════════════════════════════════════════════
 */

// ── TIPE DATA ──────────────────────────────────────────────────────────────
export interface IntentResult {
  intent: string;
  amount: number | null;
  description: string | null;
  category: string;
  categories: string[];
  date: string | null;
  start_date: string | null;
  end_date: string | null;
  quantity: number | null;
  unit_price: number | null;
  calculation_note: string | null;
  confidence: number;
}

// ── DAFTAR INTENT & HIPOTESIS NLI ─────────────────────────────────────────
const INTENT_HYPOTHESES: Record<string, string> = {
  expense:       'Orang ini sedang mencatat pengeluaran, pembelian, atau pembayaran sesuatu',
  income:        'Orang ini sedang mencatat pemasukan, penerimaan, atau mendapat uang',
  set_balance:   'Orang ini ingin mengatur atau menetapkan saldo awal dompetnya',
  check_balance: 'Orang ini ingin mengetahui berapa saldo uangnya saat ini',
  check_today:   'Orang ini ingin melihat daftar atau total transaksi hari ini saja',
  check_month:   'Orang ini meminta rekap atau ringkasan keuangan bulan ini',
  check_date:    'Orang ini menanyakan pengeluaran pada tanggal tertentu yang spesifik',
  check_range:   'Orang ini menanyakan pengeluaran dalam rentang dari tanggal A sampai tanggal B',
  check_history: 'Orang ini ingin melihat riwayat atau daftar transaksi terakhirnya',
  set_limit:     'Orang ini ingin menetapkan batas atau limit pengeluaran harian',
  clear_today:   'Orang ini ingin menghapus atau mereset semua catatan transaksi hari ini',
  knowledge:     'Orang ini mengajukan pertanyaan umum tentang keuangan atau tips menabung',
};

// ── HUGGING FACE ROUTER URL (v2, menggantikan api-inference yang lama) ────
const HF_MODEL   = 'LazarusNLP/indobert-lite-base-p1-indonli-distil-mdeberta';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/v1/zero-shot-classification`;

// ── ZERO-SHOT CLASSIFIER via HF Inference Router ───────────────────────────
async function classifyIntentViaHF(text: string): Promise<{ label: string; score: number }[]> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  const payload = {
    inputs: text,
    parameters: {
      candidate_labels: Object.values(INTENT_HYPOTHESES),
      multi_label: false,
    },
  };

  const res = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`HF API Error ${res.status}: ${errBody}`);
  }

  const data = await res.json();

  // Map kalimat hipotesis → nama intent
  const hypothesisToIntent: Record<string, string> = {};
  for (const [intent, hyp] of Object.entries(INTENT_HYPOTHESES)) {
    hypothesisToIntent[hyp] = intent;
  }

  const labels: string[] = data.labels || [];
  const scores: number[] = data.scores || [];

  return labels.map((lbl: string, i: number) => ({
    label: hypothesisToIntent[lbl] ?? lbl,
    score: scores[i] ?? 0,
  }));
}

// ── RULE-BASED FALLBACK ────────────────────────────────────────────────────
// URUTAN PENTING: intent yang lebih spesifik harus dicek lebih dulu.
function classifyIntentByRules(text: string): string {
  const t = text.toLowerCase();

  // ── Operasi destruktif / penghapusan ──────────
  if (/\b(hapus|reset|clear|bersih)\b.{0,20}\b(hari ini|today|harian)\b/.test(t))
    return 'clear_today';

  // ── Set / konfigurasi ──────────────────────────
  if (/\b(set|pasang|batas|limit)\b.{0,20}\b(budget|limit|pengeluaran)\b/.test(t))
    return 'set_limit';
  if (/\b(set saldo|atur saldo|saldo awal|saldo mulai|modal awal|mulai saldo|inisialisasi saldo)\b/.test(t))
    return 'set_balance';

  // ── PEMASUKAN (income) — HARUS SEBELUM check_month! ──────────────
  // "dapat gaji bulan ini 2 juta" → income, BUKAN check_month
  const hasAmount = /\d/.test(t) || /\b(ribu|rb|juta|jt|ratus|k|perak)\b/.test(t);
  const hasIncomeVerb = /\b(gaji|gajian|dapat gaji|terima gaji|dibayar|dapat|dapet|nerima|terima|pemasukan|income|bonus|thr|uang saku|nafkah|komisi|upah|honor|honorarium|kiriman|transfer masuk|uang masuk)\b/.test(t);
  if (hasIncomeVerb && hasAmount) return 'income';

  // ── Cek riwayat / history ──────────────────────
  if (/\b(riwayat|histori|history|list transaksi|tampilkan transaksi|lihat transaksi)\b/.test(t))
    return 'check_history';

  // ── Cek rentang tanggal ────────────────────────
  // Support: "dari 17 maret sampai 18 maret" dan "dari 1/3 sampai 10/3"
  if (/\b(dari|antara)\b.{1,60}\b(sampai|hingga|s\/d)\b/.test(t))
    return 'check_range';

  // ── Cek tanggal spesifik ───────────────────────
  if (/\b(tanggal|tgl|pada tanggal)\b/.test(t) && /\d/.test(t))
    return 'check_date';
  // Nama bulan + angka (tanpa range): "15 maret", "pengeluaran 10 januari"
  if (/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/.test(t)
    && /\d/.test(t)
    && !/\b(sampai|hingga|s\/d)\b/.test(t))
    return 'check_date';

  // ── Cek rekap bulanan ──────────────────────────
  if (/\b(bulan ini|bulanan|monthly|rekap bulan|ringkasan bulan)\b/.test(t))
    return 'check_month';

  // ── Cek saldo ──────────────────────────────────
  if (/\b(cek saldo|berapa saldo|saldo ku|saldo saya|saldo gue|saldo gw|saldo aku|balance|duit ku|duit saya|lihat saldo)\b/.test(t))
    return 'check_balance';

  // ── PENGELUARAN (expense) ──────────────────────
  const hasExpenseVerb = /\b(beli|bayar|habis|jajan|keluar|belanja|makan|minum|isi bensin|top up|topup|ngeluarin|ngeluarkan|spend|borong|pesan|order|nyicil|cicil|bayarin|sewa|ngisi|charge|isi ulang|bayar tagihan|nonton|main|langganan|subscribe|subs|rental)\b/.test(t);
  if (hasExpenseVerb && hasAmount) return 'expense';

  // ── Cek transaksi hari ini ─────────────────────
  if (/\b(hari ini|today|pengeluaran hari ini|transaksi hari ini)\b/.test(t))
    return 'check_today';

  return 'knowledge';
}

// ── EKSTRAKTOR JUMLAH UANG ─────────────────────────────────────────────────
// Menangani: "50rb", "1.5jt", "3 gelas @12000", "Rp 250.000", dll.
export function extractAmount(text: string): {
  amount: number | null;
  quantity: number | null;
  unitPrice: number | null;
  note: string | null;
} {
  const t = text.toLowerCase();

  // Pola ganda dengan @: "3 gelas @12000" / "2x @15.000" / "5 buah @2rb"
  // Unit: gelas, botol, mangkok, porsi, bungkus, buah, pcs, kali, lembar, dll.
  const multiPat = /(\d+(?:[.,]\d+)?)\s*(?:gelas|botol|mangkok|piring|porsi|bungkus|buah|pcs|kali|lembar|dus|karton|pasang|item|dos|pak|liter|ml|kg|gram|loyang|x)?\s*[@x×]\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)(\s*(?:ribu|rb|k|juta|jt|m))?/i;
  const multiMatch = t.match(multiPat);
  if (multiMatch) {
    const qty  = parseFloat(multiMatch[1].replace(',', '.'));
    let uPrice = parseFloat(multiMatch[2].replace(/\./g, '').replace(',', '.'));
    const unit = (multiMatch[3] || '').toLowerCase().trim();
    if (/ribu|rb|k/.test(unit)) uPrice *= 1_000;
    if (/juta|jt/.test(unit))   uPrice *= 1_000_000;
    if (/miliar|m/.test(unit))  uPrice *= 1_000_000_000;
    const total = Math.round(qty * uPrice);
    return {
      amount: total,
      quantity: qty,
      unitPrice: uPrice,
      note: `${qty} × Rp${uPrice.toLocaleString('id-ID')} = Rp${total.toLocaleString('id-ID')}`,
    };
  }

  // Pola ganda dengan kata: "3 gelas seharga 12000" / "3 gelas 12 ribu"
  const multiWordPat = /(\d+(?:[.,]\d+)?)\s+(?:gelas|botol|mangkok|piring|porsi|bungkus|buah|pcs|lembar|dus|karton|pasang|item|pak|liter|kg)\s+(?:seharga|senilai|harga|@)?\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)(\s*(?:ribu|rb|k|juta|jt))?/i;
  const mwMatch = t.match(multiWordPat);
  if (mwMatch) {
    const qty  = parseFloat(mwMatch[1].replace(',', '.'));
    let uPrice = parseFloat(mwMatch[2].replace(/\./g, '').replace(',', '.'));
    const unit = (mwMatch[3] || '').toLowerCase().trim();
    if (/ribu|rb|k/.test(unit)) uPrice *= 1_000;
    if (/juta|jt/.test(unit))   uPrice *= 1_000_000;
    const total = Math.round(qty * uPrice);
    if (qty > 0 && uPrice > 0) {
      return {
        amount: total,
        quantity: qty,
        unitPrice: uPrice,
        note: `${qty} × Rp${uPrice.toLocaleString('id-ID')} = Rp${total.toLocaleString('id-ID')}`,
      };
    }
  }

  // Pola tunggal: "50rb", "1.5 juta", "Rp 250.000", "2500"
  const singlePat   = /(?:rp\.?\s*)?(\d[\d.,]*)\s*(miliar|juta|jt|ribu|rb|k|m)?(?!\s*[@x×])/i;
  const singleMatch = t.match(singlePat);
  if (singleMatch) {
    let num       = parseFloat(singleMatch[1].replace(/\./g, '').replace(',', '.'));
    const suffix  = (singleMatch[2] || '').toLowerCase();
    if (/ribu|rb|^k$/.test(suffix)) num *= 1_000;
    if (/juta|jt/.test(suffix))     num *= 1_000_000;
    if (/miliar/.test(suffix))      num *= 1_000_000_000;
    if (/^m$/.test(suffix))         num *= 1_000_000;
    if (num > 0) return { amount: Math.round(num), quantity: null, unitPrice: null, note: null };
  }

  return { amount: null, quantity: null, unitPrice: null, note: null };
}

// ── MULTI-ITEM EXPENSE PARSER ────────────────────────────────────────────────
export interface ExpenseItem {
  description: string;
  amount: number;
  raw: string;
}

export function extractMultipleExpenses(text: string): ExpenseItem[] | null {
  const SEPARATOR = /\s*(?:,|\bdan\b|\bsama\b|\bjuga\b|&)\s*/i;
  const SEGMENT_PAT =
    /^(?:beli|bayar|jajan|topup|isi)?\s*([\w\s]+?)\s+(?:rp\.?\s*)?(\d[\d.,]*)\s*(ribu|rb|k|juta|jt|m|miliar)?$/i;

  const segments = text.split(SEPARATOR).map(s => s.trim()).filter(Boolean);
  if (segments.length < 2) return null;

  const items: ExpenseItem[] = [];
  for (const seg of segments) {
    const m = seg.match(SEGMENT_PAT);
    if (!m) continue;
    let amount = parseFloat(m[2].replace(/\./g, '').replace(',', '.'));
    const suffix = (m[3] || '').toLowerCase();
    if (/ribu|rb|^k$/.test(suffix)) amount *= 1_000;
    if (/juta|jt/.test(suffix))     amount *= 1_000_000;
    if (/miliar/.test(suffix))       amount *= 1_000_000_000;
    if (/^m$/.test(suffix))          amount *= 1_000_000;
    const desc = m[1].trim().replace(/^(beli|bayar|jajan|isi)\s+/i, '').trim();
    if (amount > 0 && desc.length >= 1) {
      items.push({ description: desc, amount: Math.round(amount), raw: seg });
    }
  }
  return items.length >= 2 ? items : null;
}

// ── EKSTRAKTOR TANGGAL ─────────────────────────────────────────────────────
function extractDate(text: string): {
  date: string | null;
  startDate: string | null;
  endDate: string | null;
} {
  const t     = text.toLowerCase();
  const today = new Date();
  const pad   = (n: number) => String(n).padStart(2, '0');
  const fmt   = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // Nama bulan
  const months: Record<string, number> = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agt: 8, sep: 9, okt: 10, nov: 11, des: 12,
  };

  // Rentang dengan nama bulan: "dari 17 maret sampai 18 maret"
  const rangeNamePat = /(?:dari\s*)?(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agt|sep|okt|nov|des)\s*(?:sampai|hingga|s\/d|-)\s*(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agt|sep|okt|nov|des)/;
  const rnm = t.match(rangeNamePat);
  if (rnm) {
    const y = today.getFullYear();
    const m1 = months[rnm[2]];
    const m2 = months[rnm[4]];
    return {
      date: null,
      startDate: `${y}-${pad(m1)}-${pad(+rnm[1])}`,
      endDate:   `${y}-${pad(m2)}-${pad(+rnm[3])}`,
    };
  }

  // Rentang angka: "1/3 - 10/3"
  const rangePat = /(?:dari\s*)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\s*(?:sampai|hingga|s\/d|-)\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
  const rm       = t.match(rangePat);
  if (rm) {
    const y  = today.getFullYear();
    const ys = rm[3] ? (+rm[3] < 100 ? 2000 + +rm[3] : +rm[3]) : y;
    const ye = rm[6] ? (+rm[6] < 100 ? 2000 + +rm[6] : +rm[6]) : y;
    return {
      date: null,
      startDate: `${ys}-${pad(+rm[2])}-${pad(+rm[1])}`,
      endDate:   `${ye}-${pad(+rm[5])}-${pad(+rm[4])}`,
    };
  }

  // Nama bulan tanggal tunggal: "10 Maret" / "10 maret 2025"
  for (const [name, mNum] of Object.entries(months)) {
    const m = t.match(new RegExp(`(\\d{1,2})\\s+${name}(?:\\s+(\\d{4}))?`));
    if (m) {
      const y = m[2] ? +m[2] : today.getFullYear();
      return { date: `${y}-${pad(mNum)}-${pad(+m[1])}`, startDate: null, endDate: null };
    }
  }

  // Format dd/mm/yyyy atau dd-mm-yyyy
  const dmPat = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?(?!\s*[-\/]\s*\d)/;
  const dm    = t.match(dmPat);
  if (dm && !t.includes('sampai') && !t.includes('hingga')) {
    const y = dm[3] ? (+dm[3] < 100 ? 2000 + +dm[3] : +dm[3]) : today.getFullYear();
    return {
      date: `${y}-${pad(+dm[2])}-${pad(+dm[1])}`,
      startDate: null, endDate: null,
    };
  }

  if (/kemarin/.test(t)) {
    const yday = new Date(today);
    yday.setDate(today.getDate() - 1);
    return { date: fmt(yday), startDate: null, endDate: null };
  }

  return { date: null, startDate: null, endDate: null };
}

// ── DETEKSI KATEGORI OTOMATIS ─────────────────────────────────────────────
export function detectCategories(text: string): string[] {
  const t = text.toLowerCase();
  const map: Record<string, string[]> = {
    makanan:            ['nasi', 'mie', 'ayam', 'bakso', 'soto', 'seblak', 'makan', 'lauk', 'warteg', 'kantin', 'nasi goreng', 'mie goreng', 'sate', 'pecel', 'gado', 'burger', 'pizza', 'steak', 'roti', 'donat', 'kerupuk', 'indomie', 'snack', 'camilan', 'cemilan', 'jajanan', 'gorengan', 'tempe', 'tahu', 'ikan', 'daging', 'mie ayam', 'rawon', 'semur', 'gulai', 'rendang', 'pempek', 'lontong', 'ketoprak', 'siomay', 'dimsum', 'martabak', 'bubur', 'kwetiau', 'bihun', 'cap cay', 'makan siang', 'makan malam', 'makan pagi', 'sarapan', 'sosis'],
    minuman:            ['kopi', 'teh', 'jus', 'bubble', 'susu', 'minum', 'es ', 'boba', 'minuman', 'air mineral', 'aqua', 'pocari', 'isotonic', 'energen', 'nutrisari', 'teh botol', 'softdrink', 'cola', 'soda', 'sprite', 'fanta', 'milk', 'coklat', 'cappuccino', 'latte', 'americano', 'matcha', 'thai tea', 'es teh', 'es kopi', 'jus buah'],
    transport:          ['ojek', 'grab', 'gojek', 'taksi', 'taxi', 'bus', 'kereta', 'angkot', 'bentor', 'motor', 'parkir', 'gocar', 'commuter', 'krl', 'mrt', 'lrt', 'toll', 'tol', 'becak', 'ojol', 'biaya perjalanan', 'naik grab', 'naik gojek', 'ongkir', 'ongkos kirim'],
    bbm:                ['bensin', 'solar', 'pertamax', 'pertalite', 'bbm', 'premium', 'minyak', 'gas motor', 'isi bensin', 'isi motor'],
    pendidikan:         ['buku', 'spp', 'kuliah', 'les', 'kursus', 'seminar', 'alat tulis', 'pensil', 'bolpen', 'binder', 'kertas', 'tinta', 'spidol', 'kalkulator', 'ukt', 'uang kuliah', 'kampus', 'sekolah', 'pelatihan', 'workshop', 'bootcamp', 'sertifikasi'],
    keperluan_kuliah:   ['atk', 'print', 'fotocopy', 'fotokopi', 'jilid', 'buku kuliah', 'buku pelajaran', 'tugas', 'praktikum', 'lab', 'printer', 'tinta printer', 'flashdisk', 'keperluan kuliah', 'keperluan sekolah', 'alat lab', 'biaya lab'],
    fashion:            ['baju', 'kaos', 'celana', 'sepatu', 'tas ', 'jaket', 'dress', 'hijab', 'sandal', 'pakaian', 'kemeja', 'rok', 'blouse', 'topi', 'dompet', 'ikat pinggang', 'kacamata', 'jam tangan', 'gelang', 'kalung', 'perhiasan', 'legging', 'jeans', 'sweater', 'hoodie', 'outfit', 'busana', 'mukena', 'sarung'],
    game:               ['game', 'diamond', 'mobile legend', 'free fire', 'ml ', 'ff ', 'topup game', 'voucher game', 'pubg', 'steam', 'valorant', 'roblox', 'minecraft', 'point blank', 'gaming', 'voucher ml', 'voucher ff', 'topup ml', 'topup ff', 'codm'],
    topup:              ['gopay', 'ovo', 'dana', 'linkaja', 'shopeepay', 'emoney', 'topup', 'top up', 'saldo gopay', 'saldo dana', 'saldo ovo', 'dompet digital', 'pay later', 'spaylater', 'kredivo'],
    streaming:          ['netflix', 'spotify', 'youtube premium', 'disney', 'vidio', 'streaming', 'crunchyroll', 'wetv', 'viu', 'canva', 'figma', 'chatgpt', 'langganan', 'subscribe', 'subscrib', 'subs', 'apple music', 'joox', 'resso'],
    listrik:            ['listrik', 'token listrik', 'pln', 'tagihan listrik', 'tagihan pln', 'meteran'],
    internet:           ['wifi', 'internet', 'indihome', 'fiber', 'wifi bulanan', 'firstmedia', 'myrepublic', 'orbit', 'tagihan wifi'],
    pulsa:              ['pulsa', 'paket data', 'kuota', 'paket internet', 'reload', 'isi pulsa', 'kartu', 'paket telp'],
    belanja:            ['indomaret', 'alfamart', 'supermarket', 'hypermart', 'belanja', 'minimarket', 'toko', 'shopee', 'tokopedia', 'lazada', 'blibli', 'tiktok shop', 'bukalapak', 'marketplace', 'mall', 'giant', 'carrefour', 'lottemart', 'transmart'],
    kesehatan:          ['obat', 'apotek', 'dokter', 'rumah sakit', 'klinik', 'vitamin', 'masker', 'suplemen', 'skincare', 'sabun mandi', 'shampo', 'pasta gigi', 'sikat gigi', 'minyak kayu putih', 'tolak angin', 'bodrex', 'paracetamol', 'antimo', 'odol', 'puskesmas'],
    hiburan:            ['bioskop', 'cinema', 'konser', 'tiket', 'wahana', 'karaoke', 'bermain', 'nonton', 'event', 'hiking', 'pantai', 'wisata', 'rekreasi', 'taman', 'permainan', 'escape room', 'bowling', 'billiard'],
    investasi:          ['saham', 'reksa dana', 'deposito', 'crypto', 'bitcoin', 'nabung saham', 'obligasi', 'emas', 'logam mulia', 'bibit', 'ajaib', 'pluang'],
    tabungan:           ['tabungan', 'nabung', 'celengan', 'simpan', 'saving', 'nabungin'],
    makanan_online:     ['shopee food', 'gofood', 'grabfood', 'pesan makan', 'delivery makanan'],
    kesehatan_gym:      ['gym', 'fitness', 'renang', 'olahraga', 'zumba', 'yoga', 'pilates', 'angkat beban', 'member gym'],
    kebutuhan_rumah:    ['deterjen', 'sabun piring', 'pel', 'sapu', 'tisu', 'pewangi', 'barang rumah', 'keperluan rumah', 'perlengkapan rumah'],
    elektronik:         ['hp', 'handphone', 'laptop', 'headset', 'earphone', 'charger', 'powerbank', 'kabel', 'mouse', 'keyboard', 'monitor', 'tablet', 'aksesoris hp', 'casing', 'smartwatch', 'airpods', 'speaker'],
    perawatan_diri:     ['salon', 'potong rambut', 'cukur', 'manikur', 'pedikur', 'facial', 'spa', 'waxing', 'smoothing', 'cream', 'lotion', 'parfum', 'deodorant', 'serum', 'toner', 'sunscreen', 'moisturizer'],
    alat:               ['palu', 'obeng', 'tang', 'kunci pas', 'bor', 'gergaji', 'perkakas', 'alat bengkel', 'alat tukang', 'alat pertukangan', 'toolbox', 'meteran', 'penggaris', 'kuas', 'cat tembok', 'amplas', 'lem', 'paku', 'mur', 'baut', 'sekrup'],
  };

  const found: string[] = [];
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some(kw => t.includes(kw))) found.push(cat);
  }
  return found.length > 0 ? found : ['lainnya'];
}

// ── EKSTRAKTOR DESKRIPSI ──────────────────────────────────────────────────
function extractDescription(text: string, intent: string): string | null {
  let desc = text.trim();

  const triggerPatterns: RegExp[] = [];
  if (intent === 'expense') {
    triggerPatterns.push(
      /^(tadi\s+)?(beli|bayar|habis|jajan|keluar|belanja|makan|beli)\s+/i,
      /^(aku|saya|gue|gw|ane)?\s*(beli|bayar|jajan|makan|habis(kan)?)\s+/i,
    );
  } else if (intent === 'income') {
    triggerPatterns.push(
      /^(aku|saya|gue|gw)?\s*(dapat|terima|nerima|dapet|masuk)\s+/i,
      /^(gajian|pemasukan dari|income dari)\s+/i,
    );
  }

  for (const rgx of triggerPatterns) {
    desc = desc.replace(rgx, '').trim();
  }

  desc = desc.replace(/\s+(?:rp\.?\s*)?\d[\d.,]*\s*(?:ribu|rb|k|juta|jt|m|miliar)?\s*$/i, '').trim();
  desc = desc.replace(/\b(tadi|kemarin|hari ini|siang|malam|pagi|sore|barusan|baru saja|tadi pagi|tadi malem)\b/gi, '').trim();
  desc = desc.replace(/\s+(dan|sama|juga)\s*$/i, '').trim();

  if (desc.length >= 2) return desc;
  const cats = detectCategories(text);
  return cats[0] !== 'lainnya' ? cats[0] : null;
}

// ── FUNGSI UTAMA: DETECT INTENT ───────────────────────────────────────────
export async function detectIntent(userMessage: string): Promise<IntentResult> {
  const { amount, quantity, unitPrice, note } = extractAmount(userMessage);
  const { date, startDate, endDate }           = extractDate(userMessage);
  const categories                             = detectCategories(userMessage);

  let intentLabel = 'knowledge';
  let confidence  = 0;

  // Step 1: Coba Zero-Shot via Hugging Face
  try {
    const results = await classifyIntentViaHF(userMessage);
    if (results.length > 0 && results[0].score > 0.25) {
      intentLabel = results[0].label;
      confidence  = results[0].score;
    } else {
      intentLabel = classifyIntentByRules(userMessage);
      confidence  = 0.6;
    }
  } catch (_err) {
    // Step 2: HF gagal → Fallback rule-based
    console.warn('[NLP] Fallback ke rule-based:', (_err as Error).message);
    intentLabel = classifyIntentByRules(userMessage);
    confidence  = 0.6;
  }

  const description = extractDescription(userMessage, intentLabel);

  return {
    intent:           intentLabel,
    amount,
    description,
    category:         categories[0] ?? 'lainnya',
    categories,
    date,
    start_date:       startDate,
    end_date:         endDate,
    quantity,
    unit_price:       unitPrice,
    calculation_note: note,
    confidence,
  };
}
