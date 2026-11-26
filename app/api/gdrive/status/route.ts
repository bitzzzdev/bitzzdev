import { NextResponse } from 'next/server';
import { hasValidDriveToken } from '@/lib/gdrive/token';

/**
 * GET /api/gdrive/status
 * Check if Google Drive is connected and folders are configured.
 */
export async function GET() {
  try {
    const connected = hasValidDriveToken();
    const configured = !!process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;

    return NextResponse.json({
      connected,
      configured,
    });
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
