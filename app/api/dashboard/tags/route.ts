import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth';
import { getTagConfig } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = getTagConfig();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}