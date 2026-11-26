import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getDriveClient, saveDriveToken } from '@/lib/gdrive/client';
import * as fs from 'fs';
import * as path from 'path';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/callback/drive`;

/**
 * Generate authorization URL for Google Drive access
 */
export async function GET(request: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Google Drive credentials not configured' }, { status: 500 });
  }

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

  // Save state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  const url = new URL(authUrl);
  url.searchParams.set('state', state);
  request.cookies.set('drive_auth_state', state, { httpOnly: true, maxAge: 3600 });

  return NextResponse.redirect(url.toString());
}