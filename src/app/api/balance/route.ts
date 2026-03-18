import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBalance } from '@/lib/queries';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as { id?: string }).id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;
        const balance = await getBalance(userId);
        return NextResponse.json({ success: true, balance });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
