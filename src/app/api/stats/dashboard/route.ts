import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  subDays, format,
} from 'date-fns';
import { id } from 'date-fns/locale';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const now = new Date();

    // ── 1. BALANCE ──
    const balRecord = await prisma.balance.findUnique({ where: { userId } });
    const currentBalance = balRecord?.current ?? 0;

    // ── 2. STATS BULAN INI ──
    const monthTxs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
    });
    const incomeMonth  = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseMonth = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const txCountMonth = monthTxs.length;

    // ── 3. 7 HARI TERAKHIR ──
    const sevenDaysAgo = subDays(now, 6);
    const last7Txs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfDay(sevenDaysAgo), lte: endOfDay(now) },
      },
    });

    const expMap: Record<string, number> = {};
    const incMap: Record<string, number> = {};
    for (const tx of last7Txs) {
      const key = format(new Date(tx.date), 'yyyy-MM-dd');
      if (tx.type === 'expense') expMap[key] = (expMap[key] ?? 0) + tx.amount;
      if (tx.type === 'income')  incMap[key] = (incMap[key] ?? 0) + tx.amount;
    }

    const chartLabels: string[] = [];
    const chartExp: number[] = [];
    const chartInc: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const key = format(d, 'yyyy-MM-dd');
      chartLabels.push(format(d, 'dd MMM', { locale: id }));
      chartExp.push(expMap[key] ?? 0);
      chartInc.push(incMap[key] ?? 0);
    }

    // ── 4. DONUT KATEGORI BULAN INI ──
    const catMap: Record<string, number> = {};
    for (const tx of monthTxs.filter(t => t.type === 'expense')) {
      const cats = (tx.category ?? 'lainnya').split(',').map(c => c.trim());
      const c = cats[0] || 'lainnya';
      catMap[c] = (catMap[c] ?? 0) + tx.amount;
    }
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const chartCatLabels = sorted.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const chartCatData   = sorted.map(([, v]) => v);

    // ── 5. HARI INI ──
    const todayTxs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfDay(now), lte: endOfDay(now) },
      },
      orderBy: { createdAt: 'desc' },
    });
    const todayExpense   = todayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const todayIncome    = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const todayTxCount   = todayTxs.length;

    const todayCatMap: Record<string, number> = {};
    for (const tx of todayTxs.filter(t => t.type === 'expense')) {
      const cats = (tx.category ?? 'lainnya').split(',').map(c => c.trim());
      for (const c of cats) {
        const key = c.toLowerCase() || 'lainnya';
        todayCatMap[key] = (todayCatMap[key] ?? 0) + tx.amount;
      }
    }
    const todayCatRows = Object.entries(todayCatMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }));
    const todayCatTotal = todayCatRows.reduce((s, r) => s + r.total, 0);

    // ── 6. TABEL INTENT/KATEGORI SEMUA TRANSAKSI BULAN INI ──
    const intentTable = monthTxs
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50)
      .map(t => ({
        id:          t.id,
        date:        format(new Date(t.date), 'dd MMM yyyy', { locale: id }),
        description: t.description ?? '-',
        category:    t.category ?? 'lainnya',
        amount:      t.amount,
        type:        t.type,
      }));

    return NextResponse.json({
      currentBalance,
      incomeMonth,
      expenseMonth,
      txCountMonth,
      chartLabels,
      chartExp,
      chartInc,
      chartCatLabels,
      chartCatData,
      todayExpense,
      todayIncome,
      todayTxCount,
      todayCatRows,
      todayCatTotal,
      intentTable,
    });
  } catch (error: any) {
    console.error('[API Dashboard Stats Error]', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
