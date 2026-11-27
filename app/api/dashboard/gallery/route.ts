import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth';
import { getGalleryImages, getGalleryImage, deleteGalleryImage } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const images = await getGalleryImages();
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}