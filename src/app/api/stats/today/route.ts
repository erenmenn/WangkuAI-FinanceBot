import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { format } from 'date-fns';
import { getTodayTransactions, getBalance } from '@/lib/queries';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as { id?: string }).id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const txList = await getTodayTransactions(userId);
        const todayExpense = txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const todayIncome = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const balance = await getBalance(userId);

        return NextResponse.json({
            success: true,
            date: format(new Date(), 'yyyy-MM-dd'),
            balance,
            today_expense: todayExpense,
            today_income: todayIncome,
            tx_count: txList.length,
            transactions: txList,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
