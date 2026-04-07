# 🧪 WangkuAI v2.0 — Testing Prompts Sheet

Kumpulan prompt untuk menguji semua **19 intent** — variasi berbeda dari contoh README.
Cukup copy-paste ke chat WangkuAI dan verifikasi responsnya.

---

## ✅ CORE INTENTS (12)

---

### 💸 1. `transaction` — Catat Pengeluaran

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| T1 | `keluar 45ribu buat nasi padang` | 1 expense: nasi padang Rp 45.000 |
| T2 | `abis 8rb parkir motor sama 12rb cilok` | 2 expense: parkir Rp 8.000 + cilok Rp 12.000 |
| T3 | `2 porsi mie ayam @18000` | 1 expense: 2×18.000 = Rp 36.000 |
| T4 | `jajan donat 3 biji 7500an` | expense: 3 × Rp 7.500 = Rp 22.500 |
| T5 | `bayar kos bulan ini 500rb` | expense: kos Rp 500.000 |
| T6 | `beli token listrik 50k, sabun 12k, shampo 25k` | 3 expense: Rp 87.000 total |
| T7 | `ngisi bensin 30ribu terus mampir beli es jeruk 8rb` | 2 expense: bensin + minuman |

---

### 💰 2. `income` — Catat Pemasukan

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| I1 | `masuk uang 750rb dari freelance desain` | income: Rp 750.000 |
| I2 | `tadi dikasih ortu 200k` | income: Rp 200.000 |
| I3 | `THR cair 2.5 juta` | income: Rp 2.500.000 |
| I4 | `jualan online laku 180rb` | income: Rp 180.000 |
| I5 | `komisi affiliate masuk 95 ribu` | income: Rp 95.000 |

---

### 🔀 3. Mixed — Pemasukan + Pengeluaran Sekaligus

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| M1 | `dapat cashback shopeepay 15rb tapi tadi juga beli snack 20rb` | income 15k + expense 20k |
| M2 | `nerima transferan 300rb dari temen, tapi langsung bayar iuran 50rb` | income + expense |
| M3 | `bonus 100rb sama jajan siomay 12rb` | income + expense |

---

### 💳 4. `check_balance` — Cek Saldo

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| B1 | `duit gue tinggal berapa?` | Tampilkan saldo |
| B2 | `cek kantong dong` | Tampilkan saldo |
| B3 | `masih ada sisa gak?` | Tampilkan saldo |
| B4 | `uangku sekarang berapa ya?` | Tampilkan saldo |

---

### 📆 5. `check_month` — Rekap Bulan Ini

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| CM1 | `total pengeluaranku bulan ini berapa sih?` | Rekap bulan ini |
| CM2 | `udah habis berapa bulan ini?` | Rekap bulan ini |
| CM3 | `summary keuangan bulan ini dong` | Rekap bulan ini |
| CM4 | `bulan ini surplus atau defisit?` | Rekap + net surplus/defisit |

---

### 📅 6. `check_today` — Pengeluaran Hari Ini

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| TD1 | `hari ini keluar berapa?` | Rekap hari ini |
| TD2 | `tadi udah jajan apa aja?` | Daftar transaksi hari ini |
| TD3 | `pengeluaran gue dari pagi gimana?` | Rekap hari ini |

---

### 🗓️ 7. `check_date` — Tanggal Spesifik

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| D1 | `kemarin habis berapa?` | Laporan kemarin |
| D2 | `transaksi tanggal 28 maret` | Laporan tgl 28 Maret |
| D3 | `pengeluaran di 25/3` | Laporan 25 Maret |

---

### 📊 8. `check_range` — Rentang Tanggal

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| R1 | `dari tanggal 20 sampai 25 maret pengeluaranku berapa?` | Laporan 20–25 Maret |
| R2 | `antara 1 sampai 15 bulan ini keluar berapa?` | Laporan 1–15 bulan ini |

---

### 📋 9. `check_history` — Riwayat Transaksi

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| H1 | `tampilkan transaksi terakhirku` | 10 transaksi terakhir |
| H2 | `tadi udah catat apa aja sih?` | Riwayat terakhir |
| H3 | `lupa tadi beli apa aja, lihat list dong` | Riwayat terakhir |

---

### 🎯 10. `set_limit` — Set Budget Harian

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| SL1 | `limit pengeluaran harianku 80 ribu ya` | Budget harian Rp 80.000 diset |
| SL2 | `batasin jajan gue 50rb per hari` | Budget harian Rp 50.000 diset |
| SL3 | `pasang budget harian 120k dong` | Budget harian Rp 120.000 diset |

