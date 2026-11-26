'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'password' | 'otp';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const error = searchParams?.get('error');

  const [mode, setMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTotp, setShowTotp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totp: showTotp ? totp : undefined, callbackUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresTOTP) {
          setShowTotp(true);
          setErrorMessage('2FA code required');
        } else {
          setErrorMessage(data.error || 'Login failed');
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to send code');
      } else {
        setOtpSent(true);
        setErrorMessage('');
        // In development, show the code
        if (data.devCode) {
          setOtpCode(data.devCode);
        }
      }
    } catch {
      setErrorMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, callbackUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid code');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage('');
    setShowTotp(false);
    setOtpSent(false);
    setOtpCode('');
  };

  return (
    <div className="dashboard-login">
      <div className="login-card">
        <div className="login-header">
          <h1>Dashboard</h1>
          <p>Sign in to manage gallery and writings</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'password'}
            className={mode === 'password' ? 'active' : ''}
            onClick={() => switchMode('password')}
          >
            Password
          </button>
          <button
            role="tab"
            aria-selected={mode === 'otp'}
            className={mode === 'otp' ? 'active' : ''}
            onClick={() => switchMode('otp')}
          >
            Email Code
          </button>
        </div>

        {errorMessage && <div className="login-error">{errorMessage}</div>}
        {error && <div className="login-error">Authentication failed. Please try again.</div>}

        {mode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {showTotp && (
              <div className="form-group">
                <label htmlFor="totp">2FA Code</label>
                <input
                  id="totp"
                  type="text"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  disabled={loading}
                />
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'otp' && !otpSent && (
          <form onSubmit={handleOtpRequest} className="login-form">
            <div className="form-group">
              <label htmlFor="otp-email">Email</label>
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        )}

        {mode === 'otp' && otpSent && (
          <form onSubmit={handleOtpVerify} className="login-form">
            <div className="form-group">
              <label htmlFor="otp-code">Code</label>
              <input
                id="otp-code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                disabled={loading}
                autoFocus
              />
            </div>

            <p className="otp-note">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              className="resend-btn"
              onClick={() => setOtpSent(false)}
              disabled={loading}
            >
              Resend code
            </button>
          </form>
        )}

        <p className="login-note">
          Only accessible to the site owner. 2FA required if configured.
        </p>
      </div>

      <style jsx>{`
        .dashboard-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          color: var(--text);
        }
        .login-header p {
          margin: 0;
          color: var(--text-70);
          font-size: 0.95rem;
        }
        .auth-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-faint);
        }
        .auth-tabs button {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-70);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .auth-tabs button:hover {
          color: var(--text);
        }
        .auth-tabs button.active {
          color: var(--text);
          border-bottom-color: var(--text);
        }
        .login-error {
          padding: 0.75rem 1rem;
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid rgba(255, 60, 60, 0.3);
          border-radius: 6px;
          color: #ff6b6b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-70);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg);
          border: 1px solid var(--border-faint);
          border-radius: 6px;
          color: var(--text);
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--text);
        }
        .form-group input:disabled {
          opacity: 0.6;
        }
        .login-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .otp-note {
          margin: 0.5rem 0 1rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-70);
        }
        .resend-btn {
          width: 100%;
          padding: 0.625rem 1rem;
          margin-top: 0.75rem;
          background: transparent;
          border: 1px solid var(--border-faint);
          border-radius: 6px;
          color: var(--text-70);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .resend-btn:hover:not(:disabled) {
          border-color: var(--text);
          color: var(--text);
        }
        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-note {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-50);
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="dashboard-login">
        <div className="login-card">
          <div className="login-header">
            <h1>Dashboard</h1>
            <p>Sign in to manage gallery and writings</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}