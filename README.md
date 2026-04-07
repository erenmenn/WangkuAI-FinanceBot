<div align="center">
  <img src="public/img/robot-cat.png" width="130" alt="WangkuAI Mascot" />

  <h1>WangkuAI</h1>
  <h3>Asisten Pribadi untuk Pengelolaan Keuangan</h3>
  <p><i>Cukup ketik seperti chat ke teman — WangkuAI yang urus sisanya.</i></p>

  <br/>

  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&logo=statuspage" />
  <img src="https://img.shields.io/badge/Platform-Web%20App-blue?style=for-the-badge&logo=googlechrome" />
  <img src="https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-purple?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/NLP-IndoBERT-FF9D00?style=for-the-badge&logo=huggingface" />
  <img src="https://img.shields.io/badge/Multi--User-✅-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge" />

<br/><br/>

<a href="#-apa-itu-wangkuai">💬 Tentang</a> &nbsp;•&nbsp;
<a href="#-lihat-sendiri-cara-kerjanya">🎬 Demo</a> &nbsp;•&nbsp;
<a href="#-cara-kerja-di-balik-layar">⚙️ Cara Kerja</a> &nbsp;•&nbsp;
<a href="#-fitur-lengkap">✨ Fitur</a> &nbsp;•&nbsp;
<a href="#-intent-lengkap-19-intent">🧠 Intent</a> &nbsp;•&nbsp;
<a href="#-wangkuai-vs-aplikasi-keuangan-lain">🆚 Perbandingan</a> &nbsp;•&nbsp;
<a href="#️-arsitektur">🏗️ Arsitektur</a>

</div>

---

## 💬 Apa itu WangkuAI?

**WangkuAI** adalah asisten keuangan pribadi berbasis percakapan yang memungkinkan siapa pun **mencatat, memantau, dan menganalisa keuangan harian hanya dengan mengetik kalimat biasa** — seperti chat ke teman, tanpa form, tanpa pilih kategori, tanpa drama.

### Masalah yang diselesaikan

Banyak orang _niat_ mencatat keuangan, tapi cepat menyerah karena prosesnya melelahkan:

```
Aplikasi konvensional:
  Buka app → Klik "Tambah" → Pilih "Pengeluaran"
  → Ketik nominal → Pilih kategori dari 20 opsi
  → Pilih tanggal → Klik simpan
  → Ulangi untuk setiap item

WangkuAI:
  Ketik → Selesai.
```

> **WangkuAI menghilangkan semua gesekan itu.**  
> Tulis saja seperti biasa, AI yang memahami maksudmu.

---

## 🎬 Lihat Sendiri Cara Kerjanya

### Catat 1 item — semudah ngetik

```
Kamu  :  beli kopi 15rb
MinoAI:  ✅ 1 Transaksi Berhasil Dicatat!
          ──────────────────────
          1. 💸 kopi — -Rp 15.000
          ──────────────────────
          💸 Total Pengeluaran: Rp 15.000
          🏦 Saldo Baru: Rp 985.000
```

### Insight Kategori — tau paling boros di mana

```
Kamu  :  minggu ini aku paling banyak habis di apa?
MinoAI:  📊 Minggu Ini — Kategori Terbesar
          ──────────────────────
          1. 🍜 makanan
             ████████░░ Rp 420.000 (45%)
          2. 🚗 transport
             ████░░░░░░ Rp 180.000 (19%)
          3. ☕ minuman
             ███░░░░░░░ Rp 95.000 (10%)

          ⚠️ Insight:
          Kategori 🍜 makanan mendominasi 45% dari total pengeluaranmu.

          💡 Saran:
          Coba masak sendiri 2–3x seminggu dan kurangi pesan online 🍱
```

### Profil Keuangan — AI yang "kenal kamu"

