import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production');

// In-memory OTP store (shared with send endpoint)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();
const MAX_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const { email, code, callbackUrl } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    // Only allow admin email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    const record = otpStore.get(email);
    
    if (!record) {
      return NextResponse.json({ error: 'Code expired or not requested' }, { status: 401 });
    }

    // Check expiry
    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return NextResponse.json({ error: 'Code expired' }, { status: 401 });
    }

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email);
      return NextResponse.json({ error: 'Too many attempts' }, { status: 401 });
    }

    // Verify code
    if (record.code !== code) {
      record.attempts++;
      otpStore.set(email, record);
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    // Success - delete used code
    otpStore.delete(email);

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
    const response = NextResponse.json({ success: true, callbackUrl: callbackUrl || '/dashboard' });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}