---

### ⚙️ 11. `set_balance` — Set Saldo Awal

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| SB1 | `dompetku sekarang ada 850 ribu` | Saldo diset Rp 850.000 |
| SB2 | `atur saldo awal 2 juta` | Saldo diset Rp 2.000.000 |
| SB3 | `saldo mulai dari 350rb` | Saldo diset Rp 350.000 |

---

### 🗑️ 12. `clear_today` — Hapus Catatan Hari Ini

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| C1 | `hapus semua catatan hari ini` | Transaksi hari ini dihapus |
| C2 | `reset data transaksi hari ini` | Transaksi hari ini dihapus |
| C3 | `bersihkan catatan today dong` | Transaksi hari ini dihapus |

---

---

## 🧠 NEW v2.0 INTENTS (7)

---

### 📊 13. `insight_category_spending` — Insight Kategori

> **Goal:** Verifikasi aggregasi kategori, ranking, progress bar, dan advice

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| IS1 | `gue paling sering belanja apa sih?` | Ranking kategori bulan ini |
| IS2 | `kategori mana yang paling nguras kantong bulan ini?` | Kategori terbesar bulan ini |
| IS3 | `minggu ini gue abis di mana aja?` | Ranking kategori minggu ini |
| IS4 | `pengeluaran terbesar gue di bidang apa?` | Top kategori |
| IS5 | `sebulan ini paling boros di sektor mana?` | Aggregasi bulanan |
| IS6 | `distribusi pengeluaranku gimana?` | Semua kategori + persentase |

**Checklist verifikasi:**
- [ ] Ada progress bar `████░░` untuk tiap kategori
- [ ] Ada persentase kontribusi `(45%)`
- [ ] Ada ⚠️ insight tentang kategori teratas
- [ ] Ada 💡 saran yang relevan dengan kategori dominan
- [ ] Ada 💬 follow-up suggestion

---

### 🧠 14. `financial_health_check` — Cek Kesehatan Keuangan

> **Goal:** Verifikasi persona classification + saving rate + burn rate

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| FH1 | `gimana kondisi keuanganku sekarang?` | Health check + persona |
| FH2 | `gue termasuk orang yang hemat gak?` | Persona + saving rate |
| FH3 | `evaluasi kebiasaan belanjaku dong` | Full health report |
| FH4 | `kebiasaan finansialku gimana menurut kamu?` | Persona + traits |
| FH5 | `apakah gue financial healthy?` | Saving rate + status |

**Checklist verifikasi:**
- [ ] Ada nama persona (Smart Saver / Balanced / Impulsive / Heavy Spender)
- [ ] Ada Saving Rate dalam %
- [ ] Ada Burn Rate per hari
- [ ] Ada bullet point ciri-ciri
- [ ] Ada 💡 saran yang spesifik per persona

---

### 🔮 15. `spending_prediction` — Prediksi Keuangan

> **Goal:** Verifikasi burn rate calculation + days-to-empty + proyeksi

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| SP1 | `dengan pola kayak gini, duitku cukup gak sampai akhir bulan?` | Prediksi hari habis |
| SP2 | `estimasi berapa hari lagi saldo gue abis?` | Days-to-empty |
| SP3 | `proyeksikan kondisi dompetku akhir bulan ini` | End-of-month projection |
| SP4 | `kira-kira bulan ini bisa selamat gak keuanganku?` | Prediksi + advice |
| SP5 | `dengan burn rate sekarang, berapa lama tabungan gue tahan?` | Burn rate + projection |

**Checklist verifikasi:**
- [ ] Ada angka Burn Rate harian
- [ ] Ada estimasi hari saldo habis
- [ ] Ada proyeksi akhir bulan (jika ada data income)
- [ ] Ada saran kurangi pengeluaran 20%

---

### 📊 16. `comparison_period` — Perbandingan Periode

> **Goal:** Verifikasi diff calculation + penyebab kenaikan

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| CP1 | `aku lebih hemat minggu ini atau minggu kemarin?` | Perbandingan mingguan |
| CP2 | `bulan ini pengeluaranku naik atau turun dari sebelumnya?` | Perbandingan bulanan |
| CP3 | `bedanya berapa sih bulan ini sama bulan lalu?` | Delta nominal + persentase |
| CP4 | `trend belanjaku naik apa turun?` | Comparison + tren |
| CP5 | `pengeluaran minggu ini lebih parah dari minggu lalu gak?` | Mingguan + penyebab |