```
Kamu  :  aku boros gak?
MinoAI:  🧠 Profil Keuanganmu
          ──────────────────────
          Kamu cenderung: Impulsive Spender 🛍️

          📊 Kondisi Bulan Ini:
          • Pemasukan  : Rp 3.000.000
          • Pengeluaran: Rp 2.750.000
          • Saving Rate: 8% 🟡 Bisa lebih baik
          • Burn Rate  : ~Rp 91.667/hari

          📌 Ciri kamu:
          • Banyak transaksi kecil (kopi, snack, jajan)
          • Sering transaksi harian berulang
          • Kebiasaan beli tanpa rencana

          💡 Saran:
          Gunakan aturan "tunggu 24 jam" sebelum beli. Set limit harian & evaluasi tiap malam.
```

### Prediksi Dompet — MinoAI jadi peramal

```
Kamu  :  kalau aku terus kayak gini, bakal habis kapan?
MinoAI:  🔮 Prediksi Keuangan
          ──────────────────────
          📉 Burn Rate Harian: ~Rp 91.667/hari
          💰 Saldo Saat Ini  : Rp 750.000

          ⏳ Jika pola pengeluaran tetap:
          → Saldo akan habis dalam ±8 hari
          ⚠️ Mulai hemat dari sekarang.

          💡 Saran:
          Kurangi pengeluaran harian 20% → ~Rp 73.334/hari
```

### Perbandingan Periode — tau tren keuangan

```
Kamu  :  minggu ini lebih boros dari minggu lalu gak?
MinoAI:  📊 Perbandingan Mingguan
          ──────────────────────
          📅 Minggu Ini  : Rp 800.000
          📅 Minggu Lalu : Rp 650.000
          ──────────────────────
          ⬆️ Naik 23% (lebih boros Rp 150.000)

          📌 Penyebab utama kenaikan: 🍜 makanan +Rp 120.000
```

### Goal Tracking — MinoAI jadi coach

```
Kamu  :  aku mau nabung 1 juta bulan ini
MinoAI:  🎯 Target Tabungan Bulan Ini Diset!
          ──────────────────────
          💰 Target  : Rp 1.000.000
          ⏳ Sisa waktu : 10 hari
          📌 Perlu nabung ~Rp 100.000/hari

Kamu  :  progress tabungan aku gimana?
MinoAI:  🎯 Progress Goal Tabungan Bulan Ini
          ──────────────────────
          🏁 Target  : Rp 1.000.000
          💰 Terkumpul: Rp 650.000
          ██████░░░░ 65%
          ⏳ Sisa waktu: 10 hari
          📌 Perlu hemat ~Rp 35.000/hari untuk capai target!
```

### Anomaly Detection — AI yang "sadar" lonjakan

```
(Otomatis setelah transaksi atau query "pengeluaran tidak biasa")

MinoAI:  🚨 Pengeluaran Tidak Biasa!
          Hari ini Rp 300.000 (biasanya ~Rp 90.000)
          ⚠️ Lonjakan 233%
          📌 Penyebab utama: 👗 fashion
          
          💬 Mau aku bantu set limit pengeluaran harian?
```

### Laporan klasik — tetap tersedia

<table>
<tr><th>Yang Kamu Ketik</th><th>Balasan WangkuAI</th></tr>
<tr><td><code>berapa saldo aku?</code></td><td>💳 Saldo realtime + status (Aman / Menipis / Habis)</td></tr>
<tr><td><code>pengeluaran hari ini</code></td><td>📅 Total & rincian semua transaksi hari ini</td></tr>
<tr><td><code>rekap bulan ini</code></td><td>📆 Pemasukan, pengeluaran, surplus/defisit bulan ini</td></tr>
<tr><td><code>pengeluaran 15 maret</code></td><td>🗓️ Laporan tanggal spesifik — terdeteksi otomatis</td></tr>
<tr><td><code>dari 1 maret sampai 10 maret</code></td><td>📊 Laporan rentang tanggal, total + rata-rata per transaksi</td></tr>
<tr><td><code>riwayat transaksi</code></td><td>📋 10 transaksi terakhir lengkap</td></tr>
<tr><td><code>set limit harian 100rb</code></td><td>🎯 Budget harian aktif, notif otomatis di 80% & 100%</td></tr>
<tr><td><code>tips menabung</code></td><td>💡 Panduan finansial personal sesuai konteks kamu</td></tr>
<tr><td><code>dapat gaji 3 juta</code></td><td>💰 Saldo bertambah Rp 3.000.000, pemasukan dicatat</td></tr>
</table>

