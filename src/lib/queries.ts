import { prisma } from './prisma';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

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
