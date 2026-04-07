import { prisma } from './prisma';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek, subMonths, subDays } from 'date-fns';

// ── BALANCE ──
export async function getBalance(userId: string): Promise<number> {
  const bal = await prisma.balance.findUnique({ where: { userId } });
  return bal?.current ?? 0;
}

export async function setBalance(userId: string, amount: number): Promise<void> {
  await prisma.balance.upsert({
    where: { userId },
    create: { userId, current: amount },
    update: { current: amount },
  });
}

export async function addBalance(userId: string, amount: number): Promise<number> {
  const current = await getBalance(userId);
  const newBal = current + amount;
  await setBalance(userId, newBal);
  return newBal;
}

export async function subtractBalance(userId: string, amount: number): Promise<number> {
  const current = await getBalance(userId);
  const newBal = current - amount;
  await setBalance(userId, newBal);
  return newBal;
}

// ── TRANSACTIONS ──
export async function insertTransaction(
  userId: string,
  type: string,
  amount: number,
  description: string | null,
  category: string | null
): Promise<string> {
  const tx = await prisma.transaction.create({
    data: { userId, type, amount, description, category, date: new Date() },
  });
  return tx.id;
}

export async function getTodayTransactions(userId: string) {
  const now = new Date();
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecentTransactions(userId: string, limit = 10) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getThisMonthTransactions(userId: string) {
  const now = new Date();
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getDateTransactions(userId: string, date: string) {
  const d = new Date(date);
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(d),
        lte: endOfDay(d),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDateRangeTransactions(userId: string, startDate: string, endDate: string) {
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(new Date(startDate)),
        lte: endOfDay(new Date(endDate)),
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function clearTodayTransactions(userId: string): Promise<void> {
  const now = new Date();
  await prisma.transaction.deleteMany({
    where: {
      userId,
      date: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
  });
}

// ── BUDGET ──
export async function getBudgetLimit(userId: string, type: string): Promise<number> {
  const bl = await prisma.budgetLimit.findUnique({
    where: { userId_type: { userId, type } },
  });
  return bl?.amount ?? 0;
}

export async function setBudgetLimit(userId: string, type: string, amount: number): Promise<void> {
  await prisma.budgetLimit.upsert({
    where: { userId_type: { userId, type } },
    create: { userId, type, amount },
    update: { amount },
  });
}

export async function getTodayExpense(userId: string): Promise<number> {
  const now = new Date();
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

// ── CHAT HISTORY ──
export async function saveChatMessage(userId: string, role: string, message: string): Promise<void> {
  await prisma.chatHistory.create({
    data: { userId, role, message },
  });
}

export async function getChatHistory(userId: string, limit = 20) {
  return prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ── STATS (dipakai oleh /api/stats/today) ──
export async function getTodayStats(userId: string) {
  const [balance, todayTxs] = await Promise.all([
    getBalance(userId),
    getTodayTransactions(userId),
  ]);

  const today_income = todayTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const today_expense = todayTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    balance,
    today_income,
    today_expense,
    transactions: todayTxs.map((t) => ({
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: t.category,
    })),
  };
}

// ── WEEK HELPERS ──
export async function getThisWeekTransactions(userId: string) {
  const now = new Date();
  return prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getLastWeekTransactions(userId: string) {
  const lastWeekDate = subWeeks(new Date(), 1);
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek(lastWeekDate, { weekStartsOn: 1 }),
        lte: endOfWeek(lastWeekDate, { weekStartsOn: 1 }),
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getLastMonthTransactions(userId: string) {
  const lastMonthDate = subMonths(new Date(), 1);
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth(lastMonthDate),
        lte: endOfMonth(lastMonthDate),
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

// ── CATEGORY AGGREGATION ──
export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

export function aggregateByCategory(transactions: { type: string; amount: number; category: string | null }[]): CategoryStat[] {
  const map: Record<string, CategoryStat> = {};
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const cat = tx.category ?? 'lainnya';
    if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
    map[cat].total += tx.amount;
    map[cat].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ── BURN RATE (daily average expense last 7 days) ──
export async function getDailyBurnRate(userId: string): Promise<number> {
  const sevenDaysAgo = subDays(new Date(), 7);
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: { gte: startOfDay(sevenDaysAgo), lte: endOfDay(new Date()) },
    },
    _sum: { amount: true },
  });
  const total = result._sum.amount ?? 0;
  return Math.round(total / 7);
}

// ── SAVING GOAL ──
export async function getSavingGoal(userId: string): Promise<{ target: number; saved: number } | null> {
  try {
    const bl = await prisma.budgetLimit.findUnique({
      where: { userId_type: { userId, type: 'saving_goal' } },
    });
    if (!bl) return null;
    const now = new Date();
    const incResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'income',
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      _sum: { amount: true },
    });
    const expResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      _sum: { amount: true },
    });
    const totalInc = incResult._sum.amount ?? 0;
    const totalExp = expResult._sum.amount ?? 0;
    const saved = Math.max(0, totalInc - totalExp);
    return { target: bl.amount, saved };
  } catch {
    return null;
  }
}

export async function setSavingGoal(userId: string, target: number): Promise<void> {
  await prisma.budgetLimit.upsert({
    where: { userId_type: { userId, type: 'saving_goal' } },
    create: { userId, type: 'saving_goal', amount: target },
    update: { amount: target },
  });
}

// ── ANOMALY: Baseline daily expense (avg last 14 days, excluding today) ──
export async function getBaselineDailyExpense(userId: string): Promise<number> {
  const now = new Date();
  const start = subDays(now, 15);
  const end = subDays(startOfDay(now), 1);
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: { gte: startOfDay(start), lte: endOfDay(end) },
    },
    _sum: { amount: true },
  });
  const total = result._sum.amount ?? 0;
  return Math.round(total / 14);
}