### 🔄 Simulasi Session Mengalir (Full User Journey)

WangkuAI dirancang untuk teman ngobrol dari awal sampai akhir bulan, merespons rentetan konteks dengan cerdas:
1. `set saldo 1.5 juta` → _(Set dompet awal)_
2. `aku mau nabung 500rb bulan ini` → _(AI hitung target hemat per hari)_
3. `beli ayam geprek 20rb dan es teh 5rb` → _(Catat pengeluaran, saldo otomatis berkurang)_
4. `dapat transferan 200rb, tapi langsung jajan 30rb` → _(Pemasukan & pengeluaran dalam satu pesan diproses sekaligus)_
5. `minggu ini gue boros di mana?` → _(Minta insight kategori yang paling kuras dompet)_
6. `bakal habis kapan kalau gini terus?` → _(Prediksi umur sisa saldo dengan burn rate saat ini)_
7. `gimana cara aku lebih hemat?` → _(Dapat saran personal based-on data transaksimu)_

---

## ⚙️ Cara Kerja di Balik Layar

Satu pesan darimu melewati proses ini dalam hitungan milidetik:

```
 Kamu ketik:  "beli sepatu 350rb dan makan siang 25rb"
      │
      ▼
 ┌──────────────────────────────────────────────────────┐
 │               🧠 GEMINI 2.5 FLASH AI                │
 │                                                      │
 │  Parse intent + ekstrak semua transaksi sekaligus   │
 │  → intent: "transaction"                            │
 │  → transactions: [{sepatu, 350000}, {makan, 25000}] │
 │  → replyText: pesan motivasi gaul                   │
 └───────────────────────┬──────────────────────────────┘
                         │
                         ▼
 ┌──────────────────────────────────────────────────────┐
 │                  📦 INTENT ROUTER                   │
 │                                                      │
 │  19 intent handler (core + v2 analytics):           │
 │  ✦ transaction       ✦ check_balance                │
 │  ✦ check_month       ✦ check_today                  │
 │  ✦ check_history     ✦ insight_category_spending    │
 │  ✦ financial_health  ✦ spending_prediction          │
 │  ✦ comparison_period ✦ goal_tracking                │
 │  ✦ recommendation    ✦ anomaly_detection            │
 │  ✦ set_goal          ✦ knowledge...                 │
 └───────────────────────┬──────────────────────────────┘
                         │
                         ▼
 ┌──────────────────────────────────────────────────────┐
 │                   🗄️ DATABASE                       │
 │                                                      │
 │  Aggregation, Comparison, Burn Rate, Goal Tracking  │
 │  Anomaly Baseline, Category Stats — via Prisma ORM  │
 └──────────────────────────────────────────────────────┘
                         │
                         ▼
 Balasan terformat dengan insight + rekomendasi personal
```

---

## ✨ Fitur Lengkap

<table>
<tr><th colspan="2">💬 Pencatatan Cerdas via Chat</th></tr>
<tr><td>📝 Catat 1 item pengeluaran</td><td><code>beli kopi 15rb</code></td></tr>
<tr><td>📝 Catat banyak item sekaligus</td><td><code>beli baju 80rb dan makan 25rb dan kopi 15rb</code></td></tr>
<tr><td>🔀 Catat Pemasukan & Pengeluaran sekaligus</td><td><code>dapat cashback 15k tapi jajan cilok 10k</code></td></tr>
<tr><td>📐 Deteksi kuantitas × harga satuan</td><td><code>3 gelas es teh @5000</code> → Rp 15.000</td></tr>
<tr><td>💰 Catat pemasukan</td><td><code>dapat gaji 3 juta</code> / <code>terima transfer 500rb</code></td></tr>
<tr><td>⚙️ Set saldo awal dompet</td><td><code>set saldo 1 juta</code></td></tr>
<tr><td>🏷️ Kategori otomatis — tanpa pilih manual</td><td>25+ kategori terdeteksi dari kata kuncinya</td></tr>

