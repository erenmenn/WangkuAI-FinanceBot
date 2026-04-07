import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getBalance, setBalance, insertTransaction,
  getSavingGoal, setSavingGoal,
} from '@/lib/queries';
import { startOfMonth, endOfMonth } from 'date-fns';

// ── GET: fetch current saving status ─────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    // Goal target
    const goalRow = await prisma.budgetLimit.findUnique({
      where: { userId_type: { userId, type: 'saving_goal' } },
    });

    // Sum of all `type='saving'` transactions this month
    const now = new Date();
    const agg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'saving',
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      _sum: { amount: true },
    });

    // All saving transactions (history)
    const history = await prisma.transaction.findMany({
      where: { userId, type: 'saving' },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const totalSaved  = agg._sum.amount ?? 0;
    const goalTarget  = goalRow?.amount ?? 0;
    const balance     = await getBalance(userId);

    return NextResponse.json({
      success: true,
      goal: goalTarget,
      saved: totalSaved,
      balance,
      history: history.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.date,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: set goal OR deposit ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { action, amount, goal } = body;

    // ── SET GOAL ─────────────────────────────────────────────────────
    if (action === 'set_goal') {
      const target = Number(goal);
      if (!target || target <= 0)
        return NextResponse.json({ success: false, error: 'Goal tidak valid' }, { status: 400 });
      await setSavingGoal(userId, target);
      return NextResponse.json({ success: true, goal: target });
    }

    // ── DEPOSIT (simpan uang ke tabungan) ────────────────────────────
    if (action === 'deposit') {
      const amt = Number(amount);
      if (!amt || amt <= 0)
        return NextResponse.json({ success: false, error: 'Nominal tidak valid' }, { status: 400 });

      const currentBalance = await getBalance(userId);
      if (amt > currentBalance)
        return NextResponse.json({ success: false, error: `Saldo tidak cukup. Saldo kamu: Rp ${currentBalance.toLocaleString('id-ID')}` }, { status: 400 });

      // Deduct from balance
      const newBalance = currentBalance - amt;
      await setBalance(userId, newBalance);

      // Record as a `saving` type transaction
      await insertTransaction(userId, 'saving', amt, 'Simpan ke celengan', 'tabungan');

      // Refetch saved total this month
      const now = new Date();
      const agg = await prisma.transaction.aggregate({
        where: {
          userId, type: 'saving',
          date: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
        _sum: { amount: true },
      });
      const totalSaved = agg._sum.amount ?? 0;
      const goalRow = await prisma.budgetLimit.findUnique({
        where: { userId_type: { userId, type: 'saving_goal' } },
      });
      const goalTarget = goalRow?.amount ?? 0;

      return NextResponse.json({
        success: true,
        deposited: amt,
        newBalance,
        saved: totalSaved,
        goal: goalTarget,
      });
    }

    return NextResponse.json({ success: false, error: 'Action tidak valid' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
