"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/main/ChatWindow';
import ConversationsList from '@/components/main/ConversationsList';
import api from '@/app/api';
import Link from 'next/link';

// ── Icons ──────────────────────────────────────────────
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: '100%', height: '100%' }}>
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const AnalyzerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16 }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const SnippetsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16 }}>
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
// Hamburger — mobile only
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 20, height: 20 }}>
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
// Desktop sidebar toggle — chevron style
const SidebarOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="13 8 17 12 13 16"/>
  </svg>
);
const SidebarCloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="17 8 13 12 17 16"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 15, height: 15 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── useIsMobile hook ───────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// ── NavItem ────────────────────────────────────────────
const NavItem = ({ icon, label, active, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%',
        padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        background: active ? 'var(--accent-dim)' : hov ? 'var(--bg-elevated)' : 'transparent',
        color: active ? 'var(--accent-bright)' : hov ? 'var(--text-primary)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
        cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'Inter',
      }}>
      {icon}<span>{label}</span>
    </button>
  );
};

// ── Code Analyzer ──────────────────────────────────────
const CodeAnalyzerPanel = () => {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!code.trim()) { toast.error('Paste some code first'); return; }
    setLoading(true);
    try {
      const res = await api.post('/analyze_code', { code, filename: filename || 'code.txt' });
      setResult(res.data.analysis);
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Code Analyzer</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI-powered code review — bugs, security, performance.</p>
      </div>
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={filename} onChange={e => setFilename(e.target.value)}
            placeholder="filename.js (optional)"
            className="input-base" style={{ flex: 1, minWidth: 140, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }} />
          <button onClick={analyze} disabled={loading}
            style={{
              padding: '0 16px', height: 42, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white',
              background: loading ? 'var(--bg-elevated)' : 'var(--accent)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
            {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Analyzing...</> : '🔍 Analyze'}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: '10px 10px 0 0', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderBottom: 'none' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ef4444','#f59e0b','#22c55e'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{filename || 'code'}</span>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)}
            placeholder={'// Paste your code here...\nfunction example() {\n  // ...\n}'}
            style={{ width: '100%', minHeight: 220, padding: '14px 16px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '0 0 10px 10px', color: '#c8c8ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.7, resize: 'vertical', outline: 'none' }} />
        </div>
        {result && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-bright)' }}>Analysis</span>
              <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>Copy</button>
            </div>
            <div style={{ padding: '16px', maxHeight: 380, overflowY: 'auto' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', fontFamily: 'Inter' }}>{result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Snippets ───────────────────────────────────────────
const SnippetsPanel = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', language: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchSnippets(); }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    try { const res = await api.get('/snippets'); setSnippets(res.data.snippets); } catch {} finally { setLoading(false); }
  };

  const createSnippet = async () => {
    if (!form.title || !form.code) { toast.error('Title and code required'); return; }
    setCreating(true);
    try {
      const res = await api.post('/snippets', form);
      setSnippets(prev => [res.data.snippet, ...prev]);
      setForm({ title: '', code: '', language: '', description: '' });
      setShowForm(false);
      toast.success('Snippet saved!');
    } catch { toast.error('Failed to save'); } finally { setCreating(false); }
  };

  const deleteSnippet = async (id) => {
    try { await api.delete(`/snippets/${id}`); setSnippets(prev => prev.filter(s => s.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Code Snippets</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Save and reuse frequently used code.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', background: showForm ? 'var(--bg-elevated)' : 'var(--accent)', border: `1px solid ${showForm ? 'var(--border)' : 'transparent'}`, cursor: 'pointer' }}>
          {showForm ? '✕' : '+ New'}
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {showForm && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} className="fade-up">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Snippet title" className="input-base" style={{ fontSize: 13 }} />
            <input value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} placeholder="Language (e.g. javascript)" className="input-base" style={{ fontSize: 13, fontFamily: 'JetBrains Mono' }} />
            <textarea value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="// Your code here..." rows={5}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: 8, color: '#c8c8ff', fontFamily: 'JetBrains Mono', fontSize: 13, resize: 'vertical', outline: 'none', lineHeight: 1.6 }} />
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className="input-base" style={{ fontSize: 13 }} />
            <button onClick={createSnippet} disabled={creating}
              style={{ padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', background: creating ? 'var(--bg-elevated)' : 'var(--accent)', border: 'none', cursor: creating ? 'not-allowed' : 'pointer' }}>
              {creating ? 'Saving...' : 'Save Snippet'}
            </button>
          </div>
        )}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : snippets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 14 }}>No snippets yet</p>
          </div>
        ) : snippets.map(s => (
          <div key={s.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</span>
                {s.language && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent-bright)', border: '1px solid rgba(99,102,241,0.2)' }}>{s.language}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText(s.code); setCopiedId(s.id); setTimeout(() => setCopiedId(null), 2000); }}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: copiedId === s.id ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }}>
                  {copiedId === s.id ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={() => deleteSnippet(s.id)}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.color = '#ef4444'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Delete</button>
              </div>
            </div>
            <pre style={{ padding: '10px 14px', fontSize: 12, color: '#c8c8ff', fontFamily: 'JetBrains Mono', maxHeight: 160, overflowY: 'auto', overflowX: 'auto', lineHeight: 1.6 }}>{s.code}</pre>
            {s.description && <div style={{ padding: '6px 14px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{s.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Landing ────────────────────────────────────────────
const LandingScreen = () => (
  <div className="min-h-screen grid-bg" style={{ background: 'var(--bg-primary)' }}>
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, color: 'white' }}><CodeIcon /></div>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>CodeBox</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/login" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid var(--border)' }}>Sign in</Link>
        <Link href="/signup" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', textDecoration: 'none', background: 'var(--accent)' }}>Get started →</Link>
      </div>
    </nav>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px)', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 24 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 8px var(--accent)' }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-bright)' }}>Powered by Groq / Llama 3.3 70B</span>
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 16, maxWidth: 680 }}>
        The AI coding assistant<br /><span className="gradient-text">built for developers</span>
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
        Debug faster, understand deeper, and write better code with your AI pair programmer.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/signup" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: 'white', textDecoration: 'none', background: 'var(--accent)', boxShadow: '0 4px 24px var(--accent-glow)' }}>Start for free →</Link>
        <Link href="/login" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>Sign in</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 780, width: '100%' }}>
        {[
          { icon: '🐛', title: 'Instant Debugging', desc: 'Paste your error and get a precise fix with explanation in seconds.' },
          { icon: '⚡', title: 'Code Optimization', desc: 'Performance, security, readability — get actionable improvements.' },
          { icon: '🏗️', title: 'Architecture Design', desc: 'Design scalable systems with best-practice guidance.' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '18px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'left' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── SIDEBAR WIDTH ──────────────────────────────────────
const SIDEBAR_W = 252;

// ── Main App ───────────────────────────────────────────
const MainBody = () => {
  const [conversationId, setConversationId] = useState(null);
  // Desktop: sidebar hidden by default; Mobile: sidebar hidden by default
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [listRefresh, setListRefresh] = useState(0);
  const isMobile = useIsMobile();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Close sidebar whenever viewport changes (e.g. rotating device)
  useEffect(() => { setSidebarOpen(false); }, [isMobile]);

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: () => api.get('/check_authentication').then(r => r.data),
    retry: false,
    onError: () => {},
  });

  const authenticated = !!authData;

  useQuery({
    queryKey: ['latestConversation'],
    queryFn: () => api.get('/latest_conversation').then(r => r.data),
    enabled: authenticated,
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => { if (data?.conversationId) setConversationId(data.conversationId); },
    onError: () => {},
  });

  const newChatMutation = useMutation({
    mutationFn: () => api.post('/start_conversation', {}),
    onSuccess: (res) => {
      setConversationId(res.data.conversationId);
      setActivePanel('chat');
      setListRefresh(n => n + 1);
      setSidebarOpen(false);
    },
    onError: () => toast.error('Failed to start chat'),
  });

  const handleLogout = async () => {
    try {
      await api.get('/logout');
      Cookies.remove('token');
      queryClient.clear();
      router.push('/login');
    } catch { toast.error('Logout failed'); }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!authenticated) return <LandingScreen />;

  const userName = authData?.user?.name || 'Developer';
  const userInitial = userName[0]?.toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* Overlay — both mobile and desktop when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: isMobile ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)',
            zIndex: 40,
            backdropFilter: isMobile ? 'blur(4px)' : 'none',
          }}
        />
      )}

      {/* ── Sidebar — always fixed/slide-in for both mobile & desktop ── */}
      <aside style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
        transition: 'transform 0.25s ease',
      }}>
        {/* Logo + close button */}
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 15, color: 'white' }}><CodeIcon /></div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>CodeBox</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* New Chat */}
        <div style={{ padding: '10px 10px 8px' }}>
          <button onClick={() => newChatMutation.mutate()} disabled={newChatMutation.isLoading}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Inter', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            {newChatMutation.isLoading
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <PlusIcon />}
            New conversation
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <NavItem icon={<ChatIcon />} label="Chat" active={activePanel === 'chat'} onClick={() => { setActivePanel('chat'); setSidebarOpen(false); }} />
          <NavItem icon={<AnalyzerIcon />} label="Code Analyzer" active={activePanel === 'analyzer'} onClick={() => { setActivePanel('analyzer'); setSidebarOpen(false); }} />
          <NavItem icon={<SnippetsIcon />} label="Snippets" active={activePanel === 'snippets'} onClick={() => { setActivePanel('snippets'); setSidebarOpen(false); }} />
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 12px 6px' }} />

        {/* Conversations list */}
        {activePanel === 'chat' && (
          <ConversationsList
            conversationId={conversationId}
            onSelectConversation={(id) => { setConversationId(id); setSidebarOpen(false); }}
            refresh={listRefresh}
          />
        )}

        {/* User footer */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {userInitial}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
          <button onClick={handleLogout} title="Sign out"
            style={{ width: 28, height: 28, borderRadius: 7, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* ── Main content — full width always (sidebar overlays it) ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        width: '100%',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          {/* Mobile: hamburger (inline, mobile-only) */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              title="Open menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                flexShrink: 0,
              }}>
              <MenuIcon />
            </button>
          )}

          {/* Desktop: sidebar toggle button (not hamburger) */}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              style={{
                background: sidebarOpen ? 'var(--accent-dim)' : 'none',
                border: `1px solid ${sidebarOpen ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
                color: sidebarOpen ? 'var(--accent-bright)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                borderRadius: 7,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!sidebarOpen) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!sidebarOpen) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
              {sidebarOpen ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
            </button>
          )}

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, color: 'white' }}><CodeIcon /></div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>CodeBox</span>
          </div>

          {/* Panel tabs */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {['chat', 'analyzer', 'snippets'].map(p => (
              <button key={p} onClick={() => setActivePanel(p)}
                style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', border: 'none',
                  background: activePanel === p ? 'var(--accent-dim)' : 'transparent',
                  color: activePanel === p ? 'var(--accent-bright)' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}>
                {p === 'analyzer' ? (isMobile ? 'AI' : 'Analyzer') : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activePanel === 'chat' && (
            <ChatWindow
              conversationId={conversationId}
              onNewMessage={() => setListRefresh(n => n + 1)}
              onConversationCreated={(id) => { setConversationId(id); setListRefresh(n => n + 1); }}
            />
          )}
          {activePanel === 'analyzer' && <div style={{ flex: 1, overflowY: 'auto' }}><CodeAnalyzerPanel /></div>}
          {activePanel === 'snippets' && <div style={{ flex: 1, overflowY: 'auto' }}><SnippetsPanel /></div>}
        </div>
      </main>
    </div>
  );
};

export default MainBody;