<tr><th colspan="2">📊 Laporan & Pengecekan Waktu Nyata</th></tr>
<tr><td>💳 Cek saldo + status keuangan</td><td><code>berapa saldo aku?</code></td></tr>
<tr><td>📅 Rekap transaksi hari ini</td><td><code>pengeluaran hari ini</code></td></tr>
<tr><td>📆 Rekap bulanan dengan net surplus/defisit</td><td><code>rekap bulan ini</code></td></tr>
<tr><td>🗓️ Laporan tanggal spesifik</td><td><code>pengeluaran 15 maret</code></td></tr>
<tr><td>📊 Laporan rentang tanggal</td><td><code>dari 1 maret sampai 10 maret</code></td></tr>
<tr><td>📋 10 riwayat transaksi terakhir</td><td><code>riwayat transaksi</code></td></tr>

<tr><th colspan="2">🎯 Budget & Kendali Pengeluaran</th></tr>
<tr><td>🎯 Set budget harian</td><td><code>set limit harian 100rb</code></td></tr>
<tr><td>⚠️ Notifikasi otomatis di 80% pemakaian</td><td>Muncul langsung di dalam chat</td></tr>
<tr><td>🚨 Peringatan keras saat budget terlampaui</td><td>Tampil merah & mencolok di chat</td></tr>
<tr><td>🗑️ Reset catatan hari ini</td><td><code>hapus catatan hari ini</code></td></tr>

<tr><th colspan="2">🧠 AI Analytics & Insight (NEW v2.0)</th></tr>
<tr><td>📊 Insight kategori pengeluaran terbesar</td><td><code>minggu ini aku paling banyak habis di apa?</code></td></tr>
<tr><td>🧠 Financial health check & profil spender</td><td><code>keuanganku sehat gak?</code> / <code>aku tipe spender apa?</code></td></tr>
<tr><td>🔮 Prediksi saldo & proyeksi akhir bulan</td><td><code>kalau aku terus kayak gini bakal habis kapan?</code></td></tr>
<tr><td>📊 Perbandingan minggu/bulan ini vs lalu</td><td><code>bulan ini lebih hemat dari bulan lalu gak?</code></td></tr>
<tr><td>🎯 Set & track goal tabungan bulanan</td><td><code>aku mau nabung 1 juta bulan ini</code></td></tr>
<tr><td>📈 Progress tracking goal tabungan</td><td><code>progress tabunganku gimana?</code></td></tr>
<tr><td>💡 Smart recommendation engine</td><td><code>kasih saran keuanganku dong</code></td></tr>
<tr><td>🚨 Anomaly detection — lonjakan pengeluaran</td><td><code>pengeluaran hari ini normal gak?</code> (+ auto-trigger)</td></tr>
<tr><td>🤖 Pemahaman Edge Case & Konteks Rumit</td><td><code>minggu kemarin vs sekarang mana lebih parah?</code></td></tr>
<tr><td>💬 Conversational follow-up suggestion</td><td>Otomatis setelah setiap respons transaksi & anomali</td></tr>

<tr><th colspan="2">📈 Dashboard Visual Lengkap</th></tr>
<tr><td>📊 Chart batang 7 hari terakhir</td><td>Pemasukan vs Pengeluaran berdampingan</td></tr>
<tr><td>🍩 Donut chart komposisi kategori</td><td>Tau mana yang paling menguras kantong</td></tr>
<tr><td>🏷️ Tabel transaksi + filter dropdown</td><td>Filter intent (Pemasukan/Pengeluaran) + 25+ kategori</td></tr>
<tr><td>⬇️ Export CSV sekali klik</td><td>Download laporan semua transaksi</td></tr>

<tr><th colspan="2">💡 Tips Keuangan Kontekstual</th></tr>
<tr><td>📚 Tips menabung, investasi, hutang</td><td><code>tips menabung</code> / <code>cara atur gaji</code></td></tr>
<tr><td>🎓 Tips khusus mahasiswa & anak kos</td><td><code>tips anak kos</code></td></tr>
<tr><td>💼 Tips untuk freelancer & wirausaha</td><td><code>tips freelance</code></td></tr>