**Checklist verifikasi:**
- [ ] Ada nominal minggu/bulan ini vs lalu
- [ ] Ada persentase naik/turun
- [ ] Ada emoji ⬆️ atau ⬇️
- [ ] Ada 📌 penyebab terbesar kenaikan (jika naik)

---

### 🎯 17. `set_goal` — Set Target Tabungan

> **Goal:** Verifikasi goal tersimpan ke DB + kalkulasi target/hari

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| SG1 | `target nabung bulan ini 500 ribu` | Goal Rp 500.000 diset |
| SG2 | `mau saving 2 juta bulan ini` | Goal Rp 2.000.000 diset |
| SG3 | `saya ingin sisihkan 750rb bulan ini` | Goal Rp 750.000 diset |
| SG4 | `set tujuan tabungan 1.5 juta` | Goal Rp 1.500.000 diset |

**Checklist verifikasi:**
- [ ] Konfirmasi nominal goal yang diinput
- [ ] Ada sisa hari dalam bulan ini
- [ ] Ada target nabung per hari
- [ ] Ada 💬 follow-up "ketik 'progress tabungan'"

---

### 📈 18. `goal_tracking` — Cek Progress Tabungan

> **Goal:** Verifikasi progress bar + kekurangan + target harian
> *(Jalankan dulu `set_goal` sebelum test ini)*

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| GT1 | `udah berapa yang gue kumpulin bulan ini?` | Progress tabungan |
| GT2 | `nabungku udah sampai mana?` | Progress bar + persentase |
| GT3 | `target tabunganku bulan ini tercapai gak?` | Progress + status |
| GT4 | `masih kurang berapa lagi buat capai target?` | Kekurangan + target/hari |
| GT5 | `cek saving goal gue dong` | Full goal progress |

**Checklist verifikasi:**
- [ ] Ada target & terkumpul
- [ ] Ada progress bar visual `████░░`
- [ ] Ada sisa hari
- [ ] Ada kekurangan + target per hari (jika belum tercapai)
- [ ] Ada 🎉 jika sudah tercapai

---

### 💡 19. `recommendation_engine` — Rekomendasi Keuangan

> **Goal:** Verifikasi analisa distribusi + rekomendasi personal

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| RE1 | `tolong analisa pola belanjaku` | Distribusi + analisis + rekomendasi |
| RE2 | `gimana cara gue bisa lebih hemat?` | Rekomendasi personal |
| RE3 | `apa yang harus gue ubah dari kebiasaan finansial gue?` | Insight + saran |
| RE4 | `bantu gue optimalkan pengeluaran bulan ini` | Recommendation engine |
| RE5 | `advice dong soal keuanganku` | Personal advice berbasis data |
| RE6 | `review kebiasaan belanjaku dan kasih masukan` | Full recommendation |

**Checklist verifikasi:**
- [ ] Ada distribusi kategori dalam %
- [ ] Ada analisis saving rate + burn rate
- [ ] Ada minimal 3 rekomendasi personal
- [ ] Rekomendasi relevan dengan kategori dominan user

---

### 🚨 20. `anomaly_detection` — Deteksi Lonjakan

> **Goal:** Verifikasi baseline vs today comparison + identifikasi penyebab

| # | Prompt | Yang Diharapkan |
|---|--------|-----------------|
| AD1 | `hari ini pengeluaranku normal gak?` | Cek anomali hari ini |
| AD2 | `kayaknya aku boros banget hari ini deh, bener gak?` | Anomaly check |
| AD3 | `pengeluaran hari ini wajar gak dibanding biasanya?` | Baseline vs today |
| AD4 | `ada lonjakan pengeluaran gak hari ini?` | Anomaly detection |
| AD5 | `hari ini lebih banyak keluar dari biasanya gak?` | Comparison + spike % |

**Checklist verifikasi:**
- [ ] Ada angka hari ini vs baseline
- [ ] Ada % spike (jika ada)
- [ ] Ada 🚨 jika spike >= 150%
- [ ] Ada info "belum ada data historis" jika baseline = 0
- [ ] Ada identifikasi kategori penyebab (jika anomali)

---

---

## 🔁 EDGE CASES & KOMBINASI

