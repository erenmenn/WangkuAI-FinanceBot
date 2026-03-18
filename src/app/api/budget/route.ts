import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBudgetLimit, getTodayExpense, setBudgetLimit } from '@/lib/queries';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as { id?: string }).id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const daily_limit = await getBudgetLimit(userId, 'daily');
        const today_expense = await getTodayExpense(userId);
        
        return NextResponse.json({
            success: true,
            daily_limit,
            today_expense,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as { id?: string }).id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;
        
        const body = await req.json();
        const { daily_limit } = body;

        import('@/lib/queries').then(async ({ setBudgetLimit }) => {
            await setBudgetLimit(userId, 'daily', Number(daily_limit));
        });
        
        return NextResponse.json({
            success: true,
            daily_limit: Number(daily_limit)
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