<tr><th colspan="2">🔐 Keamanan & Multi-User</th></tr>
<tr><td>👤 Tiap user punya data terisolasi</td><td>Tidak ada data yang bocor antar akun</td></tr>
<tr><td>🔒 Autentikasi JWT via NextAuth.js</td><td>Session aman, login persisten</td></tr>
<tr><td>🛡️ Route protection middleware</td><td>Semua halaman & API terlindungi otomatis</td></tr>
</table>

---

## 🧠 Intent Lengkap (19 Intent)

### Core Intents (12)

| Intent | Trigger Contoh | Aksi |
|--------|---------------|------|
| `transaction` | `beli kopi 15rb`, `dapat gaji 3 juta` | Catat transaksi ke DB, update saldo |
| `check_balance` | `berapa saldo aku?` | Tampilkan saldo + status |
| `check_month` | `rekap bulan ini` | Rekap pemasukan/pengeluaran bulanan |
| `check_today` | `pengeluaran hari ini` | Daftar transaksi + total hari ini |
| `check_history` | `riwayat transaksi` | 10 transaksi terakhir |
| `check_date` | `pengeluaran 15 maret` | Laporan tanggal spesifik |
| `check_range` | `dari 1-10 maret` | Laporan rentang tanggal |
| `set_limit` | `set limit harian 100rb` | Set budget harian |
| `set_balance` | `set saldo 500rb` | Set saldo awal |
| `clear_today` | `hapus catatan hari ini` | Hapus transaksi hari ini |
| `knowledge` | `tips menabung` | Jawab pertanyaan keuangan umum |

### Analytics Intents v2.0 (8 NEW)

| Intent | Trigger Contoh | Analisa Yang Dilakukan |
|--------|---------------|----------------------|
| `insight_category_spending` | `minggu ini boros di mana?`, `kategori terbesar apa?` | Aggregasi & ranking per kategori + persentase + advice |
| `financial_health_check` | `keuanganku sehat gak?`, `aku tipe spender apa?` | Saving rate, burn rate, persona classifier (Saver/Balanced/Impulsive/Heavy) |
| `spending_prediction` | `bakal habis kapan?`, `bisa nabung gak bulan ini?` | Burn rate → prediksi hari saldo habis + proyeksi akhir bulan |
| `comparison_period` | `minggu ini vs minggu lalu?`, `bulan ini lebih hemat?` | Perbandingan total + penyebab utama kenaikan/penurunan |
| `goal_tracking` | `progress tabunganku?`, `udah berapa yang terkumpul?` | Progress bar + sisa hari + target harian |
| `set_goal` | `aku mau nabung 1 juta bulan ini` | Set saving goal + kalkulasi target per hari |
| `recommendation_engine` | `kasih saran keuanganku dong`, `analisa pengeluaranku` | Rule-based rekomendasi personal berdasarkan pola nyata |
| `anomaly_detection` | `hari ini pengeluaranku normal gak?` (+ auto-trigger) | Deteksi lonjakan vs baseline 14 hari + identifikasi penyebab |

### Spending Persona Classification

| Persona | Kriteria | Advice |
|---------|----------|--------|
| 🌟 Smart Saver | Saving rate ≥ 30% | Mulai investasi reksa dana/emas |
| ⚖️ Balanced Spender | Saving rate 10-29% | Tingkatkan dengan metode 50/30/20 |
| 🛍️ Impulsive Spender | >50% transaksi kecil (< Rp 30rb) | Aturan "tunggu 24 jam" + limit harian |
| 🔥 Heavy Spender | Saving rate < 10% | Metode amplop digital |

---

## 🆚 WangkuAI vs Aplikasi Keuangan Lain

