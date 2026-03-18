/**
 * Test script: apakah setiap kategori UI bisa terdeteksi oleh NLP?
 * Jalankan dengan: node scripts/test-categories.mjs
 */

// ── Copy dari nlp.ts (pure JS version untuk testing) ─────────────────────
function detectCategories(text) {
  const t = text.toLowerCase();
  const map = {
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

  const found = [];
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some(kw => t.includes(kw))) found.push(cat);
  }
  return found.length > 0 ? found : ['lainnya'];
}

// ── SEMUA KATEGORI DI UI FILTER ───────────────────────────────────────────
// Setiap entry: { category, sampleInputs[] }
const TEST_CASES = [
  // ── makanan ──────────────────────────────────────────────────────────────
  { category: 'makanan', tests: [
    'beli nasi goreng 15rb', 'makan soto 20000', 'jajan bakso 12rb',
    'beli ayam geprek 25rb', 'sarapan bubur 10rb',
  ]},
  // ── minuman ──────────────────────────────────────────────────────────────
  { category: 'minuman', tests: [
    'beli kopi 15rb', 'minum teh manis 5000', 'jus buah 12rb',
    'es boba 18rb', 'cappuccino 25000',
  ]},
  // ── transport ────────────────────────────────────────────────────────────
  { category: 'transport', tests: [
    'naik grab 20rb', 'ongkos ojek 8rb', 'bayar parkir 5000',
    'naik gojek ke kampus 15rb', 'tiket kereta 30rb',
  ]},
  // ── bbm ──────────────────────────────────────────────────────────────────
  { category: 'bbm', tests: [
    'isi bensin 50rb', 'beli pertamax 75rb', 'isi pertalite motor 30rb',
    'bayar bbm 40rb',
  ]},
  // ── belanja ──────────────────────────────────────────────────────────────
  { category: 'belanja', tests: [
    'belanja di indomaret 35rb', 'beli di shopee 120rb',
    'belanja alfamart 50rb', 'order tokopedia 200rb',
    'belanja di supermarket 150rb',
  ]},
  // ── fashion ──────────────────────────────────────────────────────────────
  { category: 'fashion', tests: [
    'beli baju baru 120rb', 'beli sepatu 350rb', 'beli celana jeans 200rb',
    'beli jaket 250rb', 'beli kaos 80rb',
  ]},
  // ── kuliah / pendidikan ───────────────────────────────────────────────────
  { category: 'pendidikan', tests: [
    'bayar SPP 500rb', 'bayar UKT 2 juta', 'beli buku kuliah 75rb',
    'biaya kursus bahasa 300rb', 'ikut workshop coding 150rb',
  ]},
  // ── keperluan_kuliah ──────────────────────────────────────────────────────
  { category: 'keperluan_kuliah', tests: [
    'print tugas 10rb', 'fotocopy materi 5rb', 'beli flashdisk 50rb',
    'keperluan kuliah 30rb', 'biaya lab 25rb',
  ]},
  // ── alat ──────────────────────────────────────────────────────────────────
  { category: 'alat', tests: [
    'beli obeng 15rb', 'beli palu 25rb', 'beli paku 5rb',
    'beli perkakas bengkel 50rb', 'beli kunci pas 30rb',
  ]},
  // ── elektronik ───────────────────────────────────────────────────────────
  { category: 'elektronik', tests: [
    'beli headset 150rb', 'beli charger hp 50rb', 'beli powerbank 200rb',
    'beli mouse wireless 80rb', 'beli laptop 8 juta',
  ]},
  // ── game ──────────────────────────────────────────────────────────────────
  { category: 'game', tests: [
    'topup diamond ML 50rb', 'beli voucher free fire 25rb',
    'topup game 100rb', 'beli steam game 200rb', 'voucher valorant 50rb',
  ]},
  // ── topup ─────────────────────────────────────────────────────────────────
  { category: 'topup', tests: [
    'topup gopay 100rb', 'isi saldo dana 50rb', 'topup OVO 200rb',
    'isi saldo shopeepay 75rb',
  ]},
  // ── streaming ─────────────────────────────────────────────────────────────
  { category: 'streaming', tests: [
    'bayar netflix 54rb', 'langganan spotify 19rb', 'subs youtube premium 59rb',
    'bayar disney+ 49rb', 'langganan chatgpt 300rb',
  ]},
  // ── pulsa ─────────────────────────────────────────────────────────────────
  { category: 'pulsa', tests: [
    'beli pulsa 25rb', 'beli paket data 50rb', 'isi kuota 80rb',
    'isi pulsa kartu 30rb',
  ]},
  // ── internet ──────────────────────────────────────────────────────────────
  { category: 'internet', tests: [
    'bayar wifi indihome 300rb', 'tagihan internet bulanan 200rb',
    'bayar myrepublic 250rb',
  ]},
  // ── listrik ───────────────────────────────────────────────────────────────
  { category: 'listrik', tests: [
    'beli token listrik 100rb', 'bayar tagihan PLN 200rb',
    'bayar listrik bulanan 150rb',
  ]},
  // ── kesehatan ─────────────────────────────────────────────────────────────
  { category: 'kesehatan', tests: [
    'beli obat di apotek 30rb', 'bayar dokter 150rb',
    'beli vitamin C 25rb', 'beli paracetamol 8rb',
  ]},
  // ── kesehatan_gym ─────────────────────────────────────────────────────────
  { category: 'kesehatan_gym', tests: [
    'bayar member gym 200rb', 'ikut fitness 150rb',
    'bayar renang 25rb', 'kelas yoga 100rb',
  ]},
  // ── perawatan_diri ────────────────────────────────────────────────────────
  { category: 'perawatan_diri', tests: [
    'potong rambut 35rb', 'beli parfum 120rb', 'beli sunscreen 80rb',
    'facial di salon 200rb', 'beli serum wajah 150rb',
  ]},
  // ── kebutuhan_rumah ────────────────────────────────────────────────────────
  { category: 'kebutuhan_rumah', tests: [
    'beli deterjen 25rb', 'beli sabun piring 10rb', 'beli tisu 15rb',
    'keperluan rumah 100rb',
  ]},
  // ── hiburan ───────────────────────────────────────────────────────────────
  { category: 'hiburan', tests: [
    'nonton bioskop 50rb', 'beli tiket konser 500rb', 'karaoke 200rb',
    'main bowling 100rb',
  ]},
  // ── makanan_online ────────────────────────────────────────────────────────
  { category: 'makanan_online', tests: [
    'pesan gofood 45rb', 'order grabfood 60rb',
    'beli shopee food 55rb', 'delivery makanan 50rb',
  ]},
  // ── investasi ─────────────────────────────────────────────────────────────
  { category: 'investasi', tests: [
    'beli saham 500rb', 'invest reksa dana 1 juta',
    'beli emas logam mulia 1jt', 'topup bibit 200rb',
  ]},
  // ── tabungan ──────────────────────────────────────────────────────────────
  { category: 'tabungan', tests: [
    'nabung 100rb', 'setor tabungan 200rb', 'simpan uang 50rb', 'celengan 25rb',
  ]},
];

