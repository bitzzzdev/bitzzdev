import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth';
import { getWritingPosts, deleteWritingPost } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = getWritingPosts(false); // Include unpublished for dashboard
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Writings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}