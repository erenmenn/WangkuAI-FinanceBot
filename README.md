<div align="center">
  <img src="public/img/robot-cat.png" width="130" alt="WangkuAI Mascot" />

  <h1>🐱 WangkuAI</h1>
  <h3>Asisten Pribadi untuk Pengelolaan Keuangan</h3>
  <p><i>Cukup ketik seperti chat ke teman — WangkuAI yang urus sisanya.</i></p>

  <br/>

  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&logo=statuspage" />
  <img src="https://img.shields.io/badge/Platform-Web%20App-blue?style=for-the-badge&logo=googlechrome" />
  <img src="https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NLP-IndoBERT-FF9D00?style=for-the-badge&logo=huggingface" />
  <img src="https://img.shields.io/badge/Multi--User-✅-success?style=for-the-badge" />

  <br/><br/>

  <a href="#-apa-itu-wangkuai">💬 Tentang</a> &nbsp;•&nbsp;
  <a href="#-lihat-sendiri-cara-kerjanya">🎬 Demo</a> &nbsp;•&nbsp;
  <a href="#-cara-kerja-di-balik-layar">⚙️ Cara Kerja</a> &nbsp;•&nbsp;
  <a href="#-fitur-lengkap">✨ Fitur</a> &nbsp;•&nbsp;
  <a href="#-wangkuai-vs-aplikasi-keuangan-lain">🆚 Perbandingan</a> &nbsp;•&nbsp;
  <a href="#️-arsitektur">🏗️ Arsitektur</a>

</div>

---

## 💬 Apa itu WangkuAI?

**WangkuAI** adalah asisten keuangan pribadi berbasis percakapan yang memungkinkan siapa pun **mencatat dan memantau keuangan harian hanya dengan mengetik kalimat biasa** — seperti chat ke teman, tanpa form, tanpa pilih kategori, tanpa drama.

### Masalah yang diselesaikan

Banyak orang *niat* mencatat keuangan, tapi cepat menyerah karena prosesnya melelahkan:

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
Wangku:  ☕ Pengeluaran Dicatat!
          📌 Item      : kopi
          💵 Nominal   : Rp 15.000
          🏦 Sisa Saldo: Rp 985.000
```

### Harga satuan? Bisa.

```
Kamu  :  3 gelas kopi @12000
Wangku:  ☕ Pengeluaran Dicatat!
          📌 Item      : 3 gelas kopi
          📐 3 × Rp12.000 = Rp36.000
          💵 Nominal   : Rp 36.000
          🏦 Sisa Saldo: Rp 964.000
```

### Banyak item sekaligus — 1 pesan, semua tercatat

```
Kamu  :  beli baju 80rb dan makan siang 25rb dan kopi 15rb
Wangku:  💸 3 Pengeluaran Dicatat Sekaligus!
         ──────────────────────
          1. baju        — Rp 80.000   👗 fashion
          2. makan siang — Rp 25.000   🍜 makanan
          3. kopi        — Rp 15.000   ☕ minuman
         ──────────────────────
          💵 Total      : Rp 120.000
          🏦 Sisa Saldo : Rp 880.000
