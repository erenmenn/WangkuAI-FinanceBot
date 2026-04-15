/**
 * ══════════════════════════════════════════════════════════════
 *  /api/chat/route.ts  —  WangkuAI Chat Handler v2.0
 *
 *  Intent List (19 total):
 *  Core       : transaction, check_balance, check_month, check_today,
 *               check_history, check_date, check_range, set_limit, clear_today
 *  New (v2)   : insight_category_spending, financial_health_check,
 *               spending_prediction, comparison_period, goal_tracking,
 *               recommendation_engine, anomaly_detection, set_goal, knowledge
 * ══════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { auth }         from '@/lib/auth';
import { format, getDaysInMonth } from 'date-fns';
import { id }           from 'date-fns/locale';
import {
  getBalance, setBalance,
  insertTransaction,
  getTodayTransactions, getThisMonthTransactions,
  getRecentTransactions, getDateTransactions, getDateRangeTransactions, clearTodayTransactions,
  saveChatMessage, getChatHistory,
  getBudgetLimit, getTodayExpense, setBudgetLimit,
  // v2 helpers
  getThisWeekTransactions, getLastWeekTransactions,
  getLastMonthTransactions, aggregateByCategory,
  getDailyBurnRate, getSavingGoal, setSavingGoal,
  getBaselineDailyExpense,
} from '@/lib/queries';

// ─── UTILS ──────────────────────────────────────────────────────────
const rp  = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const tgl = (d: Date | string) => format(new Date(d), 'dd MMM yyyy', { locale: id });
const SEP = '──────────────────────';
const pct = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0;

// Category emoji map
const CAT_EMOJI: Record<string, string> = {
  makanan: '🍜', minuman: '☕', transport: '🚗', bbm: '⛽',
  pendidikan: '🎓', keperluan_kuliah: '✏️', fashion: '👗',
  game: '🎮', topup: '💳', streaming: '📺', listrik: '⚡',
  internet: '📶', pulsa: '📱', belanja: '🛒', kesehatan: '🏥',
  hiburan: '🎉', investasi: '📈', tabungan: '🏦', makanan_online: '🛵',
  kesehatan_gym: '💪', kebutuhan_rumah: '🏠', elektronik: '💻',
  perawatan_diri: '💅', alat: '🔧', lainnya: '📦',
};
const catEmoji = (cat: string) => CAT_EMOJI[cat] ?? '📦';

// Spending persona classifier
function classifySpendingPersona(
  txs: { type: string; amount: number; category: string | null }[],
  burnRate: number,
  balance: number
): { persona: string; traits: string[]; advice: string } {
  const expenses = txs.filter(t => t.type === 'expense');
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalInc > 0 ? (totalInc - totalExp) / totalInc : 0;
  const smallTxCount = expenses.filter(t => t.amount < 30000).length;
  const smallRatio = expenses.length > 0 ? smallTxCount / expenses.length : 0;

  if (savingsRate >= 0.3) {
    return {
      persona: 'Smart Saver 🌟',
      traits: ['Konsisten menabung tiap bulan', 'Pengeluaran terkontrol', 'Saldo selalu aman'],
      advice: 'Pertahankan pola ini! Coba mulai investasi reksa dana atau emas untuk pertumbuhan lebih optimal.',
    };
  } else if (savingsRate >= 0.1) {
    return {
      persona: 'Balanced Spender ⚖️',
      traits: ['Pengeluaran seimbang dengan pemasukan', 'Cukup bijak mengelola uang', 'Masih ada sisa tiap bulan'],
      advice: 'Kamu sudah di jalur yang baik! Tingkatkan tabungan sedikit lagi — coba metode 50/30/20.',
    };
  } else if (smallRatio >= 0.5) {
    return {
      persona: 'Impulsive Spender 🛍️',
      traits: ['Banyak transaksi kecil (kopi, snack, jajan)', 'Sering transaksi harian berulang', 'Kebiasaan beli tanpa rencana'],
      advice: 'Gunakan aturan "tunggu 24 jam" sebelum beli. Set limit harian & evaluasi tiap malam.',
    };
  } else {
    return {
      persona: 'Heavy Spender 🔥',
      traits: ['Pengeluaran sering melebihi pemasukan', 'Saldo cenderung menipis', 'Kurang alokasi tabungan'],
      advice: 'Coba metode amplop digital: alokasikan uang saat gajian ke pos-pos pengeluaran, sisanya simpan dulu.',
    };
  }
}

// ─── GEMINI FETCHER ─────────────────────────────────────────────────
async function parseWithGemini(userMessage: string, balance: number, mode: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY tidak ditemukan di .env!');

  const prompt = `
Kamu adalah WangkuAI, asisten keuangan jenius.
Tugasmu adalah membedah pesan user dan mengembalikan 100% RAW JSON tanpa markdown block/teks apapun.

Data Saldo User saat ini: Rp ${balance}

Struktur JSON Wajib:
{
  "intent": "transaction" | "check_balance" | "check_month" | "check_today" | "check_history" | "check_date" | "check_range" | "set_limit" | "set_balance" | "clear_today" | "insight_category_spending" | "financial_health_check" | "spending_prediction" | "comparison_period" | "goal_tracking" | "recommendation_engine" | "anomaly_detection" | "set_goal" | "deposit_saving" | "knowledge",
  "replyText": "Respon singkat bergaya gaul dan penyemangat khas asisten AI (WangkuAI)",
  "transactions": [
    {
      "type": "expense" | "income",
      "amount": <angka bulat murni, misal 1.5 juta = 1500000>,
      "description": "Deskripsi singkat item",
      "category": "Kategori relevan"
    }
  ],
  "goalAmount": <angka bulat jika user menyebut goal tabungan, misal 1000000>,
  "depositAmount": <angka bulat jika user menabung/menyimpan uang, misal 50000>,
  "dateStr": "YYYY-MM-DD jika user menanyakan tanggal spesifik (isikan untuk intent check_date)",
  "startDate": "YYYY-MM-DD (isikan untuk intent check_range)",
  "endDate": "YYYY-MM-DD (isikan untuk intent check_range)",
  "limitAmount": <angka bulat murni, jika user mengatur budget harian. isikan untuk intent set_limit>,
  "balanceAmount": <angka bulat murni, jika user mengatur saldo awal dompet. isikan untuk intent set_balance>,
  "isMixed": boolean
}

ATURAN INTENT (BACA DENGAN TELITI):
- "check_date": user menanyakan pengeluaran TANGGAL SPESIFIK (mis: "pengeluaran 15 maret") -> isikan dateStr format YYYY-MM-DD
- "check_range": user menanyakan rentang TANGGAL EKSPLISIT (mis: "dari 1-10 maret") -> isikan startDate & endDate YYYY-MM-DD. JANGAN pakai intent ini jika user bilang "minggu ini", "bulan ini", atau frasa relatif lainnya!
- "insight_category_spending": user tanya "paling boros di mana", "kategori terbanyak", "paling banyak habis di apa", "pengeluaran minggu ini", "pengeluaran bulan ini" — GUNAKAN INI untuk frasa relatif seperti minggu ini/bulan ini!
- "set_limit": user set budget atau limit pengeluaran -> isikan limitAmount
- "set_balance": user menetapkan saldo dompet -> isikan balanceAmount
- "clear_today": user ingin menghapus/mereset transaksi hari ini
- "financial_health_check": user tanya "keuanganku sehat gak", "aku boros gak", "tipe spender apa aku"
- "spending_prediction": user tanya "bakal habis kapan", "bisa nabung gak bulan ini", "kalau terus kayak gini"
- "comparison_period": user MEMBANDINGKAN dua periode (minggu ini vs lalu, bulan ini vs lalu)
- "goal_tracking": user tanya progress tabungan / goal
- "set_goal": user SET target nabung, misal "aku mau nabung 1 juta bulan ini" — isi goalAmount
- "deposit_saving": user MEMASUKKAN/MENABUNG/MENYIMPAN uang, misal "simpan 50rb untuk tabungan" — isi depositAmount
- "recommendation_engine": user minta "kasih saran keuangan", "rekomendasi", "analisa keuanganku"
- "anomaly_detection": user tanya tentang pengeluaran tidak biasa / lonjakan hari ini
- "knowledge": pertanyaan umum finansial yang tidak termasuk kategori di atas

ATURAN SUPER KETAT:
1. Jika user mencatat banyak transaksi, masukkan SEMUANYA ke dalam array "transactions".
2. Bisa jadi dalam satu kalimat ada pemasukan (income) dan pengeluaran (expense). Pisahkan dengan tepat di "type".
3. Perhatikan singkatan: 5.5 juta = 5500000, 450 ribu = 450000.
4. Jangan balasi menggunakan markdown \`\`\`json. Langsung start dengan { dan end dengan }.

${mode === 'voice' ?
`PENTING (MODE VOICE API):
Karena ini untuk dibacakan oleh suara AI, isi \`replyText\` HARUS HANYA 1 paragraf naratif, sangat ramah/santai, ekspresif, dan asyik.
JANGAN memisahkan dengan baris baru atau bullet point.
SANGAT PENTING: \`replyText\` TIDAK BOLEH mengandung ENTER/NEWLINE sama sekali, dan JANGAN gunakan kutip ganda (") di dalam kalimatnya.
WARNING: Aturan ini HANYA untuk \`replyText\`. Untuk \`transactions\`, \`amount\` HARUS TETAP BERUPA ANGKA BULAT MURNI.`
: ''}

Pesan dari user: "${userMessage}"
  `;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1500; // 1.5s → 3s → 6s (exponential backoff)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    // ✅ Sukses → langsung proses
    if (res.ok) {
      const data = await res.json();
      if (!data.candidates || !data.candidates[0]) throw new Error('Gemini tidak memberikan response valid');
      const rawText = data.candidates[0].content.parts[0].text;
      console.log('Gemini Raw Reply:', rawText);
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      return JSON.parse(cleanJson);
    }

    // ⏳ 503/429 (overload / rate limit) → tunggu lalu coba lagi
    if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`Gemini ${res.status} — percobaan ${attempt}/${MAX_RETRIES}, retry dalam ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    // ❌ Error lain atau sudah habis retry
    const errText = await res.text();
    console.error(`Gemini API Error (attempt ${attempt}/${MAX_RETRIES}):`, errText);
    throw new Error(`Gemini API error ${res.status}`);
  }

  throw new Error('Gemini tidak bisa dihubungi setelah 3 percobaan');
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const body        = await req.json();
    const userMessage = (body.message ?? '').trim() as string;
    const mode        = (body.mode ?? 'text') as string;

    if (!userMessage) return NextResponse.json({ success: false, error: 'Pesan kosong' }, { status: 400 });

    await saveChatMessage(userId, 'user', userMessage);

    const currentBalance = await getBalance(userId);
    let geminiObj: any;
    try {
      geminiObj = await parseWithGemini(userMessage, currentBalance, mode);
    } catch (e) {
      console.error('Gemini Error:', e);
      const errMsg = '⚠️ WangkuAI lagi sibuk banget nih bestie~ Server AI-nya lagi penuh sesak 😅\nCoba ulangi pesanmu dalam beberapa detik ya! 🙏';
      await saveChatMessage(userId, 'assistant', errMsg);
      // Return 200 bukan 500 supaya pesan error tampil di chat, tidak crash
      return NextResponse.json({ success: true, response: errMsg, balance: currentBalance });
    }

    const { intent, transactions, replyText, goalAmount, depositAmount, dateStr, startDate, endDate, limitAmount, balanceAmount } = geminiObj;
    let finalReply    = '';
    let runningBalance = currentBalance;

    // ══════════════════════════════════════════════════════════════════
    // 1. TRANSACTION (catat pemasukan/pengeluaran)
    // ══════════════════════════════════════════════════════════════════
    if ((intent === 'transaction' || (transactions && transactions.length > 0)) && transactions) {
      const lines = [];
      let totalExp = 0, totalInc = 0;

      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        if (t.type === 'expense') { runningBalance -= t.amount; totalExp += t.amount; }
        else                      { runningBalance += t.amount; totalInc += t.amount; }
        await insertTransaction(userId, t.type, t.amount, t.description, t.category);
        const icon = t.type === 'expense' ? '💸' : '💰';
        const sign = t.type === 'expense' ? '-' : '+';
        lines.push(`  ${i + 1}. ${icon} ${t.description} — ${sign}${rp(t.amount)}`);
      }

      await setBalance(userId, runningBalance);

      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        finalReply = [`✅ ${transactions.length} Transaksi Berhasil Dicatat!`, SEP, ...lines, SEP].join('\n');
        if (totalInc > 0 && totalExp > 0) finalReply += `\n💰 Total Masuk : ${rp(totalInc)}\n💸 Total Keluar : ${rp(totalExp)}`;
        else if (totalInc > 0)            finalReply += `\n💰 Total Pemasukan : ${rp(totalInc)}`;
        else                              finalReply += `\n💸 Total Pengeluaran : ${rp(totalExp)}`;
        finalReply += `\n🏦 Saldo Baru : ${rp(runningBalance)}\n\n${replyText}`;

        // Budget alert
        if (totalExp > 0) {
          const limit = await getBudgetLimit(userId, 'daily');
          if (limit > 0) {
            const todaySpent = await getTodayExpense(userId);
            const p = pct(todaySpent, limit);
            if (todaySpent > limit)        finalReply += `\n\n⚠️ Budget Harian Terlampaui! (Dipakai ${p}% dari ${rp(limit)})`;
            else if (todaySpent >= limit * 0.8) finalReply += `\n\n🔔 Hati-hati! Sudah ${p}% dari budget harian.`;
          }
        }


        // Conversational follow-up hook
        if (totalExp > 0) finalReply += `\n\n💬 Mau aku bantu set limit pengeluaran harian? Ketik "set limit harian [nominal]" 🎯`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. CHECK_BALANCE
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'check_balance') {
      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        const status = runningBalance < 50000 ? '🔴 Saldo tipis, super awas!' : runningBalance < 200000 ? '🟡 Saldo mulai menipis.' : '🟢 Saldo aman, tetap bijak!';
        finalReply = [`💳 Cek Saldo Saat Ini`, SEP, `🏦 Sisa Saldo: ${rp(runningBalance)}`, status, `\n${replyText}`].join('\n');
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. CHECK_MONTH
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'check_month') {
      const txs  = await getThisMonthTransactions(userId);
      const mExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const mInc = txs.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
      const net  = mInc - mExp;
      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        finalReply = [
          `📆 Rekap Bulan ${format(new Date(), 'MMMM yyyy', { locale: id })}`,
          SEP,
          `💰 Total Masuk  : ${rp(mInc)}`,
          `💸 Total Keluar : ${rp(mExp)}`,
          SEP,
          `${net >= 0 ? '✅' : '🔴'} Net (Sisa)   : ${rp(Math.abs(net))} ${net >= 0 ? '(Surplus)' : '(Defisit)'}`,
          `\n${replyText}`
        ].join('\n');
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. CHECK_TODAY
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'check_today') {
      const todayTxs = await getTodayTransactions(userId);
      const todayExp = todayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const todayInc = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        finalReply = [`📅 Transaksi Hari Ini (${format(new Date(), 'dd MMM yyyy', { locale: id })})`, SEP].join('\n');
        if (todayTxs.length === 0) {
          finalReply += '\nBelum ada transaksi hari ini!';
        } else {
          todayTxs.forEach((tx, i) => {
            const s = tx.type === 'income' ? '+' : '-';
            finalReply += `\n${i + 1}. ${catEmoji(tx.category ?? 'lainnya')} ${tx.description} — ${s}${rp(tx.amount)}`;
          });
          finalReply += `\n${SEP}\n💸 Total Keluar: ${rp(todayExp)}\n💰 Total Masuk : ${rp(todayInc)}`;
        }
        finalReply += `\n\n${replyText}`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. CHECK_HISTORY
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'check_history') {
      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        const recent = await getRecentTransactions(userId, 10);
        if (recent.length === 0) finalReply = `Belum ada riwayat transaksi nih!\n\n${replyText}`;
        else {
          finalReply = [`📋 10 Transaksi Terakhir`, SEP].join('\n');
          recent.forEach((tx, i) => {
            const s = tx.type === 'income' ? '+' : '-';
            finalReply += `\n${i + 1}. ${tgl(tx.date)} | ${s}${rp(tx.amount)} | ${tx.description}`;
          });
          finalReply += `\n\n${replyText}`;
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 6. INSIGHT: CATEGORY SPENDING 📊
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'insight_category_spending') {
      const isWeek = /minggu/i.test(userMessage);
      const txs    = isWeek ? await getThisWeekTransactions(userId) : await getThisMonthTransactions(userId);
      const cats   = aggregateByCategory(txs);
      const period = isWeek ? 'Minggu Ini' : `Bulan ${format(new Date(), 'MMMM', { locale: id })}`;
      const totalExp = cats.reduce((s, c) => s + c.total, 0);

      if (cats.length === 0) {
        finalReply = `📊 Belum ada data pengeluaran untuk ${period}.`;
      } else {
        const top   = cats[0];
        const topPct = pct(top.total, totalExp);

        finalReply = [`📊 ${period} — Kategori Terbesar`, SEP].join('\n');
        cats.slice(0, 5).forEach((c, i) => {
          const p = pct(c.total, totalExp);
          const bar = '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
          finalReply += `\n${i + 1}. ${catEmoji(c.category)} ${c.category}`;
          finalReply += `\n   ${bar} ${rp(c.total)} (${p}%)`;
        });
        finalReply += `\n${SEP}`;
        finalReply += `\n\n⚠️ Insight:\nKategori ${catEmoji(top.category)} ${top.category} mendominasi ${topPct}% dari total pengeluaranmu.`;
        
        // Contextual advice based on top category
        const adviceMap: Record<string, string> = {
          makanan: 'Coba masak sendiri 2–3x seminggu dan kurangi pesan online 🍱',
          minuman: 'Batasi kopi/boba harian — coba bikin sendiri di rumah ☕',
          transport: 'Pertimbangkan langganan bulanan atau manfaatkan promo ongkir 🚗',
          belanja: 'Terapkan wishlist 7 hari sebelum beli — filter yang benar-benar butuh 🛒',
          game: 'Set budget game bulanan & patuhi — pakai voucher promo 🎮',
          streaming: 'Cek apakah semua langganan aktif digunakan, pertimbangkan share account 📺',
        };
        const advice = adviceMap[top.category] ?? 'Evaluasi pengeluaran kategori ini dan cari cara efisiensi yang tepat 💡';
        finalReply += `\n\n💡 Saran:\n${advice}`;
        finalReply += `\n\n💬 Mau set limit untuk kategori ini? Ketik "set limit harian [nominal]" 🎯`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 7. FINANCIAL HEALTH CHECK 🧠
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'financial_health_check') {
      const [monthTxs, burnRate] = await Promise.all([
        getThisMonthTransactions(userId),
        getDailyBurnRate(userId),
      ]);
      const persona = classifySpendingPersona(monthTxs, burnRate, runningBalance);
      const cats    = aggregateByCategory(monthTxs);
      const totalExp = cats.reduce((s, c) => s + c.total, 0);
      const totalInc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const savRate  = totalInc > 0 ? pct(totalInc - totalExp, totalInc) : 0;
      
      const healthScore = savRate >= 30 ? '🟢 Sehat' : savRate >= 10 ? '🟡 Cukup' : '🔴 Perlu Perhatian';

      finalReply = [`🧠 Profil Keuanganmu`, SEP].join('\n');
      finalReply += `\nKamu cenderung: ${persona.persona}`;
      finalReply += `\n\n📊 Kondisi Bulan Ini:`;
      finalReply += `\n• Pemasukan  : ${rp(totalInc)}`;
      finalReply += `\n• Pengeluaran: ${rp(totalExp)}`;
      finalReply += `\n• Saving Rate: ${savRate}% ${healthScore}`;
      finalReply += `\n• Burn Rate  : ~${rp(burnRate)}/hari`;
      finalReply += `\n\n📌 Ciri kamu:`;
      persona.traits.forEach(t => finalReply += `\n• ${t}`);
      finalReply += `\n\n💡 Saran:\n${persona.advice}`;
      if (cats.length > 0) finalReply += `\n\n💬 Kategori terbesar: ${catEmoji(cats[0].category)} ${cats[0].category} (${pct(cats[0].total, totalExp)}% dari pengeluaran)`;
    }

    // ══════════════════════════════════════════════════════════════════
    // 8. SPENDING PREDICTION 🔮
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'spending_prediction') {
      const [burnRate, goal] = await Promise.all([
        getDailyBurnRate(userId),
        getSavingGoal(userId),
      ]);
      const monthTxs = await getThisMonthTransactions(userId);
      const totalExp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const totalInc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

      finalReply = [`🔮 Prediksi Keuangan`, SEP].join('\n');

      if (burnRate > 0 && runningBalance > 0) {
        const daysLeft = Math.round(runningBalance / burnRate);
        finalReply += `\n📉 Burn Rate Harian: ~${rp(burnRate)}/hari`;
        finalReply += `\n💰 Saldo Saat Ini  : ${rp(runningBalance)}`;
        finalReply += `\n\n⏳ Jika pola pengeluaran tetap:`;
        finalReply += `\n→ Saldo akan habis dalam ±${daysLeft} hari`;

        if (daysLeft <= 7)       finalReply += `\n🚨 KRITIS! Kurangi pengeluaran segera!`;
        else if (daysLeft <= 14) finalReply += `\n⚠️ Mulai hemat dari sekarang.`;
        else                     finalReply += `\n✅ Masih aman untuk beberapa waktu.`;
      }

      // Saving prediction
      const now = new Date();
      const daysInMonth  = getDaysInMonth(now);
      const dayOfMonth   = now.getDate();
      const daysRemaining = daysInMonth - dayOfMonth;
      const projectedExp = totalExp + (burnRate * daysRemaining);
      const projectedSave = totalInc - projectedExp;

      if (totalInc > 0) {
        finalReply += `\n\n📊 Proyeksi Akhir Bulan:`;
        finalReply += `\n• Pemasukan Saat Ini : ${rp(totalInc)}`;
        finalReply += `\n• Proyeksi Pengeluaran: ${rp(Math.round(projectedExp))}`;
        finalReply += `\n• Proyeksi Tabungan  : ${projectedSave > 0 ? rp(Math.round(projectedSave)) : '⚠️ Kemungkinan defisit!'}`;
      }

      if (burnRate > 0) {
        const reducedBurn = Math.round(burnRate * 0.8);
        finalReply += `\n\n💡 Saran:\nKurangi pengeluaran harian 20% → ~${rp(reducedBurn)}/hari`;
      }

      if (goal) {
        const needed     = Math.max(0, goal.target - goal.saved);
        const perDay     = daysRemaining > 0 ? Math.ceil(needed / daysRemaining) : needed;
        finalReply += `\n\n🎯 Goal Tabungan: ${rp(goal.target)}\n• Terkumpul: ${rp(goal.saved)} (${pct(goal.saved, goal.target)}%)\n• Perlu nabung ~${rp(perDay)}/hari`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 9. COMPARISON PERIOD 📊
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'comparison_period') {
      const isMonth = /bulan/i.test(userMessage);

      if (isMonth) {
        const [thisTxs, lastTxs] = await Promise.all([
          getThisMonthTransactions(userId),
          getLastMonthTransactions(userId),
        ]);
        const thisExp = thisTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const lastExp = lastTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const diff    = thisExp - lastExp;
        const diffPct = pct(Math.abs(diff), lastExp);

        finalReply = [`📊 Perbandingan Bulan`, SEP].join('\n');
        finalReply += `\n🗓 Bulan Ini   : ${rp(thisExp)}`;
        finalReply += `\n🗓 Bulan Lalu  : ${rp(lastExp)}`;
        finalReply += `\n${SEP}`;
        finalReply += diff > 0
          ? `\n⬆️ Naik ${diffPct}% (lebih boros ${rp(diff)})`
          : diff < 0
          ? `\n⬇️ Turun ${diffPct}% (lebih hemat ${rp(Math.abs(diff))}) 🎉`
          : `\n✅ Sama seperti bulan lalu!`;

        // Top difference category
        const thisCats = aggregateByCategory(thisTxs);
        const lastCats = aggregateByCategory(lastTxs);
        const biggestGrow = thisCats
          .map(c => {
            const prev = lastCats.find(lc => lc.category === c.category)?.total ?? 0;
            return { ...c, growth: c.total - prev };
          })
          .filter(c => c.growth > 0)
          .sort((a, b) => b.growth - a.growth)[0];

        if (biggestGrow) finalReply += `\n\n📌 Kenaikan terbesar: ${catEmoji(biggestGrow.category)} ${biggestGrow.category} +${rp(biggestGrow.growth)}`;
        finalReply += `\n\n${replyText}`;
      } else {
        // Week comparison
        const [thisTxs, lastTxs] = await Promise.all([
          getThisWeekTransactions(userId),
          getLastWeekTransactions(userId),
        ]);
        const thisExp = thisTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const lastExp = lastTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const diff    = thisExp - lastExp;
        const diffPct = lastExp > 0 ? pct(Math.abs(diff), lastExp) : 0;

        finalReply = [`📊 Perbandingan Mingguan`, SEP].join('\n');
        finalReply += `\n📅 Minggu Ini  : ${rp(thisExp)}`;
        finalReply += `\n📅 Minggu Lalu : ${rp(lastExp)}`;
        finalReply += `\n${SEP}`;
        finalReply += diff > 0
          ? `\n⬆️ Naik ${diffPct}% (lebih boros ${rp(diff)})`
          : diff < 0
          ? `\n⬇️ Turun ${diffPct}% (lebih hemat ${rp(Math.abs(diff))}) 🎉`
          : `\n✅ Sama seperti minggu lalu!`;

        const thisCats = aggregateByCategory(thisTxs);
        const lastCats = aggregateByCategory(lastTxs);
        const biggestGrow = thisCats
          .map(c => {
            const prev = lastCats.find(lc => lc.category === c.category)?.total ?? 0;
            return { ...c, growth: c.total - prev };
          })
          .filter(c => c.growth > 0)
          .sort((a, b) => b.growth - a.growth)[0];

        if (biggestGrow) finalReply += `\n\n📌 Penyebab utama kenaikan: ${catEmoji(biggestGrow.category)} ${biggestGrow.category} +${rp(biggestGrow.growth)}`;
        finalReply += `\n\n${replyText}`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 10. GOAL TRACKING 🎯
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'goal_tracking') {
      const goal = await getSavingGoal(userId);
      if (!goal) {
        finalReply = `🎯 Kamu belum set target tabungan.\n\nKetik: "aku mau nabung [nominal] bulan ini"\nContoh: "aku mau nabung 1 juta bulan ini" 💪`;
      } else {
        const now            = new Date();
        const daysInMonth    = getDaysInMonth(now);
        const daysRemaining  = daysInMonth - now.getDate();
        const needed         = Math.max(0, goal.target - goal.saved);
        const progress       = pct(goal.saved, goal.target);
        const progressBar    = '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10));
        const perDay         = daysRemaining > 0 ? Math.ceil(needed / daysRemaining) : 0;

        finalReply = [`🎯 Progress Goal Tabungan Bulan Ini`, SEP].join('\n');
        finalReply += `\n🏁 Target  : ${rp(goal.target)}`;
        finalReply += `\n💰 Terkumpul: ${rp(goal.saved)}`;
        finalReply += `\n\n${progressBar} ${progress}%`;
        finalReply += `\n\n⏳ Sisa waktu: ${daysRemaining} hari`;

        if (needed > 0) {
          finalReply += `\n💸 Kekurangan: ${rp(needed)}`;
          finalReply += `\n📌 Perlu hemat ~${rp(perDay)}/hari untuk capai target!`;
        } else {
          finalReply += `\n🎉 GOAL TERCAPAI! Kamu berhasil nabung! Lanjutkan!`;
        }

        finalReply += `\n\n${replyText}`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 11. SET GOAL 🎯
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'set_goal' && goalAmount) {
      await setSavingGoal(userId, goalAmount);
      const now = new Date();
      const daysRemaining = getDaysInMonth(now) - now.getDate();
      const perDay = daysRemaining > 0 ? Math.ceil(goalAmount / daysRemaining) : goalAmount;

      finalReply = [`🎯 Target Tabungan Bulan Ini Diset!`, SEP].join('\n');
      finalReply += `\n💰 Target  : ${rp(goalAmount)}`;
      finalReply += `\n⏳ Sisa waktu : ${daysRemaining} hari`;
      finalReply += `\n📌 Perlu nabung ~${rp(perDay)}/hari`;
      finalReply += `\n\n${replyText}`;
      finalReply += `\n\n💬 Ketik "progress tabungan" kapan saja untuk cek perkembanganmu!`;
    }

    // ══════════════════════════════════════════════════════════════════
    // 11.B. DEPOSIT SAVING 🐷
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'deposit_saving' && depositAmount) {
      if (depositAmount > runningBalance) {
        finalReply = `⚠️ Saldo kamu nggak cukup buat nabung ${rp(depositAmount)}. Saldo kamu cuma ${rp(runningBalance)}.`;
      } else {
        runningBalance -= depositAmount;
        await setBalance(userId, runningBalance);
        await insertTransaction(userId, 'saving', depositAmount, 'Simpan ke celengan', 'tabungan');
        finalReply = [`🐷 Setor Tabungan Berhasil!`, SEP].join('\n');
        finalReply += `\n💰 Saldo sisa : ${rp(runningBalance)}\n\n${replyText}\n\n💬 Coba cek "progress tabungan" kamu deh!`;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 12. RECOMMENDATION ENGINE 💡
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'recommendation_engine') {
      const [monthTxs, burnRate] = await Promise.all([
        getThisMonthTransactions(userId),
        getDailyBurnRate(userId),
      ]);
      const cats     = aggregateByCategory(monthTxs);
      const totalExp = cats.reduce((s, c) => s + c.total, 0);
      const totalInc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

      finalReply = [`💡 Analisa & Rekomendasi Keuanganmu`, SEP].join('\n');

      if (cats.length === 0) {
        finalReply += '\nBelum ada cukup data transaksi bulan ini untuk dianalisa.';
      } else {
        finalReply += `\n📊 Distribusi Pengeluaran:`;
        cats.slice(0, 4).forEach(c => {
          const p = pct(c.total, totalExp);
          finalReply += `\n• ${catEmoji(c.category)} ${c.category}: ${p}% (${rp(c.total)})`;
        });

        finalReply += `\n\n🧠 Analisis:`;
        const topCat = cats[0];
        const topPct = pct(topCat.total, totalExp);
        if (topPct > 40) finalReply += `\n• ${topPct}% pengeluaranmu ada di ${catEmoji(topCat.category)} ${topCat.category} — cukup dominan!`;
        if (totalInc > 0) {
          const savRate = pct(totalInc - totalExp, totalInc);
          finalReply += `\n• Saving rate: ${savRate}% ${savRate >= 20 ? '✅ Bagus!' : savRate >= 10 ? '🟡 Bisa lebih baik' : '🔴 Perlu ditingkatkan'}`;
        }
        finalReply += `\n• Burn rate: ~${rp(burnRate)}/hari`;

        // Personalized recommendations
        const recs: string[] = [];
        if (cats.find(c => c.category === 'makanan' && pct(c.total, totalExp) > 35))
          recs.push('🍱 Masak sendiri 2–3x/minggu, bisa hemat 30–40% biaya makan');
        if (cats.find(c => c.category === 'minuman' && pct(c.total, totalExp) > 15))
          recs.push('☕ Batasi kopi/boba — coba bikin sendiri, hemat Rp 15–25rb/hari');
        if (cats.find(c => c.category === 'belanja' && c.total > 200000))
          recs.push('🛒 Terapkan "24-hour rule" sebelum checkout belanja online');
        if (cats.find(c => c.category === 'streaming' && c.count > 2))
          recs.push('📺 Review semua langganan streaming, pertimbangkan share account');
        if (burnRate > 0) recs.push(`💰 Set limit harian ${rp(Math.round(burnRate * 0.85))} (85% dari burn rate sekarang)`);
        recs.push('📊 Evaluasi keuangan tiap Minggu malam — 5 menit saja!');

        finalReply += `\n\n🎯 Rekomendasi Personal:`;
        recs.slice(0, 4).forEach((r, i) => finalReply += `\n${i + 1}. ${r}`);
      }
    }


    // ══════════════════════════════════════════════════════════════════
    // 14. KNOWLEDGE / FAQ / DEFAULT
    // ══════════════════════════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════
    // 14. CHECK_DATE & CHECK_RANGE & SET_LIMIT & SET_BALANCE & CLEAR_TODAY
    // ══════════════════════════════════════════════════════════════════
    else if (intent === 'check_date' && dateStr) {
      const txs = await getDateTransactions(userId, dateStr);
      const todayExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const todayInc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      if (mode === 'voice') {
        finalReply = replyText;
      } else {
        finalReply = [`📅 Laporan Tanggal ${tgl(dateStr)}`, SEP].join('\n');
        if (txs.length === 0) finalReply += '\nTidak ada data transaksi di tanggal ini.';
        else {
          txs.forEach((tx, i) => {
            const s = tx.type === 'income' ? '+' : '-';
            finalReply += `\n${i + 1}. ${catEmoji(tx.category ?? 'lainnya')} ${tx.description} — ${s}${rp(tx.amount)}`;
          });
          finalReply += `\n${SEP}\n💸 Total Keluar: ${rp(todayExp)}\n💰 Total Masuk : ${rp(todayInc)}`;
        }
        finalReply += `\n\n${replyText}`;
      }
    } else if (intent === 'check_range' && startDate && endDate) {
      // Sanity check: jika tahun startDate berbeda jauh dari tahun ini, jangan pakai date range lama 
      const currentYear = new Date().getFullYear();
      const parsedYear  = new Date(startDate).getFullYear();
      if (Math.abs(parsedYear - currentYear) > 1) {
        // Fallback: Gemini salah parse, tampilkan data minggu ini saja
        const txs     = await getThisWeekTransactions(userId);
        const wExp    = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const wInc    = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        finalReply    = [`📅 Pengeluaran Minggu Ini`, SEP].join('\n');
        if (txs.length === 0) finalReply += '\nBelum ada transaksi minggu ini!';
        else {
          txs.forEach((tx, i) => {
            const s = tx.type === 'income' ? '+' : '-';
            finalReply += `\n${i + 1}. ${catEmoji(tx.category ?? 'lainnya')} ${tx.description} — ${s}${rp(tx.amount)}`;
          });
          finalReply += `\n${SEP}\n💸 Total Keluar: ${rp(wExp)}\n💰 Total Masuk : ${rp(wInc)}`;
        }
        finalReply += `\n\n${replyText}`;
      } else {
        const txs = await getDateRangeTransactions(userId, startDate, endDate);
        const todayExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const todayInc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        if (mode === 'voice') {
          finalReply = replyText;
        } else {
          finalReply = [`📅 Laporan: ${tgl(startDate)} - ${tgl(endDate)}`, SEP].join('\n');
          finalReply += `\n💸 Total Keluar: ${rp(todayExp)}\n💰 Total Masuk : ${rp(todayInc)}`;
          finalReply += `\n\n${replyText}`;
        }
      }
    } else if (intent === 'set_limit' && limitAmount !== undefined) {
      await setBudgetLimit(userId, 'daily', limitAmount);
      finalReply = [`🎯 Budget Harian Diatur!`, SEP].join('\n');
      if (mode !== 'voice') finalReply += `\nLimit pengeluaran kamu sekarang: ${rp(limitAmount)} per hari.\n\n${replyText}`;
      else finalReply = replyText;
    } else if (intent === 'set_balance' && balanceAmount !== undefined) {
      runningBalance = balanceAmount;
      await setBalance(userId, runningBalance);
      finalReply = [`🏦 Saldo Awal Berhasil Ditetapkan`, SEP].join('\n');
      if (mode !== 'voice') finalReply += `\nSaldo dompetmu sekarang: ${rp(runningBalance)}\n\n${replyText}`;
      else finalReply = replyText;
    } else if (intent === 'clear_today') {
      await clearTodayTransactions(userId);
      finalReply = mode !== 'voice' ? `🧹 Oke, semua catatan transaksi kamu HARI INI udah aku bersihin.\n\n${replyText}` : replyText;
    }
    // ══════════════════════════════════════════════════════════════════
    // 15. KNOWLEDGE / FAQ / DEFAULT
    // ══════════════════════════════════════════════════════════════════
    else {
      finalReply = mode === 'voice'
        ? replyText
        : `💡 WangkuAI Tips\n${SEP}\n${replyText}\n\n🏦 (Saldo Saat Ini: ${rp(runningBalance)})`;
    }

    await saveChatMessage(userId, 'assistant', finalReply);
    return NextResponse.json({ success: true, response: finalReply, balance: runningBalance });

  } catch (error: any) {
    console.error('[/api/chat]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const chats = await getChatHistory((session.user as any).id, 50);
    return NextResponse.json({ success: true, chats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
