import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production');

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: SessionUser;
}

export async function getSession(request?: NextRequest): Promise<Session | null> {
  try {
    const cookieHeader = request?.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
      },
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<Session> {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}