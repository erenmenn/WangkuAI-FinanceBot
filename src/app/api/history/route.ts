import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentTransactions } from '@/lib/queries';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as { id?: string }).id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get('limit') || '20';
        const limit = parseInt(limitStr, 10);
        
        const transactions = await getRecentTransactions(userId, limit);
        return NextResponse.json({ success: true, transactions });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
