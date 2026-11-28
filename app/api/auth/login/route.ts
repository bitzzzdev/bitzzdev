import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SignJWT } from 'jose';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';
const ADMIN_PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').match(/([a-f0-9]{64})/i)?.[1] || (process.env.ADMIN_PASSWORD_HASH || '').trim();
const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || '';
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function verifyTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, totp, callbackUrl } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    if (!ADMIN_PASSWORD_HASH || !verifyPassword(password, ADMIN_PASSWORD_HASH)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check TOTP if configured
    if (ADMIN_TOTP_SECRET) {
      if (!totp || !verifyTOTP(totp, ADMIN_TOTP_SECRET)) {
        return NextResponse.json({ error: '2FA code required', requiresTOTP: true }, { status: 401 });
      }
    }

    // Create JWT token
    const token = await new SignJWT({
      id: '1',
      email: ADMIN_EMAIL,
      name: 'Admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({ success: true, callbackUrl: callbackUrl || '/' });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}