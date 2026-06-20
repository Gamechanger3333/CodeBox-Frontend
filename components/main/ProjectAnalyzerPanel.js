"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '@/app/api';
import MessageRenderer from './MessageRenderer';

// ── Icons ──────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" style={{ width: 20, height: 20 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" style={{ width: 16, height: 16 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" style={{ width: 13, height: 13 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
    strokeLinecap="round" style={{ width: 14, height: 14 }}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotAvatar = () => (
  <div style={{
    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg viewBox="0 0 24 24" fill="white" style={{ width: 14, height: 14 }}>
      <polyline points="16 18 22 12 16 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <polyline points="8 6 2 12 8 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Spinner = ({ size = 16, dim = false }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid ${dim ? 'rgba(255,255,255,0.25)' : 'var(--border)'}`,
    borderTopColor: dim ? 'white' : 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
    flexShrink: 0,
  }} />
);

// ── Stat badge ─────────────────────────────────────────────────────────────────
const Stat = ({ label, value, accent }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 14px', borderRadius: 10,
    background: accent ? 'var(--accent-dim)' : 'var(--bg-elevated)',
    border: `1px solid ${accent ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
    minWidth: 64,
  }}>
    <span style={{ fontSize: 18, fontWeight: 700, color: accent ? 'var(--accent-bright)' : 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
      {value}
    </span>
    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</span>
  </div>
);

// ── Drop zone ──────────────────────────────────────────────────────────────────
const DropZone = ({ onFile, uploading }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a .zip file.');
      return;
    }
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '40px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, cursor: uploading ? 'not-allowed' : 'pointer',
        background: dragging ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        transition: 'all 0.15s',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef} type="file" accept=".zip"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploading ? (
        <>
          <Spinner size={28} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Analyzing your project…
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Extracting files, mapping structure, running AI review
            </p>
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <UploadIcon />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Drop your project ZIP here
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Download from GitHub → Code → Download ZIP, then drop it here.<br />
              Max 50 MB · Source files only (node_modules excluded automatically)
            </p>
          </div>
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            {['React', 'Next.js', 'Node.js', 'Python', 'Go', 'Vue', 'Django', 'any stack'].map(t => (
              <span key={t} style={{ padding: '3px 8px', borderRadius: 5, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>{t}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── File tree display ──────────────────────────────────────────────────────────
const FileTree = ({ tree }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: 'var(--bg-elevated)', border: 'none',
          cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderIcon /> File structure
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{open ? '▲ hide' : '▼ show'}</span>
      </button>
      {open && (
        <pre style={{
          padding: '12px 16px', margin: 0,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, lineHeight: 1.7,
          color: 'var(--text-secondary)', overflowX: 'auto', maxHeight: 260, overflowY: 'auto',
          background: 'var(--code-bg)',
        }}>
          {tree}
        </pre>
      )}
    </div>
  );
};

// ── Suggestion chips ───────────────────────────────────────────────────────────
const FOLLOW_UP_CHIPS = [
  { label: '🐛 Find bugs', text: 'List every bug you found with file references and how to fix each one.' },
  { label: '🔒 Security audit', text: 'Do a thorough security audit. Check for auth issues, injection risks, secrets in code, and missing validation.' },
  { label: '⚡ Performance', text: 'What are the biggest performance bottlenecks in this codebase and how should I fix them?' },
  { label: '🏗️ Refactor plan', text: 'Create a prioritized refactoring plan with specific files and changes.' },
  { label: '📝 Add tests', text: 'Which parts of the codebase most need tests? Write test cases for the three highest-risk functions.' },
  { label: '📦 Dependencies', text: 'Review the dependencies. Any outdated, unnecessary, or risky packages I should address?' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const ProjectAnalyzerPanel = () => {
  const [stage, setStage] = useState('upload'); // 'upload' | 'uploading' | 'analyzing' | 'ready'
  const [project, setProject] = useState(null);   // { name, stats, fileTree, analysis }
  const [messages, setMessages] = useState([]);   // { role, content }[]
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, asking]);

  // On mount: restore saved project session from DB (survives server restarts)
  useEffect(() => {
    api.get('/project/session').then(res => {
      const data = res.data;
      if (data.hasProject) {
        setProject({ name: data.projectName, stats: data.stats, fileTree: data.fileTree });
        const restored = [];
        if (data.analysis) restored.push({ role: 'assistant', content: data.analysis });
        if (Array.isArray(data.history)) restored.push(...data.history);
        setMessages(restored);
        setStage('ready');
      }
    }).catch(() => {});
  }, []);

  const handleUpload = async (file) => {
    setStage('uploading');
    try {
      const form = new FormData();
      form.append('project', file);
      const res = await api.post('/project/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { projectName, stats, fileTree, analysis } = res.data;
      setProject({ name: projectName, stats, fileTree });
      setMessages([{ role: 'assistant', content: analysis }]);
      setStage('ready');
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Make sure the file is a valid .zip archive.';
      toast.error(msg);
      setStage('upload');
    }
  };

  const handleAsk = async () => {
    const question = input.trim();
    if (!question || asking) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setAsking(true);
    try {
      const res = await api.post('/project/ask', { message: question });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setAsking(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await api.delete('/project/session');
    } catch {}
    setProject(null);
    setMessages([]);
    setStage('upload');
    setClearing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  // ── Upload stage ─────────────────────────────────────────────────────────────
  if (stage === 'upload' || stage === 'uploading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
            Project Analyzer
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Upload a full project ZIP and get an AI review of your entire codebase — bugs, security, architecture, and more.
          </p>
        </div>

        {/* Drop zone */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DropZone onFile={handleUpload} uploading={stage === 'uploading'} />

          {/* How it works */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How it works
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['📦', 'Upload ZIP', 'Download your repo from GitHub (Code → Download ZIP) and drop it here.'],
                ['🔍', 'AI reads every file', 'The analyzer maps your file structure and reads all source files — skipping node_modules, lock files, and binaries.'],
                ['📋', 'Get a full report', 'Receive a structured review covering architecture, bugs, security, performance, and improvements.'],
                ['💬', 'Ask follow-up questions', 'Chat with the AI about any part of your code — it remembers the entire project context.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 6 }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready stage: show analysis + chat ────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header bar */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
          }}>
            <FolderIcon />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Project loaded · Ask anything about your code</p>
          </div>
        </div>
        <button
          onClick={handleClear} disabled={clearing}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', cursor: clearing ? 'not-allowed' : 'pointer',
            transition: 'all 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {clearing ? <Spinner size={12} /> : <TrashIcon />}
          Clear project
        </button>
      </div>

      {/* Stats row */}
      {project?.stats && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          borderBottom: '1px solid var(--border)', flexShrink: 0,
          overflowX: 'auto', background: 'var(--bg-primary)',
        }}>
          <Stat label="Total files" value={project.stats.total} accent />
          <Stat label="Analyzed" value={project.stats.analyzed} />
          {project.stats.skipped > 0 && <Stat label="Skipped" value={project.stats.skipped} />}
          {project?.fileTree && (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <FileTree tree={project.fileTree} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {messages.map((msg, i) => (
              <div key={i} className="fade-in"
                style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {msg.role === 'assistant' && <BotAvatar />}
                <div style={{
                  maxWidth: '88%', padding: '12px 16px', fontSize: 13.5, lineHeight: 1.65,
                  ...(msg.role === 'user' ? {
                    background: 'var(--accent)', color: 'white',
                    borderRadius: '16px 16px 4px 16px',
                    fontFamily: 'Inter', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  } : {
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', borderRadius: '16px 16px 16px 4px',
                    width: '100%',
                  })
                }}>
                  {msg.role === 'assistant'
                    ? <MessageRenderer content={msg.content} />
                    : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {asking && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }} className="fade-in">
                <BotAvatar />
                <div style={{
                  padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  <div className="dot-1" /><div className="dot-2" /><div className="dot-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Suggestion chips (shown only when last message is from assistant and we're idle) */}
      {!asking && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
        <div style={{
          padding: '8px 16px 0', flexShrink: 0,
          display: 'flex', gap: 6, flexWrap: 'wrap',
          maxWidth: 760, margin: '0 auto', width: '100%',
          boxSizing: 'border-box',
        }}>
          {FOLLOW_UP_CHIPS.map(chip => (
            <button
              key={chip.label}
              onClick={() => { setInput(chip.text); textareaRef.current?.focus(); }}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: '10px 16px 14px', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '8px 10px 8px 14px',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <textarea
              ref={textareaRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder={asking ? 'Thinking about your codebase…' : 'Ask anything about this project…'}
              disabled={asking}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13.5, color: 'var(--text-primary)', resize: 'none',
                fontFamily: 'Inter', lineHeight: 1.6, maxHeight: 160, overflowY: 'auto',
              }}
            />
            <button
              onClick={handleAsk} disabled={asking || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 9, border: 'none', flexShrink: 0,
                cursor: (asking || !input.trim()) ? 'not-allowed' : 'pointer',
                background: (asking || !input.trim()) ? 'var(--bg-elevated)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {asking
                ? <Spinner size={14} dim />
                : <SendIcon />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 5 }}>
            Enter to send · Shift+Enter for new line · Full project context retained
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyzerPanel;