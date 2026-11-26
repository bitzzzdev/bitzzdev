import { NextRequest, NextResponse } from 'next/server';
import { clearDriveToken } from '@/lib/gdrive/token';

/**
 * POST /api/gdrive/revoke
 * Clear the stored Google Drive token.
 */
export async function POST(request: NextRequest) {
  try {
    clearDriveToken();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
