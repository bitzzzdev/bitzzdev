import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

// Email transporter (configure with your SMTP provider)
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null; // Development mode - log to console
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPEmail(email: string, code: string): Promise<boolean> {
  const transporter = getTransporter();
  
  if (!transporter) {
    // Development mode - log OTP to console
    console.log(`[DEV MODE] OTP for ${email}: ${code}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || ADMIN_EMAIL,
      to: email,
      subject: 'Your Login Code',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Login Code</h2>
          <p>Use the following code to sign in:</p>
          <div style="background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Only allow admin email
    if (email !== ADMIN_EMAIL) {
      // Don't reveal if email is valid - return success anyway
      return NextResponse.json({ success: true, message: 'If the email is registered, a code has been sent' });
    }

    const code = generateOTP();
    const expires = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(email, { code, expires, attempts: 0 });

    const sent = await sendOTPEmail(email, code);
    
    if (!sent) {
      return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If the email is registered, a code has been sent',
      // In development, include the code for testing
      ...(process.env.NODE_ENV !== 'production' && { devCode: code })
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}