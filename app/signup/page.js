"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (form.password !== form.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/signup', form);
      toast.success('Account created! Welcome to CodeBox 🚀');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Developer' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'passwordConfirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 glow-accent"
               style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3H8zm8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Join CodeBox</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your AI coding companion awaits
          </p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontFamily: name === 'name' ? 'Syne, sans-serif' : 'JetBrains Mono, monospace',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'var(--border)' : 'linear-gradient(135deg, #7c5cfc, #a855f7)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