|                                | 🐱 **WangkuAI v2** | 💼 Money Manager | 📱 YNAB / Wallet |
| ------------------------------ | :--------------: | :-------------: | :--------------: |
| Input via chat bahasa natural  |        ✅        |       ❌        |        ❌        |
| Kategori terdeteksi otomatis   |        ✅        |    ❌ Manual    |    ❌ Manual     |
| Multi-item dalam 1 pesan       |        ✅        |       ❌        |        ❌        |
| Hitung `3x@12000` otomatis     |        ✅        |       ❌        |        ❌        |
| Deteksi tanggal dari teks      |        ✅        |       ❌        |        ❌        |
| Bahasa Indonesia penuh         |        ✅        |   🔶 Sebagian   |        ❌        |
| Insight ranking kategori       |        ✅        |   🔶 Premium    |   🔶 Premium     |
| Profil spender AI              |        ✅        |       ❌        |        ❌        |
| Prediksi saldo habis           |        ✅        |   🔶 Premium    |   🔶 Premium     |
| Perbandingan minggu/bulan      |        ✅        |   🔶 Premium    |   🔶 Premium     |
| Goal tracking tabungan bulanan |        ✅        |   🔶 Premium    |   🔶 Premium     |
| Smart recommendation engine    |        ✅        |       ❌        |        ❌        |
| Anomaly detection otomatis     |        ✅        |       ❌        |        ❌        |
| Budget alert real-time di chat |        ✅        |   🔶 Premium    |   🔶 Premium     |
| Dashboard + export CSV gratis  |        ✅        |   🔶 Berbayar   |   🔶 Berbayar    |
| Multi-user cloud               |        ✅        |   🔶 Berbayar   |   🔶 Berbayar    |
| Open source & self-hostable    |        ✅        |       ❌        |        ❌        |

> **Intinya:** WangkuAI v2 bukan sekadar pencatat — ia **menganalisa pola hidup keuanganmu**, memberi insight mendalam, memprediksi kondisi dompetmu, dan memberikan rekomendasi personal yang relevan. Semua lewat chat biasa.

---

## 🏗️ Arsitektur

```
 Browser (Next.js UI)
        │  HTTP/JSON
        ▼
 ┌──────────────────────────────────────┐
 │         Next.js API Routes           │
 │                                      │
 │  /api/chat      ← otak chatbot v2    │
 │  /api/stats/*   ← data dashboard     │
 │  /api/balance   ← manajemen saldo    │
 │  /api/budget    ← limit & goal       │
 │  /api/auth/*    ← NextAuth login     │
 └──────────┬───────────────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
 ┌─────────┐   ┌────────────────────────────┐
 │ Gemini  │   │       Prisma ORM           │
 │ 2.5     │   │                            │
 │ Flash   │   │  User, Balance             │
 │         │   │  Transaction               │
 │ Intent  │   │  BudgetLimit (limit+goal)  │
 │ Parser  │   │  ChatHistory               │
 │    +    │   │                            │
 │ 19      │   │  SQLite / Postgres         │
 │ Handler │   │                            │
 └─────────┘   └────────────────────────────┘
```

| Layer        | Yang Dipakai                                              |
| ------------ | --------------------------------------------------------- |
| Framework    | Next.js 16, TypeScript                                    |
| Auth         | NextAuth.js (JWT session)                                 |
| Database     | SQLite (dev) · PostgreSQL (prod)                          |
| ORM          | Prisma                                                    |
| AI Utama     | Google Gemini 2.5 Flash (Intent + Reply Generation)       |
| NLP Fallback | HuggingFace IndoBERT Zero-Shot + Custom Regex Rule Engine |
| Analytics    | Rule-based aggregation, burn rate, persona classification |
| UI           | Vanilla CSS · Pixelify Sans · Press Start 2P             |

---

## 🎯 25+ Kategori Terdeteksi Otomatis