```

### Laporan kapan saja, dalam bahasa biasa

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

---

## ⚙️ Cara Kerja di Balik Layar

Satu pesan darimu melewati proses ini dalam hitungan milidetik:

```
 Kamu ketik:  "beli sepatu 350rb dan makan siang 25rb"
      │
      ▼
 ┌──────────────────────────────────────────────────────┐
 │                  🧠 NLP PIPELINE                     │
 │                                                      │
 │  [1] HuggingFace IndoBERT (Zero-Shot NLI)           │
 │      → Deteksi intent: "expense"  (conf: 0.91)      │
 │        Model AI berbasis bahasa Indonesia            │
 │        Jika offline → otomatis fallback ke [2]       │
 │                                                      │
 │  [2] Rule-Based Regex (Fallback)                     │
 │      → Pola linguistik bahasa Indonesia              │
 │        Selalu tersedia, tanpa butuh internet         │
 │                                                      │
 │  [3] Extractor — selalu aktif, paralel               │
 │      → Amount : "350rb" → 350.000                   │
 │                 "25rb"  → 25.000                    │
 │      → Kategori: 👗 fashion (sepatu)                 │
 │                  🍜 makanan (makan siang)            │
 └───────────────────────┬──────────────────────────────┘
                         │
                         ▼
 ┌──────────────────────────────────────────────────────┐
 │                  📦 INTENT ROUTER                    │
 │                                                      │
 │  case "expense" (multi-item):                        │
 │  ✦ Kurangi saldo Rp 375.000                         │
 │  ✦ Simpan 2 transaksi ke database                   │
 │  ✦ Cek apakah sudah mendekati budget limit          │
 │  ✦ Susun teks balasan yang informatif               │
 └───────────────────────┬──────────────────────────────┘
                         │
                         ▼
 Balasan:
 "💸 2 Pengeluaran Dicatat Sekaligus!
   1. sepatu      — Rp 350.000 👗
   2. makan siang — Rp  25.000 🍜
   💵 Total: Rp 375.000  |  🏦 Sisa: Rp 1.425.000"
