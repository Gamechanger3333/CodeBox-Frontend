"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/app/api';
import MessageRenderer from './MessageRenderer';

const PROMPTS = [
  { icon: '🐛', label: 'Debug code', text: 'Help me debug this error:\n\n```\n\n```' },
  { icon: '⚡', label: 'Optimize', text: 'How can I optimize this code for better performance?\n\n```\n\n```' },
  { icon: '🏗️', label: 'Architecture', text: 'Help me design the architecture for:' },
  { icon: '📝', label: 'Code review', text: 'Please review this code:\n\n```\n\n```' },
  { icon: '🧪', label: 'Write tests', text: 'Write unit tests for this function:\n\n```\n\n```' },
  { icon: '📚', label: 'Explain', text: 'Explain how this works in simple terms:' },
];

const BotAvatar = () => (
  <div style={{
    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg viewBox="0 0 24 24" fill="white" style={{ width: 16, height: 16 }}>
      <polyline points="16 18 22 12 16 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <polyline points="8 6 2 12 8 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  </div>
);

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }} className="fade-in">
    <BotAvatar />
    <div style={{
      padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
      display: 'flex', gap: 5, alignItems: 'center',
    }}>
      <div className="dot-1" /><div className="dot-2" /><div className="dot-3" />
    </div>
  </div>
);

const WelcomeScreen = ({ onPromptClick }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 32, padding: '40px 24px' }} className="fade-in">
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
      }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
          <polyline points="16 18 22 12 16 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <polyline points="8 6 2 12 8 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>How can I help you today?</h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 340 }}>
        Ask about debugging, architecture, optimization, or anything code-related.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 520 }}>
      {PROMPTS.map((p, i) => (
        <button key={i} onClick={() => onPromptClick(p.text)}
          style={{
            padding: '12px 14px', borderRadius: 12, textAlign: 'left',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <span style={{ fontSize: 18 }}>{p.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{p.label}</span>
        </button>
      ))}
    </div>

    <div style={{
      display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
      fontSize: 11, color: 'var(--text-muted)',
    }}>
      {['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Docker', 'Go'].map(lang => (
        <span key={lang} style={{ padding: '3px 8px', borderRadius: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{lang}</span>
      ))}
    </div>
  </div>
);

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500,
      background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
      color: copied ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
};

const ChatWindow = ({ conversationId, onNewMessage, onConversationCreated }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { setActiveConversationId(conversationId); }, [conversationId]);

  useEffect(() => {
    if (activeConversationId) fetchMessages(activeConversationId);
    else setMessages([]);
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchMessages = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/get_conversation/${id}`);
      setMessages(res.data.conversation.messages.map(m => ({ sender: m.sender, content: m.content, id: m.id })));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (sending || !text.trim()) return;
    const messageText = text.trim();
    setSending(true);
    setText('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    try {
      let currentConvId = activeConversationId;
      if (!currentConvId) {
        const convRes = await api.post('/start_conversation', {});
        currentConvId = convRes.data.conversationId;
        setActiveConversationId(currentConvId);
        if (onConversationCreated) onConversationCreated(currentConvId);
      }

      setMessages(prev => [...prev, { sender: 'user', content: messageText }]);

      const res = await api.post('/send_message', {
        conversationId: currentConvId,
        message: messageText,
        sender: 'user',
      });

      setMessages(prev => [...prev, { sender: 'bot', content: res.data.response }]);
      if (onNewMessage) onNewMessage(currentConvId, res.data.title);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', content: '⚠️ Something went wrong. Please check your connection and try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  const showWelcome = !activeConversationId && messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 140 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : showWelcome ? (
            <WelcomeScreen onPromptClick={(t) => { setText(t); textareaRef.current?.focus(); }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {messages.map((msg, i) => (
                <div key={i} className="fade-in"
                  style={{ display: 'flex', gap: 10, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  {msg.sender === 'bot' && <BotAvatar />}
                  <div style={{
                    maxWidth: '82%', padding: '12px 16px', fontSize: 14, lineHeight: 1.6,
                    ...(msg.sender === 'user' ? {
                      background: 'var(--accent)', color: 'white',
                      borderRadius: '18px 18px 4px 18px',
                      fontFamily: 'Inter', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    } : {
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', borderRadius: '18px 18px 18px 4px',
                    })
                  }}>
                    {msg.sender === 'bot'
                      ? <MessageRenderer content={msg.content} />
                      : msg.content}
                  </div>
                </div>
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 20px 16px',
        background: 'linear-gradient(to top, var(--bg-primary) 80%, transparent)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '10px 12px 10px 16px',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <textarea
              ref={textareaRef} rows={1} value={text}
              onChange={e => { setText(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder={sending ? 'CodeBox is thinking...' : 'Ask about code, debugging, architecture...'}
              disabled={sending}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--text-primary)', resize: 'none',
                fontFamily: 'Inter', lineHeight: 1.6, maxHeight: 180, overflowY: 'auto',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {text && !sending && (
                <button onClick={() => { setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }}
                  style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  ✕
                </button>
              )}
              <button onClick={handleSubmit} disabled={sending || !text.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: (sending || !text.trim()) ? 'not-allowed' : 'pointer',
                  background: (sending || !text.trim()) ? 'var(--bg-elevated)' : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s', flexShrink: 0,
                }}>
                {sending
                  ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter to send · Shift+Enter for new line · Powered by Groq / Llama 3.3 70B</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