// ── Jalankan tes ──────────────────────────────────────────────────────────
const PASS = '✅ PASS';
const FAIL = '❌ FAIL';

let totalPass = 0;
let totalFail = 0;
const failReport = [];

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  NLP CATEGORY DETECTION AUDIT - WangkuAI');
console.log('══════════════════════════════════════════════════════════════\n');

for (const { category, tests } of TEST_CASES) {
  console.log(`── Kategori: ${category.toUpperCase()} ─────────────────────────────`);
  let catPass = 0;
  let catFail = 0;
  for (const input of tests) {
    const result = detectCategories(input);
    const detected = result.includes(category);
    if (detected) {
      catPass++;
      totalPass++;
      console.log(`  ${PASS} "${input}" → [${result.join(', ')}]`);
    } else {
      catFail++;
      totalFail++;
      console.log(`  ${FAIL} "${input}" → [${result.join(', ')}]  (harusnya: ${category})`);
      failReport.push({ category, input, got: result });
    }
  }
  console.log(`  → ${catPass}/${tests.length} lulus\n`);
}

// ── Ringkasan ──────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════════════');
console.log(`  HASIL: ${totalPass} PASS, ${totalFail} FAIL dari ${totalPass + totalFail} total tes`);
const pct = Math.round(totalPass / (totalPass + totalFail) * 100);
console.log(`  AKURASI KATEGORI: ${pct}%`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failReport.length > 0) {
  console.log('⚠ DAFTAR YANG GAGAL (perlu ditambah keyword):');
  for (const f of failReport) {
    console.log(`  • [${f.category}] "${f.input}" → terdeteksi sebagai: [${f.got.join(', ')}]`);
  }
  console.log('');
}