| Emoji | Kategori         | Contoh Kata Kunci                      |
| ----- | ---------------- | -------------------------------------- |
| 🍜    | Makanan          | nasi, ayam, bakso, makan siang, soto   |
| ☕    | Minuman          | kopi, teh, boba, jus, es teh           |
| 🚗    | Transport        | grab, ojek, gojek, parkir, kereta      |
| ⛽    | BBM              | bensin, pertamax, pertalite, isi motor |
| 🛒    | Belanja          | shopee, tokopedia, indomaret, alfamart |
| 👗    | Fashion          | baju, sepatu, jaket, celana, tas       |
| 🎓    | Kuliah           | SPP, UKT, uang kuliah, kampus          |
| ✏️    | Keperluan Kuliah | print, fotocopy, flashdisk, lab        |
| 🔧    | Alat / Perkakas  | palu, obeng, paku, kunci pas           |
| 💻    | Elektronik       | headset, charger, laptop, powerbank    |
| 🎮    | Game             | diamond ML, free fire, steam, PUBG     |
| 💳    | Top Up           | gopay, dana, OVO, shopeepay            |
| 📺    | Streaming        | netflix, spotify, chatgpt, disney+     |
| 📱    | Pulsa / Data     | pulsa, paket data, kuota internet      |
| 📶    | Internet         | wifi, indihome, myrepublic             |
| ⚡    | Listrik          | token listrik, PLN, tagihan listrik    |
| 🏥    | Kesehatan        | obat, apotek, dokter, vitamin          |
| 💪    | Gym / Olahraga   | gym, fitness, yoga, renang             |
| 💅    | Perawatan Diri   | salon, parfum, sunscreen, serum        |
| 🏠    | Kebutuhan Rumah  | deterjen, sabun piring, tisu           |
| 🎉    | Hiburan          | bioskop, konser, karaoke, bowling      |
| 🛵    | Makanan Online   | gofood, grabfood, shopee food          |
| 📈    | Investasi        | saham, reksa dana, emas, crypto        |
| 🏦    | Tabungan         | nabung, celengan, simpan               |
| 📦    | Lainnya          | fallback jika tidak ada yang cocok     |

> 📊 **Uji internal:** 106 test cases — akurasi deteksi kategori **100%** ✅

---

## 🗺️ Roadmap

**Sudah Ada (v1.0):**

- [x] 12 intent NLP (expense, income, budget, laporan, tips, dst.)
- [x] Catat multi-item dalam 1 pesan
- [x] Deteksi harga satuan (`3x@12000`)
- [x] 25+ kategori otomatis
- [x] Budget alert real-time di chat
- [x] Dashboard chart 7 hari + donut komposisi
- [x] Tabel transaksi dengan filter dropdown per kategori & intent
- [x] Export CSV sekali klik
- [x] Multi-user dengan data terisolasi
- [x] Autentikasi lengkap (register, login, session)

**Baru Ditambahkan (v2.0) 🆕:**

- [x] 📊 Insight kategori pengeluaran terbesar (minggu/bulan)
- [x] 🧠 Financial health check + persona spender AI
- [x] 🔮 Prediksi saldo habis + proyeksi akhir bulan
- [x] 📊 Perbandingan periode (minggu ini vs lalu, bulan ini vs lalu)
- [x] 🎯 Goal tracking tabungan bulanan (set + progress)
- [x] 💡 Smart recommendation engine berbasis pola nyata
- [x] 🚨 Anomaly detection — deteksi lonjakan pengeluaran otomatis
- [x] 💬 Conversational follow-up setelah setiap transaksi

**Akan Datang (v3.0):**

- [ ] 📸 OCR Struk — foto nota langsung dibaca & dicatat
- [ ] 💼 Buku Utang/Kasbon — catat piutang pelanggan
- [ ] 🛒 Mode Kasir (POS) — untuk UMKM & warung kecil
- [ ] 💰 Dompet ganda — pisahkan uang pribadi vs usaha
- [ ] 📄 Export PDF — laporan laba-rugi siap cetak
- [ ] 📧 Email reminder mingguan otomatis
- [ ] 📱 PWA + notifikasi push

---

## 🤝 Kontribusi

WangkuAI adalah proyek open source. Kontribusi sangat disambut!

```bash
git checkout -b feat/nama-fitur
git commit -m "feat: deskripsi fitur"
git push origin feat/nama-fitur
# → lalu buka Pull Request
```

---

## 📄 Lisensi

[MIT License](LICENSE) — gratis untuk digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  <br/>
  <img src="public/img/robot-cat.png" width="80" alt="WangkuAI" />
  <br/><br/>
  <strong>WangkuAI v2.0</strong> — <em>Kelola Keuangan Pribadimu, Semudah Chat</em>
  <br/><br/>
  <img src="https://img.shields.io/badge/Made%20with-☕%20Kopi-brown?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-purple?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge" />
</div>
