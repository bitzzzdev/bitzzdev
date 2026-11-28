import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { saveDriveToken, clearDriveToken } from '@/lib/gdrive/token';
import { getDriveClient } from '@/lib/gdrive/client';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/gdrive/callback`;

/**
 * Exchange authorization code for tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
    }

    // Extract tokens
    const tokenData = {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      expiry: tokens.expiry_date ? Date.now() + tokens.expiry_date * 1000 : Date.now() + 3600000,
    };

    // Save token
    saveDriveToken(tokenData);

    console.log('Google Drive authorization successful');
    clearDriveToken(); // Clear state cookie

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google Drive callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=drive_auth_failed', request.url)
    );
  }
}