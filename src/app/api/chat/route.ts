/**
 * ══════════════════════════════════════════════════════════════
 *  /api/chat/route.ts  —  WangkuAI Chat Handler
 *
 *  ✅ TANPA GEMINI. Semua 12 intent menggunakan template.
 *
 *  Alur:
 *  User Ketik → nlp.ts (HF Zero-Shot + Rule Extractor)
 *             → Switch-Case → DB Action → Template Response
 * ══════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { auth }         from '@/lib/auth';
import { format }       from 'date-fns';
import { id }           from 'date-fns/locale';
import {
  getBalance, setBalance, addBalance, subtractBalance,
  insertTransaction,
  getTodayTransactions, getThisMonthTransactions,
  getRecentTransactions, getDateTransactions, getDateRangeTransactions,
  saveChatMessage, getChatHistory,
  getBudgetLimit, getTodayExpense, setBudgetLimit,
  clearTodayTransactions,
} from '@/lib/queries';
import { detectIntent, extractMultipleExpenses } from '@/lib/nlp';

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════

/** Rp 50.000 */
const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

/** 17 Mar 2026 */
const tgl = (d: Date | string) => format(new Date(d), 'dd MMM yyyy', { locale: id });

const SEP = '──────────────────────';

const EMOJI: Record<string, string> = {
  expense:       '💸',
  income:        '💰',
  set_balance:   '⚙️',
  check_balance: '💳',
  check_today:   '📅',
  check_month:   '📆',
  check_date:    '🗓️',
  check_range:   '📊',
  check_history: '📋',
  set_limit:     '🎯',
  clear_today:   '🗑️',
  knowledge:     '💡',
};