```

---

## ✨ Fitur Lengkap

<table>
<tr><th colspan="2">💬 Pencatatan Cerdas via Chat</th></tr>
<tr><td>📝 Catat 1 item pengeluaran</td><td><code>beli kopi 15rb</code></td></tr>
<tr><td>📝 Catat banyak item sekaligus</td><td><code>beli baju 80rb dan makan 25rb dan kopi 15rb</code></td></tr>
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

<tr><th colspan="2">📈 Dashboard Visual Lengkap</th></tr>
<tr><td>📊 Chart batang 7 hari terakhir</td><td>Pemasukan vs Pengeluaran berdampingan</td></tr>
<tr><td>🍩 Donut chart komposisi kategori</td><td>Tahu mana yang paling menguras kantong</td></tr>
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

## 🆚 WangkuAI vs Aplikasi Keuangan Lain

|  | 🐱 **WangkuAI** | 💼 Tabungan / Money Manager | 📱 YNAB / Wallet |
|---|:---:|:---:|:---:|
| Input via chat bahasa natural | ✅ | ❌ | ❌ |
| Kategori terdeteksi otomatis | ✅ | ❌ Manual | ❌ Manual |
| Multi-item dalam 1 pesan | ✅ | ❌ | ❌ |
| Hitung `3x@12000` otomatis | ✅ | ❌ | ❌ |
| Deteksi tanggal dari teks | ✅ | ❌ | ❌ |
| Bahasa Indonesia penuh | ✅ | 🔶 Sebagian | ❌ |
| Tips keuangan kontekstual | ✅ | ❌ | ❌ |
| Budget alert real-time di chat | ✅ | 🔶 Premium | 🔶 Premium |
| Dashboard + export CSV gratis | ✅ | 🔶 Berbayar | 🔶 Berbayar |
| Multi-user cloud | ✅ | 🔶 Berbayar | 🔶 Berbayar |
| Open source & self-hostable | ✅ | ❌ | ❌ |

> **Intinya:** WangkuAI adalah satu-satunya yang memahami `"beli baju 80rb dan makan 25rb dan kopi 15rb"` sebagai **3 transaksi berbeda, setiap kategori terdeteksi otomatis**, dalam hitungan detik. Nol form. Nol klik. Nol ribet.

---

## 🏗️ Arsitektur

```
 Browser (Next.js UI)
        │  HTTP/JSON
        ▼
 ┌──────────────────────────────────────┐
 │         Next.js API Routes           │
 │                                      │
 │  /api/chat      ← otak chatbot       │
 │  /api/stats/*   ← data dashboard     │
 │  /api/balance   ← manajemen saldo    │
 │  /api/budget    ← limit harian       │
 │  /api/auth/*    ← NextAuth login     │
 └──────────┬───────────────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
 ┌─────────┐   ┌────────────────────┐
 │  NLP    │   │    Prisma ORM      │
 │ Engine  │   │                    │
 │         │   │  User              │
 │ HF API  │   │  Balance           │
 │ (BERT)  │   │  Transaction       │
 │    +    │   │  BudgetLimit       │
 │ Regex   │   │  ChatHistory       │
 │    +    │   │                    │
 │ Extract │   │  SQLite / Postgres │
 └─────────┘   └────────────────────┘
```

| Layer | Yang Dipakai |
|---|---|
| Framework | Next.js 16, TypeScript |
| Auth | NextAuth.js (JWT session) |
| Database | SQLite (dev) · PostgreSQL (prod) |
| ORM | Prisma |
| NLP Utama | HuggingFace IndoBERT (Zero-Shot NLI) |
| NLP Fallback | Custom regex rule engine (selalu aktif) |
| UI | Vanilla CSS · Pixelify Sans · Press Start 2P |

---

## 🎯 25+ Kategori Terdeteksi Otomatis

| Emoji | Kategori | Contoh Kata Kunci |
|---|---|---|
| 🍜 | Makanan | nasi, ayam, bakso, makan siang, soto |
| ☕ | Minuman | kopi, teh, boba, jus, es teh |
| 🚗 | Transport | grab, ojek, gojek, parkir, kereta |
| ⛽ | BBM | bensin, pertamax, pertalite, isi motor |
| 🛒 | Belanja | shopee, tokopedia, indomaret, alfamart |
| 👗 | Fashion | baju, sepatu, jaket, celana, tas |
| 🎓 | Kuliah | SPP, UKT, uang kuliah, kampus |
| ✏️ | Keperluan Kuliah | print, fotocopy, flashdisk, lab |
| 🔧 | Alat / Perkakas | palu, obeng, paku, kunci pas |
| 💻 | Elektronik | headset, charger, laptop, powerbank |
| 🎮 | Game | diamond ML, free fire, steam, PUBG |
| 💳 | Top Up | gopay, dana, OVO, shopeepay |
| 📺 | Streaming | netflix, spotify, chatgpt, disney+ |
| 📱 | Pulsa / Data | pulsa, paket data, kuota internet |
| 📶 | Internet | wifi, indihome, myrepublic |
| ⚡ | Listrik | token listrik, PLN, tagihan listrik |
| 🏥 | Kesehatan | obat, apotek, dokter, vitamin |
| 💪 | Gym / Olahraga | gym, fitness, yoga, renang |
| 💅 | Perawatan Diri | salon, parfum, sunscreen, serum |
| 🏠 | Kebutuhan Rumah | deterjen, sabun piring, tisu |
| 🎉 | Hiburan | bioskop, konser, karaoke, bowling |
| 🛵 | Makanan Online | gofood, grabfood, shopee food |
| 📈 | Investasi | saham, reksa dana, emas, crypto |
| 🏦 | Tabungan | nabung, celengan, simpan |
| 📦 | Lainnya | fallback jika tidak ada yang cocok |

> 📊 **Uji internal:** 106 test cases — akurasi deteksi kategori **100%** ✅

---

## 🗺️ Roadmap

**Sudah Ada:**
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

**Akan Datang:**
- [ ] 📸 OCR Struk — foto nota langsung dibaca & dicatat
- [ ] 💼 Buku Utang/Kasbon — catat piutang pelanggan
- [ ] 🛒 Mode Kasir (POS) — untuk UMKM & warung kecil
- [ ] 💰 Dompet ganda — pisahkan uang pribadi vs usaha
- [ ] 🤖 AI Financial Analyst — analisa keuangan via Gemini AI
- [ ] 📄 Export PDF — laporan laba-rugi siap cetak
- [ ] 📈 Prediksi pengeluaran dengan time-series forecasting

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
  <strong>WangkuAI</strong> — <em>Kelola Keuangan Pribadimu, Semudah Chat</em>
  <br/><br/>
  <img src="https://img.shields.io/badge/Made%20with-☕%20Kopi-brown?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Powered%20by-IndoBERT%20NLP-orange?style=for-the-badge&logo=huggingface" />
  <img src="https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge" />
</div>
