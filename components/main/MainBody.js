"use client";
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/main/ChatWindow';
import ConversationsList from '@/components/main/ConversationsList';
import api from '@/app/api';
import Link from 'next/link';

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
         style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3H8zm8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
      </svg>
    </div>
    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>CodeBox</span>
  </div>
);

const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all"
    style={{
      background: active ? 'var(--accent-dim)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      border: active ? '1px solid rgba(124,92,252,0.25)' : '1px solid transparent',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
    {badge && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'white', fontSize: '10px' }}>{badge}</span>}
  </button>
);

// Code Analyzer panel
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
    <div className="flex flex-col h-full p-6 gap-4" style={{ overflowY: 'auto' }}>
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Code Analyzer</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paste your code for an instant AI review — quality, bugs, security, and improvements.</p>
      </div>

      <div className="flex gap-3">
        <input
          value={filename}
          onChange={e => setFilename(e.target.value)}
          placeholder="filename.js (optional)"
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: loading ? 'var(--border)' : 'var(--accent)' }}
        >
          {loading ? 'Analyzing...' : '🔍 Analyze'}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="// Paste your code here..."
          className="flex-1 p-4 rounded-xl text-sm resize-none outline-none leading-relaxed"
          style={{
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
            color: '#e2e8f0',
            fontFamily: 'JetBrains Mono, monospace',
            minHeight: '200px',
          }}
        />

        {result && (
          <div className="p-4 rounded-xl border prose-sm overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', maxHeight: '400px' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--accent)' }}>Analysis Result</h3>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Snippets panel
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
    try {
      const res = await api.get('/snippets');
      setSnippets(res.data.snippets);
    } catch { } finally { setLoading(false); }
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
    } catch { toast.error('Failed to save snippet'); }
    finally { setCreating(false); }
  };

  const deleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => prev.filter(s => s.id !== id));
      toast.success('Snippet deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const copySnippet = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4" style={{ overflowY: 'auto' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Snippets</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Save and reuse your code snippets</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--accent)' }}
        >
          {showForm ? '✕ Cancel' : '+ New Snippet'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Snippet title" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <input value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} placeholder="Language (e.g. javascript, python) — or leave blank to auto-detect" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }} />
          <textarea value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="// Your code here..." rows={6} className="w-full p-3 rounded-lg text-sm resize-none outline-none leading-relaxed" style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }} />
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <button onClick={createSnippet} disabled={creating} className="w-full py-2 rounded-lg text-sm font-semibold text-white" style={{ background: creating ? 'var(--border)' : 'var(--accent)' }}>
            {creating ? 'Saving...' : 'Save Snippet'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center mt-6"><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} /></div>
      ) : snippets.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-3">📦</p>
          <p className="text-sm">No snippets yet. Save frequently-used code here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snippets.map(s => (
            <div key={s.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                  {s.language && <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{s.language}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copySnippet(s.id, s.code)} className="text-xs px-2 py-1 rounded transition-all" style={{ color: copiedId === s.id ? 'var(--success)' : 'var(--text-muted)' }}>
                    {copiedId === s.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button onClick={() => deleteSnippet(s.id)} className="text-xs px-2 py-1 rounded hover:text-red-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Delete</button>
                </div>
              </div>
              <pre className="p-3 text-xs overflow-x-auto leading-relaxed" style={{ color: '#c4c4d4', fontFamily: 'JetBrains Mono, monospace', maxHeight: '150px' }}>
                {s.code}
              </pre>
              {s.description && <p className="px-4 pb-2 text-xs" style={{ color: 'var(--text-muted)' }}>{s.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
const MainBody = () => {
  const [conversationId, setConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [listRefresh, setListRefresh] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      if (data?.conversationId) setConversationId(data.conversationId);
    },
    onError: () => {},
  });

  const newChatMutation = useMutation({
    mutationFn: () => api.post('/start_conversation', {}),
    onSuccess: (res) => {
      setConversationId(res.data.conversationId);
      setActivePanel('chat');
      setListRefresh(n => n + 1);
      setSidebarOpen(false);
      toast.success('New chat started');
    },
    onError: () => toast.error('Failed to start chat'),
  });

  const handleLogout = async () => {
    try {
      await api.get('/logout');
      Cookies.remove('token');
      queryClient.clear();
      toast.success('Logged out');
      router.push('/login');
    } catch { toast.error('Logout failed'); }
  };

  const handleConversationCreated = (newId) => {
    setConversationId(newId);
    setListRefresh(n => n + 1);
  };

  const handleNewMessage = (convId, title) => {
    setListRefresh(n => n + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen grid-bg flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center glow-accent"
               style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
              <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3H8zm8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text">CodeBox</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>AI-powered coding assistant for developers</p>
          <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Debug faster. Learn deeper. Build better. Your intelligent coding companion is ready.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/login" className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
            Sign In
          </Link>
          <Link href="/signup" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            Create Account
          </Link>
        </div>

        <div className="flex gap-6 mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          {['🔍 Debug Code', '⚡ Optimize Performance', '📚 Learn Concepts', '🏗️ Design Architecture'].map((f, i) => (
            <span key={i}>{f}</span>
          ))}
        </div>
      </div>
    );
  }

  const userName = authData?.user?.name || 'Developer';

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 flex flex-col z-30 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <Logo />
          <button className="md:hidden text-lg" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={() => newChatMutation.mutate()}
            disabled={newChatMutation.isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}
          >
            {newChatMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <span>+</span>}
            New Chat
          </button>
        </div>

        {/* Nav */}
        <div className="px-3 space-y-0.5 pb-2">
          <NavItem icon="💬" label="Conversations" active={activePanel === 'chat'} onClick={() => setActivePanel('chat')} />
          <NavItem icon="🔍" label="Code Analyzer" active={activePanel === 'analyzer'} onClick={() => setActivePanel('analyzer')} />
          <NavItem icon="📦" label="Snippets" active={activePanel === 'snippets'} onClick={() => setActivePanel('snippets')} />
        </div>

        <div className="border-t mx-3" style={{ borderColor: 'var(--border)' }} />

        {/* Conversations list */}
        {activePanel === 'chat' && (
          <ConversationsList
            conversationId={conversationId}
            onSelectConversation={(id) => { setConversationId(id); setSidebarOpen(false); }}
            refresh={listRefresh}
          />
        )}

        {/* User info */}
        <div className="p-3 mt-auto border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
               style={{ background: 'var(--accent)', color: 'white' }}>
            {userName[0].toUpperCase()}
          </div>
          <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{userName}</span>
          <button
            onClick={handleLogout}
            className="text-xs px-2 py-1 rounded-lg transition-all hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
            title="Log out"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-secondary)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          </button>
          <Logo />
        </div>

        {activePanel === 'chat' && (
          <ChatWindow
            conversationId={conversationId}
            onNewMessage={handleNewMessage}
            onConversationCreated={handleConversationCreated}
          />
        )}
        {activePanel === 'analyzer' && (
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <CodeAnalyzerPanel />
          </div>
        )}
        {activePanel === 'snippets' && (
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <SnippetsPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default MainBody;
