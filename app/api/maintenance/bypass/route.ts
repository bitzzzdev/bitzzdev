import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, targetPath } = await request.json();

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

    // Create a maintenance bypass token (JWT or simple signed token)
    // For simplicity, we'll use a signed cookie approach
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
    
    // Create a simple bypass token
    const bypassToken = Buffer.from(
      JSON.stringify({
        email: ADMIN_EMAIL,
        timestamp: Date.now(),
        // Token valid for 24 hours
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString('base64');

    // Sign the token with HMAC
    const crypto = await import('crypto');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(bypassToken)
      .digest('hex');
    
    const signedToken = `${bypassToken}.${signature}`;

    const response = NextResponse.json({ 
      success: true, 
      targetPath: targetPath || '/' 
    });
    
    // Set the maintenance bypass cookie
    response.cookies.set('maintenance-bypass', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Maintenance bypass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}