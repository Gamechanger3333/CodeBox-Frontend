"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

// Fixed demo account — no signup/OTP needed. Password is intentionally
// public here: it's meant to be shared with recruiters/clients, and the
// backend resets this account's data on every login (see backend
// utils/demoUser.js), so there's nothing sensitive about exposing it
// client-side. Override via env if you change DEMO_USER_EMAIL / seed
// password on the backend.
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@codebox.com';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Demo@1234';

const EyeIcon = ({ open }) => open
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // If the user already has a valid session, don't show the login form —
  // the middleware only checks cookie presence, this confirms it's actually valid.
  useEffect(() => {
    api.get('/check_authentication')
      .then(() => router.replace('/'))
      .catch(() => setCheckingAuth(false));
  }, [router]);

  // Shared by the real login form and the demo button, so both paths stay
  // in sync (loading state, success/error toast, redirect).
  const doLogin = async (loginEmail, loginPassword) => {
    try {
      await api.post('/login', { email: loginEmail, password: loginPassword });
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || demoLoading) return;
    setLoading(true);
    await doLogin(email, password);
    setLoading(false);
  };

  // Fills the form with the demo credentials AND signs in immediately —
  // one click, no typing. The real signup/login form above is untouched
  // and still fully usable.
  const handleDemoLogin = async () => {
    if (loading || demoLoading) return;
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoLoading(true);
    await doLogin(DEMO_EMAIL, DEMO_PASSWORD);
    setDemoLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
           style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Top glow */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="flex items-center gap-3 relative z-10">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 18, color: 'white' }}><CodeIcon /></div>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', fontFamily: 'Inter' }}>CodeBox</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              The coding assistant<br />
              <span className="gradient-text">built for developers</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12, lineHeight: 1.7 }}>
              Debug faster, understand deeper, and write better code with your AI pair programmer.
            </p>
          </div>

          {[
            { icon: '🐛', title: 'Instant debugging', desc: 'Paste your error and get a fix in seconds' },
            { icon: '⚡', title: 'Code optimization', desc: 'Performance, security, and best practices' },
            { icon: '📚', title: 'Learn as you build', desc: 'Deep explanations with real examples' },
          ].map((f, i) => (
            <div key={i} className="flex gap-3" style={{ alignItems: 'flex-start' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{f.icon}</div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Powered by Groq · GPT-OSS 120B
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px] fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, color: 'white' }}><CodeIcon /></div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>CodeBox</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Sign in</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.02em' }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={demoLoading}
                className="input-base"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--accent-bright)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={demoLoading}
                  className="input-base"
                  style={{ paddingRight: 44, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || demoLoading} className="btn-primary" style={{ marginTop: 4 }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign in →'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            className="btn-primary"
            style={{
              marginTop: 12, width: '100%',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
            }}
            onMouseEnter={e => { if (!loading && !demoLoading) e.currentTarget.style.borderColor = 'var(--border-bright)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {demoLoading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--accent-bright)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Loading demo...
              </>
            ) : '🎭 Try Demo Account'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            No signup needed — explore CodeBox instantly with sample data
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>NEW TO CODEBOX</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Link href="/signup" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 500,
            color: 'var(--text-primary)', textDecoration: 'none',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}