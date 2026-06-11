"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await api.post('/login', { email, password });
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 glow-accent" 
               style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3H8zm8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            CodeBox
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? 'var(--border)' : 'linear-gradient(135deg, #7c5cfc, #a855f7)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link href="/signup" className="font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
