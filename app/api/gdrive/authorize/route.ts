import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getDriveClient } from '@/lib/gdrive/client';
import { getSession } from '@/lib/auth';

/**
 * Authorize Google Drive access via dashboard
 * POST /api/gdrive/authorize
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }

    const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
    const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
    const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/gdrive/callback`;
    const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google Drive auth URL:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}