> Test lebih tricky — verifikasi intent detection-nya tepat

| # | Prompt | Intent Diharapkan |
|---|--------|-------------------|
| E1 | `gue udah nabung berapa ya bulan ini?` | `goal_tracking` |
| E2 | `bisa gak kalau nabung 500rb dari sekarang?` | `spending_prediction` |
| E3 | `pengeluaran makan gue kemahalan gak?` | `recommendation_engine` |
| E4 | `minggu kemarin vs sekarang mana lebih parah?` | `comparison_period` |
| E5 | `apa yang bikin pengeluaran gue naik bulan ini?` | `insight_category_spending` |
| E6 | `gue tipe orang yang suka nyimpen duit gak?` | `financial_health_check` |
| E7 | `duitku bisa tahan sampai tanggal 30 gak?` | `spending_prediction` |
| E8 | `kasih tau gue progress goal sama rekomendasi sekalian` | `recommendation_engine` |

---

## ⚡ SKENARIO: AUTO-ANOMALY TRIGGER

Untuk trigger **anomaly auto-detection** setelah catat transaksi besar:

```
Step 1 — Catat transaksi besar:
  "beli hp baru 3.5 juta"

  Cek: pastikan di response ada blok
  🚨 Pengeluaran Tidak Biasa!
  (muncul jika hari ini >= 2.5x rata-rata 14 hari terakhir)

Step 2 — Verifikasi follow-up suggestion:
  Pastikan di akhir response ada:
  "💬 Mau aku bantu set limit pengeluaran harian?"
```

---

## 🔄 SKENARIO: FULL USER JOURNEY (urut dari nol)

Jalankan prompt ini secara berurutan untuk simulasi sesi lengkap:

```
1.  "set saldo 1.5 juta"
    → Hasil: set_balance ✓

2.  "aku mau nabung 500rb bulan ini"
    → Hasil: set_goal, target/hari dihitung ✓

3.  "beli nasi goreng 20rb"
    → Hasil: transaction, saldo berkurang ✓

4.  "beli kopi 15rb, vitamin 35rb, pulsa 25rb"
    → Hasil: transaction multi-item, 3 transaksi ✓

5.  "dapat transferan 200rb dari teman"
    → Hasil: income, saldo bertambah ✓

6.  "beli gamis online 250rb"
    → Hasil: transaction fashion, auto anomaly jika spike ✓

7.  "minggu ini gue boros di mana?"
    → Hasil: insight_category_spending, ranking + bar ✓

8.  "keuanganku sehat gak?"
    → Hasil: financial_health_check, persona + saving rate ✓

9.  "progress nabungku gimana?"
    → Hasil: goal_tracking, progress bar ✓

10. "bakal habis kapan kalau gini terus?"
    → Hasil: spending_prediction, days-to-empty ✓

11. "bulan ini lebih boros dari bulan lalu gak?"
    → Hasil: comparison_period, delta + penyebab ✓

12. "gimana cara aku lebih hemat?"
    → Hasil: recommendation_engine, 3+ rekomendasi ✓

13. "hari ini pengeluaran gue normal gak?"
    → Hasil: anomaly_detection, baseline vs today ✓
```

---

## 📊 RESULT SCORECARD

Isi setelah testing selesai:

| Intent | Berhasil | Total | Akurasi |
|--------|----------|-------|---------|
| transaction | `/7` | 7 | `%` |
| income | `/5` | 5 | `%` |
| mixed | `/3` | 3 | `%` |
| check_balance | `/4` | 4 | `%` |
| check_month | `/4` | 4 | `%` |
| check_today | `/3` | 3 | `%` |
| check_date | `/3` | 3 | `%` |
| check_range | `/2` | 2 | `%` |
| check_history | `/3` | 3 | `%` |
| set_limit | `/3` | 3 | `%` |
| set_balance | `/3` | 3 | `%` |
| clear_today | `/3` | 3 | `%` |
| insight_category | `/6` | 6 | `%` |
| financial_health | `/5` | 5 | `%` |
| spending_prediction | `/5` | 5 | `%` |
| comparison_period | `/5` | 5 | `%` |
| set_goal | `/4` | 4 | `%` |
| goal_tracking | `/5` | 5 | `%` |
| recommendation | `/6` | 6 | `%` |
| anomaly_detection | `/5` | 5 | `%` |
| edge_cases | `/8` | 8 | `%` |
| **TOTAL** | **/93** | **93** | **%** |
