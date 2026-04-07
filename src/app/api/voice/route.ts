import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { detectIntent, extractMultipleExpenses } from '@/lib/nlp';
import {
  getBalance, setBalance, insertTransaction,
  getThisMonthTransactions, getRecentTransactions,
  saveChatMessage
} from '@/lib/queries';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

function generateMinoResponse(intentData: any, runningBalance: number, itemsCount = 1): string {
  const { intent, amount, description } = intentData;
  const greetings = ["Halo!", "Oke siap!", "Mino paham.", "Sip bos!", "Siap laksanakan!"];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  if (intent === 'expense') {
    if (itemsCount > 1) {
      return `${greeting} Aku udah catet ${itemsCount} pengeluaran kamu ya. Sisa uangmu sekarang ${rp(runningBalance)}. Tetap hemat ya!`;
    }
    return `${greeting} Udah aku catet pengeluaran buat ${description || 'sesuatu'} sebesar ${amount ? rp(amount) : '0 rupiah'}. Saldo kamu tinggal ${rp(runningBalance)}. Jangan boros-boros ya!`;
  }
  
  if (intent === 'income') {
    return `Wah, alhamdulillah! ${greeting} Pemasukan buat ${description || 'sesuatu'} sebesar ${amount ? rp(amount) : '0 rupiah'} udah masuk catatan. Saldo kamu naik jadi ${rp(runningBalance)}. Terus semangat cari cuannya!`;
  }

  if (intent === 'check_balance') {
    let comment = runningBalance < 50000 ? "Aduh, saldomu udah tipis banget nih, hati-hati ya." : "Wah, masih aman kok pelan-pelan aja belanjanya.";
    return `${greeting} Saldo dompetmu saat ini ada ${rp(runningBalance)}. ${comment}`;
  }

  if (intent === 'check_month') {
    return `${greeting} Aku udah rekap bulan ini. Untuk detailnya bisa cek di dashboard ya, tapi yang pasti tetap pantau keuanganmu!`;
  }

  if (intent === 'check_history') {
    return `${greeting} Kamu mau ngecek riwayat ya? Ini riwayat transaksi terakhirmu udah siap, cek layar utama ya!`;
  }

  // Fallback for knowledge / others
  return `${greeting} Hmm, aku kurang nangkap yang detail soal itu. Tapi aku selalu di sini bantu catat keuangan kamu. Saldo kamu sekarang ${rp(runningBalance)} loh.`;
}

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
    let runningBalance = currentBalance;
    let finalReply = "";

    console.log("[Voice NLP] Processing message:", userMessage);
    const intentResult = await detectIntent(userMessage);
    console.log("[Voice NLP] Result:", intentResult);

    // Handle multiple expenses (e.g. "beli makan 25 ribu dan minum 5 ribu")
    if (intentResult.intent === 'expense') {
      const multi = extractMultipleExpenses(userMessage);
      if (multi && multi.length > 0) {
        for (const item of multi) {
          runningBalance -= item.amount;
          await insertTransaction(userId, 'expense', item.amount, item.description, 'lainnya');
        }
        await setBalance(userId, runningBalance);
        finalReply = generateMinoResponse(intentResult, runningBalance, multi.length);
      } else if (intentResult.amount) {
        runningBalance -= intentResult.amount;
        await insertTransaction(userId, 'expense', intentResult.amount, intentResult.description || 'Pengeluaran', intentResult.category);
        await setBalance(userId, runningBalance);
        finalReply = generateMinoResponse(intentResult, runningBalance, 1);
      } else {
         finalReply = "Ehh, jumlahnya berapa ya tadi? Kasih tau jumlah detailnya ya biar Mino catet pengeluarannya.";
      }
    } 
    else if (intentResult.intent === 'income' && intentResult.amount) {
      runningBalance += intentResult.amount;
      await insertTransaction(userId, 'income', intentResult.amount, intentResult.description || 'Pemasukan', intentResult.category);
      await setBalance(userId, runningBalance);
      finalReply = generateMinoResponse(intentResult, runningBalance, 1);
    }
    else {
      finalReply = generateMinoResponse(intentResult, runningBalance);
    }

    await saveChatMessage(userId, 'assistant', finalReply);

    return NextResponse.json({ success: true, response: finalReply, balance: runningBalance });

  } catch (error: any) {
    console.error('[/api/voice]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