// ════════════════════════════════════════════════════════════════
//  INTENT 12: KNOWLEDGE — Template Tips Keuangan (tanpa AI)
//  Sistem memilih tips yang paling relevan berdasarkan keyword
// ════════════════════════════════════════════════════════════════
function buildKnowledgeReply(msg: string, balance: number): string {
  const t = msg.toLowerCase();

  const tips: { keywords: string[]; reply: string }[] = [
    {
      keywords: ['nabung', 'menabung', 'tabungan', 'simpan'],
      reply: `💡 Tips Menabung\n${SEP}\n✅ Gunakan metode **50/30/20**:\n  • 50% untuk kebutuhan pokok\n  • 30% untuk keinginan\n  • 20% wajib ditabung\n\n📌 Sisihkan tabungan di awal gajian, bukan dari sisa!`,
    },
    {
      keywords: ['gaji', 'atur gaji', 'alokasi gaji', 'manage gaji'],
      reply: `💡 Cara Atur Gaji\n${SEP}\n📌 Alokasi Ideal:\n  • 30–40% → Kebutuhan wajib (makan, kost, transport)\n  • 20–30% → Cicilan (maks 30% gaji)\n  • 10–20% → Tabungan & investasi\n  • 10% → Hiburan & pribadi\n\nSaldo kamu saat ini: ${rp(balance)}`,
    },
    {
      keywords: ['investasi', 'invest', 'saham', 'reksa dana', 'reksadana', 'duit', 'modal'],
      reply: `💡 Tips Mulai Investasi\n${SEP}\n📈 Urutan investasi pemula:\n  1. Dana darurat dulu (3–6× pengeluaran/bulan)\n  2. Reksa Dana Pasar Uang (aman, cair)\n  3. Reksa Dana Campuran / Saham\n  4. ETF / Saham langsung\n\n⚠️ Jangan investasi uang darurat!`,
    },
    {
      keywords: ['hemat', 'irit', 'frugal', 'kurangi pengeluaran'],
      reply: `💡 Tips Hidup Hemat\n${SEP}\n✂️ Cara efektif hemat:\n  • Bawa bekal makan siang\n  • Batalkan langganan yang jarang dipakai\n  • Bandingkan harga sebelum beli\n  • Terapkan aturan 24 jam (tunda pembelian impulsif)\n  • Masak sendiri hemat hingga 60%!`,
    },
    {
      keywords: ['hutang', 'cicilan', 'kredit', 'pinjaman', 'bayar hutang'],
      reply: `💡 Strategi Lunasi Hutang\n${SEP}\n💊 Dua metode populer:\n  1. **Avalanche** → Lunasi hutang bunga tertinggi dulu (hemat biaya)\n  2. **Snowball** → Lunasi hutang terkecil dulu (motivasi)\n\n📌 Pastikan cicilan tidak melebihi 30% penghasilan bulanan!`,
    },
    {
      keywords: ['darurat', 'dana darurat', 'emergency fund'],
      reply: `💡 Dana Darurat\n${SEP}\n🆘 Berapa yang ideal?\n  • Single / karyawan → 3-6× pengeluaran/bulan\n  • Menikah / punya tanggungan → 6-12× pengeluaran\n\n📌 Simpan di rekening terpisah, jangan disentuh kecuali darurat sejati!`,
    },
    {
      keywords: ['boros', 'konsumtif', 'impulsif', 'fomo', 'belanja terus'],
      reply: `💡 Kendalikan Pengeluaran Impulsif\n${SEP}\n🧠 Trik psikologi keuangan:\n  • Terapkan aturan 24 jam sebelum beli\n  • Hapus aplikasi belanja dari halaman utama HP\n  • Bayar dengan uang tunai bukan kartu (lebih terasa)\n  • Catat setiap pengeluaran (sudah kamu lakukan di sini!) ✅`,
    },
    {
      keywords: ['mahasiswa', 'student', 'uang kuliah', 'kost', 'kosan', 'anak kos'],
      reply: `💡 Tips Keuangan Anak Kos / Mahasiswa\n${SEP}\n🎓 Strategi cerdas:\n  • Buat anggaran mingguan, bukan bulanan\n  • Masak sendiri 3-4x seminggu\n  • Manfaatkan diskon pelajar\n  • Cari side income: freelance, jual barang, dll\n  • Catat pengeluaran harian (kamu sudah di track yang benar!) ✅`,
    },
    {
      keywords: ['freelance', 'wiraswasta', 'usaha', 'bisnis', 'penghasilan tidak tetap'],
      reply: `💡 Tips Keuangan Freelancer / Wirausaha\n${SEP}\n💼 Kelola penghasilan tidak tetap:\n  • Buat "gaji" tetap buat dirimu sendiri setiap bulan\n  • Sisihkan 20-30% untuk pajak & bisnis\n  • Pisahkan rekening pribadi & bisnis\n  • Buat dana darurat 6-12 bulan`,
    },
    {
      keywords: ['apa', 'cara', 'gimana', 'bagaimana', 'mino', 'bantu', 'help', 'halo', 'hi ', 'fitur'],
      reply: `💡 Aku MinoAI — Asisten Keuangan Pribadimu!\n${SEP}\nAku bisa bantu kamu:\n  💸 Catat pengeluaran → "Beli makan 25rb"\n  💰 Catat pemasukan → "Dapat gaji 3 juta"\n  📅 Cek hari ini → "Pengeluaran hari ini"\n  📆 Rekap bulanan → "Rekap bulan ini"\n  🎯 Set budget → "Set limit 100rb sehari"\n  💳 Cek saldo → "Berapa saldo aku?"\n  📋 Lihat riwayat → "Riwayat transaksi"\n\nSaldo kamu saat ini: ${rp(balance)} 💙`,
    },
  ];

  // Cari tips yang cocok berdasarkan keyword
  for (const tip of tips) {
    if (tip.keywords.some(kw => t.includes(kw))) {
      return tip.reply;
    }
  }

  // Default fallback — panduan cara pakai
  return `💡 Tips Keuangan Hari Ini\n${SEP}\n📌 3 Kebiasaan Finansial Cerdas:\n  1. Catat SEMUA pengeluaran (sudah kamu lakukan ✅)\n  2. Buat anggaran sebelum bulan mulai\n  3. Investasikan minimal 10% dari penghasilan\n\nSaldo kamu saat ini: ${rp(balance)}\n\nMau tanya seputar menabung, investasi, atau hutang? Ketik saja! 😊`;
}

