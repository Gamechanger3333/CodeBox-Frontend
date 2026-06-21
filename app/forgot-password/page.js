"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

// ── STEP 1: Enter Email ──────────────────────────────
function StepEmail({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      toast.success('OTP sent! Check your inbox.');
      onSuccess(email);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ width: 24, height: 24 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Forgot your password?</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          Enter the email address on your account and we&apos;ll send you a 6-digit reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required className="input-base" style={{ fontFamily: 'Inter' }} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Sending code...
            </>
          ) : 'Send reset code →'}
        </button>
      </form>
    </div>
  );
}

// ── STEP 2: Enter OTP ────────────────────────────────
function StepOTP({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (idx, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const next = [...otp]; next[idx] = ''; setOtp(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
        const next = [...otp]; next[idx - 1] = ''; setOtp(next);
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(next);
      inputRefs.current[Math.min(text.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await api.post('/verify-otp', { email, otp: code });
      toast.success('OTP verified!');
      onSuccess(res.data.resetToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/forgot-password', { email });
      toast.success('New OTP sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch { toast.error('Failed to resend'); }
    finally { setResending(false); }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <BackIcon /> Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🔐</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Enter your code</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. It expires in 10 minutes.
        </p>
      </div>

      {/* OTP boxes */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`otp-input${digit ? ' filled' : ''}`}
          />
        ))}
      </div>

      {/* Progress */}
      <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${(filled / 6) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.15s', borderRadius: 2 }} />
      </div>

      <button onClick={handleSubmit} disabled={loading || filled < 6} className="btn-primary" style={{ marginBottom: 16 }}>
        {loading ? (
          <>
            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Verifying...
          </>
        ) : 'Verify code →'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Didn&apos;t receive it?{' '}
        {countdown > 0
          ? <span style={{ color: 'var(--text-muted)' }}>Resend in {countdown}s</span>
          : <button onClick={resend} disabled={resending} style={{ color: 'var(--accent-bright)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              {resending ? 'Sending...' : 'Resend code'}
            </button>
        }
      </p>
    </div>
  );
}

// ── STEP 3: New Password ─────────────────────────────
function StepReset({ resetToken, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#6366f1'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/reset-password', { resetToken, password, passwordConfirm: confirm });
      toast.success('Password reset! Logging you in...');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{ width: 24, height: 24 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Set a new password</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Choose a strong password you haven&apos;t used before.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>New password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters" required className="input-base"
              style={{ paddingRight: 44, fontFamily: 'JetBrains Mono, monospace' }} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPw
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
            </button>
          </div>
          {password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--border)', transition: 'background 0.2s' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••" required className="input-base"
            style={{ fontFamily: 'JetBrains Mono, monospace',
              borderColor: confirm && password !== confirm ? 'var(--error)' : undefined }} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6 }}>
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Resetting...
            </>
          ) : 'Reset password →'}
        </button>
      </form>
    </div>
  );
}

// ── STEP 4: Success ──────────────────────────────────
function StepDone() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push('/'), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="fade-up" style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Password reset!</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Redirecting you to your workspace...</p>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset, 4=done
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  const steps = [
    { label: 'Email', active: step >= 1 },
    { label: 'Verify', active: step >= 2 },
    { label: 'Reset', active: step >= 3 },
  ];

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, color: 'white' }}><CodeIcon /></div>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>CodeBox</span>
        </Link>

        {/* Step indicator (only for steps 1-3) */}
        {step < 4 && (
          <div style={{ display: 'flex', align: 'center', gap: 0, marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: s.active ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `2px solid ${s.active ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: s.active ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--accent)' : 'var(--border)', margin: '0 4px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px' }}>
          {step === 1 && <StepEmail onSuccess={(em) => { setEmail(em); setStep(2); }} />}
          {step === 2 && <StepOTP email={email} onSuccess={(tok) => { setResetToken(tok); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <StepReset resetToken={resetToken} onSuccess={() => setStep(4)} />}
          {step === 4 && <StepDone />}
        </div>

        {step < 4 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
            Remembered it?{' '}
            <Link href="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}