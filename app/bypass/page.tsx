'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function BypassForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/maintenance/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, targetPath: callbackUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Bypass failed');
      } else {
        router.push(data.targetPath || '/');
        router.refresh();
      }
    } catch {
      setErrorMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#e8e8e8] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-2xl font-semibold mb-2">Maintenance Bypass</h1>
        <p className="text-sm text-[#aaa] mb-6">Enter your credentials to bypass the maintenance mode.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Admin Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="w-full rounded-md border border-white/12 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-md border border-white/12 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>
          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white text-black px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Site'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function BypassPage() {
  return (
    <Suspense fallback={null}>
      <BypassForm />
    </Suspense>
  );
}