// ════════════════════════════════════════════════════════════════
//  PROSESOR UTAMA — Switch-Case 12 Intent
// ════════════════════════════════════════════════════════════════
async function processIntent(
  userId: string,
  userMessage: string,
): Promise<{ reply: string; actionResult: Record<string, unknown> }> {

  const nlp    = await detectIntent(userMessage);
  const intent = nlp.intent || 'knowledge';
  const amount = nlp.amount ?? 0;
  const icon   = EMOJI[intent] ?? '💬';
  const catDB  = nlp.categories.length > 0 ? nlp.categories.join(',') : null;

  let reply        = '';
  let actionResult: Record<string, unknown> = { intent, confidence: +(nlp.confidence ?? 0).toFixed(2) };

  switch (intent) {

    // ──────────────────────────────────────────────────────────────────────
    // 1. EXPENSE — Catat Pengeluaran (mendukung MULTI-ITEM)
    // ──────────────────────────────────────────────────────────────────────
    case 'expense': {
      // ── Cek apakah multi-item ("beli baju 50rb dan makan 60rb") ──
      const multiItems = extractMultipleExpenses(userMessage);

      if (multiItems && multiItems.length >= 2) {
        // ━━ MULTI-ITEM: Catat semua sekaligus ━━
        const cats = nlp.categories;
        const catDB_multi = cats.length > 0 ? cats.join(',') : null;
        let runningBal   = await getBalance(userId);
        let grandTotal   = 0;
        const lines: string[] = [];

        for (let idx = 0; idx < multiItems.length; idx++) {
          const item = multiItems[idx];
          runningBal = await subtractBalance(userId, item.amount);
          await insertTransaction(userId, 'expense', item.amount, item.description, catDB_multi);
          grandTotal += item.amount;
          lines.push(`  ${idx + 1}. ${item.description} — ${rp(item.amount)}`);
        }

        reply = [
          `${icon} ${multiItems.length} Pengeluaran Dicatat Sekaligus!`,
          SEP,
          ...lines,
          SEP,
          `💵 Total     : ${rp(grandTotal)}`,
          `🏦 Sisa Saldo: ${rp(runningBal)}`,
        ].join('\n');

        // Peringatan budget harian
        const limit = await getBudgetLimit(userId, 'daily');
        if (limit > 0) {
          const todaySpent = await getTodayExpense(userId);
          const pct        = Math.round((todaySpent / limit) * 100);
          if (todaySpent > limit) {
            reply += `\n\n⚠️ Budget Harian Terlampaui!\nLimit: ${rp(limit)} | Dipakai: ${rp(todaySpent)} (${pct}%)`;
          } else if (todaySpent >= limit * 0.8) {
            reply += `\n\n🔔 Sudah ${pct}% dari budget harian (${rp(limit)}). Hati-hati!`;
          }
        }

        actionResult = { ...actionResult, success: true, items: multiItems, grand_total: grandTotal, new_balance: runningBal };

      } else {
        // ━━ SINGLE-ITEM (perilaku normal) ━━
        if (amount <= 0) {
          reply = `${icon} Nominalnya belum terdeteksi nih.\n\nCoba tulis lebih jelas, contoh:\n• "Beli makan siang 25rb"\n• "Bayar listrik Rp 150.000"\n• "Jajan 3 bungkus @5000" 🙏`;
          break;
        }

        const desc     = nlp.description || 'Pengeluaran';
        const calcNote = nlp.calculation_note ? `\n   📐 ${nlp.calculation_note}` : '';
        const newBal   = await subtractBalance(userId, amount);
        await insertTransaction(userId, 'expense', amount, desc, catDB);

        reply = [
          `${icon} Pengeluaran Dicatat!`,
          SEP,
          `📌 Item      : ${desc}${calcNote}`,
          `💵 Nominal   : ${rp(amount)}`,
          `🏦 Sisa Saldo: ${rp(newBal)}`,
        ].join('\n');

        // Peringatan budget harian
        const limit = await getBudgetLimit(userId, 'daily');
        if (limit > 0) {
          const todaySpent = await getTodayExpense(userId);
          const pct        = Math.round((todaySpent / limit) * 100);
          if (todaySpent > limit) {
            reply += `\n\n⚠️ Budget Harian Terlampaui!\nLimit: ${rp(limit)} | Dipakai: ${rp(todaySpent)} (${pct}%)\nYuk tahan dulu pengeluarannya! 💙`;
          } else if (todaySpent >= limit * 0.8) {
            reply += `\n\n🔔 Sudah ${pct}% dari budget harian (${rp(limit)}).\nMulai hati-hati ya! 😊`;
          }
        }

        actionResult = { ...actionResult, success: true, amount, new_balance: newBal };
      }
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. INCOME — Catat Pemasukan
    // ──────────────────────────────────────────────────────────────────────
    case 'income': {
      if (amount <= 0) {
        reply = `${icon} Nominalnya belum terdeteksi.\nContoh: "Dapat gaji 3 juta" atau "Terima transfer 500rb" 🙏`;
        break;
      }

      const desc   = nlp.description || 'Pemasukan';
      const newBal = await addBalance(userId, amount);
      await insertTransaction(userId, 'income', amount, desc, catDB);

      reply = [
        `${icon} Pemasukan Dicatat! Alhamdulillah 🎉`,
        SEP,
        `📌 Keterangan : ${desc}`,
        `💵 Jumlah     : ${rp(amount)}`,
        `🏦 Saldo Baru  : ${rp(newBal)}`,
        `\nTerus semangat! 💪`,
      ].join('\n');

      actionResult = { ...actionResult, success: true, amount, new_balance: newBal };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. SET BALANCE — Atur Saldo Awal
    // ──────────────────────────────────────────────────────────────────────
    case 'set_balance': {
      if (amount <= 0) {
        reply = `${icon} Masukkan nominal saldo awalnya.\nContoh: "Set saldo 500 ribu" 🙏`;
        break;
      }

      await setBalance(userId, amount);
      await insertTransaction(userId, 'set_balance', amount, 'Set saldo awal', null);

      reply = [
        `${icon} Saldo Berhasil Diatur!`,
        SEP,
        `🏦 Saldo Baru : ${rp(amount)}`,
        `\nMinoAI siap bantu kelola keuanganmu! 🚀`,
      ].join('\n');

      actionResult = { ...actionResult, success: true, new_balance: amount };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. CHECK BALANCE — Cek Saldo
    // ──────────────────────────────────────────────────────────────────────
    case 'check_balance': {
      const bal    = await getBalance(userId);
      const status =
        bal <= 0         ? '🔴 Saldo habis atau belum diatur. Yuk atur saldo awal!'
        : bal < 50_000   ? '🔴 Saldo hampir habis, hati-hati!'
        : bal < 200_000  ? '🟡 Saldo mulai menipis nih.'
        : '🟢 Saldo aman, tetap bijak ya!';

      reply = [
        `${icon} Saldo Kamu`,
        SEP,
        `💵 Saldo Saat Ini: ${rp(bal)}`,
        status,
      ].join('\n');

      actionResult = { ...actionResult, success: true, current_balance: bal };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. CHECK TODAY — Transaksi Hari Ini
    // ──────────────────────────────────────────────────────────────────────
    case 'check_today': {
      const txs      = await getTodayTransactions(userId);
      const expenses = txs.filter(t => t.type === 'expense');
      const incomes  = txs.filter(t => t.type === 'income');
      const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
      const totalInc = incomes.reduce((s, t)  => s + t.amount, 0);

      reply = [
        `${icon} Transaksi Hari Ini — ${tgl(new Date())}`,
        SEP,
        `💸 Total Keluar  : ${rp(totalExp)}`,
        `💰 Total Masuk   : ${rp(totalInc)}`,
        `📦 Jml Transaksi : ${txs.length}`,
      ].join('\n');

      if (expenses.length > 0) {
        reply += '\n\nDetail Pengeluaran:';
        expenses.forEach((t, i) => {
          reply += `\n  ${i + 1}. ${t.description || t.category || '—'} — ${rp(t.amount)}`;
        });
      } else {
        reply += '\n\n✨ Belum ada pengeluaran hari ini. Semangat hemat!';
      }

      actionResult = { ...actionResult, success: true, total_expense: totalExp, total_income: totalInc };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 6. CHECK MONTH — Rekap Bulanan
    // ──────────────────────────────────────────────────────────────────────
    case 'check_month': {
      const txs     = await getThisMonthTransactions(userId);
      const mExp    = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const mInc    = txs.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
      const selisih = mInc - mExp;
      const bulan   = format(new Date(), 'MMMM yyyy', { locale: id });

      reply = [
        `${icon} Rekap Bulan ${bulan}`,
        SEP,
        `💸 Total Pengeluaran : ${rp(mExp)}`,
        `💰 Total Pemasukan   : ${rp(mInc)}`,
        SEP,
        `${selisih >= 0 ? '✅' : '🔴'} Net (Tabungan)   : ${rp(Math.abs(selisih))} ${selisih >= 0 ? '(Surplus)' : '(Defisit)'}`,
        selisih >= 0
          ? '\n💚 Keuangan bulan ini surplus. Mantap!'
          : '\n❤️ Pengeluaran melebihi pemasukan. Yuk evaluasi!',
      ].join('\n');

      actionResult = { ...actionResult, success: true, total_expense: mExp, total_income: mInc, net: selisih };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 7. CHECK DATE — Pengeluaran Tanggal Tertentu
    // ──────────────────────────────────────────────────────────────────────
    case 'check_date': {
      const target = nlp.date || format(new Date(), 'yyyy-MM-dd');
      const txs    = await getDateTransactions(userId, target);
      const exps   = txs.filter(t => t.type === 'expense');
      const total  = exps.reduce((s, t) => s + t.amount, 0);

      reply = [
        `${icon} Transaksi ${tgl(target)}`,
        SEP,
        `💸 Total Pengeluaran: ${rp(total)}`,
        `📦 Jml Transaksi    : ${exps.length}`,
      ].join('\n');

      if (exps.length > 0) {
        reply += '\n\nDetail:';
        exps.forEach((t, i) => {
          reply += `\n  ${i + 1}. ${t.description || t.category || '—'} — ${rp(t.amount)}`;
        });
      } else {
        reply += '\n\n📭 Tidak ada transaksi pada tanggal ini.';
      }

      actionResult = { ...actionResult, success: true, date: target, total_expense: total };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 8. CHECK RANGE — Pengeluaran Rentang Tanggal
    // ──────────────────────────────────────────────────────────────────────
    case 'check_range': {
      const sDate = nlp.start_date || format(new Date(), 'yyyy-MM-01');
      const eDate = nlp.end_date   || format(new Date(), 'yyyy-MM-dd');
      const txs   = await getDateRangeTransactions(userId, sDate, eDate);
      const exps  = txs.filter(t => t.type === 'expense');
      const total = exps.reduce((s, t) => s + t.amount, 0);
      const avg   = exps.length > 0 ? Math.round(total / exps.length) : 0;

      reply = [
        `${icon} Laporan ${tgl(sDate)} — ${tgl(eDate)}`,
        SEP,
        `💸 Total Pengeluaran     : ${rp(total)}`,
        `📦 Jml Transaksi         : ${exps.length}`,
        `📉 Rata-rata / transaksi : ${rp(avg)}`,
      ].join('\n');

      actionResult = { ...actionResult, success: true, start_date: sDate, end_date: eDate, total_expense: total };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 9. CHECK HISTORY — Riwayat Transaksi Terakhir
    // ──────────────────────────────────────────────────────────────────────
    case 'check_history': {
      const recent = await getRecentTransactions(userId, 10);

      if (recent.length === 0) {
        reply = `${icon} Belum ada riwayat transaksi.\nYuk mulai catat keuanganmu! 📝`;
        break;
      }

      reply = [`${icon} 10 Transaksi Terakhir`, SEP].join('\n');
      recent.forEach((tx, i) => {
        const sign = tx.type === 'income' ? '↑' : '↓';
        const desc = tx.description || tx.category || tx.type;
        const no   = String(i + 1).padStart(2, ' ');
        reply += `\n${no}. ${tgl(tx.date)} | ${sign}${rp(tx.amount)} | ${desc}`;
      });

      actionResult = { ...actionResult, success: true, count: recent.length };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 10. SET LIMIT — Atur Budget Harian
    // ──────────────────────────────────────────────────────────────────────
    case 'set_limit': {
      if (amount <= 0) {
        reply = `${icon} Masukkan nominal limitnya.\nContoh: "Set limit harian 100 ribu" 🙏`;
        break;
      }

      await setBudgetLimit(userId, 'daily', amount);

      reply = [
        `${icon} Budget Harian Diatur!`,
        SEP,
        `🎯 Limit per Hari: ${rp(amount)}`,
        `\nAku akan memperingatkan kamu jika mendekati atau melebihi limit. 🔔`,
      ].join('\n');

      actionResult = { ...actionResult, success: true, daily_limit: amount };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 11. CLEAR TODAY — Hapus Catatan Hari Ini
    // ──────────────────────────────────────────────────────────────────────
    case 'clear_today': {
      const before = (await getTodayTransactions(userId)).length;
      await clearTodayTransactions(userId);

      reply = [
        `${icon} Catatan Hari Ini Dihapus`,
        SEP,
        `🗑️ ${before} transaksi berhasil dihapus.`,
        `🏦 Saldo tidak berubah, tenang saja!`,
        `\nMulai pencatatan baru besok ya! 💪`,
      ].join('\n');

      actionResult = { ...actionResult, success: true, deleted_count: before };
      break;
    }

    // ──────────────────────────────────────────────────────────────────────
    // 12. KNOWLEDGE — Tips & Panduan Keuangan (Rule-Based, tanpa AI)
    // ──────────────────────────────────────────────────────────────────────
    case 'knowledge':
    default: {
      const bal = await getBalance(userId);
      reply     = buildKnowledgeReply(userMessage, bal);
      actionResult = { ...actionResult, success: true };
      break;
    }
  }

  return { reply, actionResult };
}

// ════════════════════════════════════════════════════════════════
//  POST /api/chat
// ════════════════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const body        = await req.json();
    const userMessage = (body.message ?? '').trim() as string;

    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    await saveChatMessage(userId, 'user', userMessage);

    const { reply, actionResult } = await processIntent(userId, userMessage);

    await saveChatMessage(userId, 'assistant', reply);

    const finalBalance = await getBalance(userId);

    return NextResponse.json({
      success:       true,
      response:      reply,
      action_result: actionResult,
      balance:       finalBalance,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/chat]', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════════
//  GET /api/chat — Riwayat Chat
// ════════════════════════════════════════════════════════════════
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const chats  = await getChatHistory(userId, 50);
    return NextResponse.json({ success: true, chats });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
