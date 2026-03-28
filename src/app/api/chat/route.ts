/**
 * ══════════════════════════════════════════════════════════════
 *  /api/chat/route.ts  —  WangkuAI Chat Handler (DIPERKUAT GEMINI AI)
 *
 *  Alur:
 *  User Ketik → Gemini API (Parse JSON) → DB Action → Reply
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
  getRecentTransactions,
  saveChatMessage, getChatHistory,
  getBudgetLimit, getTodayExpense,
} from '@/lib/queries';

// ─── UTILS ──────────────────────────────────────────────────────────
const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const tgl = (d: Date | string) => format(new Date(d), 'dd MMM yyyy', { locale: id });
const SEP = '──────────────────────';

// ─── GEMINI FETCHER ─────────────────────────────────────────────────
async function parseWithGemini(userMessage: string, balance: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Gemini API Key:", apiKey ? apiKey.substring(0, 7) + "..." : "MISSING!");
  if (!apiKey) throw new Error("GEMINI_API_KEY tidak ditemukan di .env!");

  const prompt = `
Kamu adalah MinoAI, asisten keuangan jenius.
Tugasmu adalah membedah pesan user dan mengembalikan 100% RAW JSON tanpa markdown block/teks apapun.

Data Saldo User saat ini: Rp ${balance}

Struktur JSON Wajib:
{
  "intent": "transaction" | "check_balance" | "check_month" | "check_today" | "check_history" | "knowledge",
  "replyText": "Respon singkat bergaya gaul dan penyemangat khas asisten AI (MinoAI)",
  "transactions": [
    {
      "type": "expense" | "income",
      "amount": <angka bulat murni, misal 1.5 juta = 1500000>,
      "description": "Deskripsi singkat item (misal 'Gaji bulan ini' atau 'Beli bensin')",
      "category": "Kategori relevan"
    }
  ],
  "isMixed": boolean // true jika ada pemasukan dan pengeluaran sekaligus
}

ATURAN SUPER KETAT:
1. Jika user mencatat banyak transaksi, masukkan SEMUANYA ke dalam array "transactions".
2. Bisa jadi dalam satu kalimat ada pemasukan (income) dan pengeluaran (expense). Pisahkan dengan tepat di "type".
3. Perhatikan singkatan 5.5 juta = 5500000. 450 ribu = 450000.
4. Jangan balasi menggunakan markdown \`\`\`json. Langsung start dengan { dan end dengan }.

Pesan dari user: "${userMessage}"
  `;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API Error Detail:", errText);
    throw new Error('Gagal memanggil Gemini API: ' + res.status);
  }
  const data = await res.json();
  if (!data.candidates || !data.candidates[0]) {
    console.error("Gemini Unexpected Response:", JSON.stringify(data));
    throw new Error('Gemini tidak memberikan response valid');
  }
  const rawText = data.candidates[0].content.parts[0].text;
  console.log("Gemini Raw Reply:", rawText);
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
  
  return JSON.parse(cleanJson);
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const userMessage = (body.message ?? '').trim() as string;
    if (!userMessage) return NextResponse.json({ success: false, error: 'Pesan kosong' }, { status: 400 });

    await saveChatMessage(userId, 'user', userMessage);

    const currentBalance = await getBalance(userId);
    let geminiObj;
    try {
      geminiObj = await parseWithGemini(userMessage, currentBalance);
    } catch (e) {
      console.error("Gemini Error:", e);
      return NextResponse.json({ success: false, error: "Kendala server AI, coba lagi ya!" }, { status: 500 });
    }

    const { intent, transactions, replyText } = geminiObj;
    let finalReply = ``;
    let runningBalance = currentBalance;

    // ──────────────────────────────────────────────────────────────────
    // 1. INTENT: TRANSACTION (CATAT PEMASUKAN/PENGELUARAN/MIXED)
    if ((intent === 'transaction' || (transactions && transactions.length > 0)) && transactions) {
      const lines = [];
      let totalExp = 0, totalInc = 0;

      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        if (t.type === 'expense') {
          runningBalance -= t.amount;
          totalExp += t.amount;
        } else {
          runningBalance += t.amount;
          totalInc += t.amount;
        }
        await insertTransaction(userId, t.type, t.amount, t.description, t.category);
        const icon = t.type === 'expense' ? '💸' : '💰';
        const sign = t.type === 'expense' ? '-' : '+';
        lines.push(`  ${i + 1}. ${icon} ${t.description} — ${sign}${rp(t.amount)}`);
      }

      // ← SIMPAN SALDO BARU KE DATABASE
      await setBalance(userId, runningBalance);

      finalReply = [
        `✅ ${transactions.length} Transaksi Berhasil Dicatat!`,
        SEP,
        ...lines,
        SEP
      ].join('\n');

      if (totalInc > 0 && totalExp > 0) {
        finalReply += `\n💰 Total Masuk : ${rp(totalInc)}\n💸 Total Keluar : ${rp(totalExp)}`;
      } else if (totalInc > 0) {
        finalReply += `\n💰 Total Pemasukan : ${rp(totalInc)}`;
      } else {
        finalReply += `\n💸 Total Pengeluaran : ${rp(totalExp)}`;
      }
      finalReply += `\n🏦 Saldo Baru : ${rp(runningBalance)}\n\n${replyText}`;

      // Warning budget harian khusus kalau ada pengeluaran
      if (totalExp > 0) {
        const limit = await getBudgetLimit(userId, 'daily');
        if (limit > 0) {
          const todaySpent = await getTodayExpense(userId);
          const pct = Math.round((todaySpent / limit) * 100);
          if (todaySpent > limit) finalReply += `\n\n⚠️ Budget Harian Terlampaui! (Dipakai ${pct}% dari ${rp(limit)})`;
          else if (todaySpent >= limit * 0.8) finalReply += `\n\n🔔 Hati-hati! Sudah ${pct}% dari budget harian.`;
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────
    // 2. INTENT: CHECK MONTH (REKAP BULAN)
    else if (intent === 'check_month') {
      const txs  = await getThisMonthTransactions(userId);
      const mExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const mInc = txs.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
      const net  = mInc - mExp;
      
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
    // ──────────────────────────────────────────────────────────────────
    // 3. INTENT: CHECK BALANCE
    else if (intent === 'check_balance') {
      const status = runningBalance < 50000 ? '🔴 Saldo tipis, super awas!' : '🟢 Saldo aman, tetap bijak!';
      finalReply = [
        `💳 Cek Saldo Saat Ini`,
        SEP,
        `🏦 Sisa Saldo: ${rp(runningBalance)}`,
        status,
        `\n${replyText}`
      ].join('\n');
    }
    // ──────────────────────────────────────────────────────────────────
    // 4. INTENT: CHECK HISTORY
    else if (intent === 'check_history') {
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
    // ──────────────────────────────────────────────────────────────────
    // 5. INTENT: KNOWLEDGE / FAQ / TIPS
    else {
      finalReply = `💡 MinoAI Tips\n${SEP}\n${replyText}\n\n🏦 (Saldo Saat Ini: ${rp(runningBalance)})`;
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
    if (!session?.user || !(session.user as any).id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const chats = await getChatHistory((session.user as any).id, 50);
    return NextResponse.json({ success: true, chats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
