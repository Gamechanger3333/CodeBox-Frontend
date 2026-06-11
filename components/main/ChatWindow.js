"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '@/app/api';
import MessageRenderer from './MessageRenderer';

const PROMPTS = [
  { icon: '🐛', label: 'Debug my code', text: 'Help me debug this code:' },
  { icon: '⚡', label: 'Optimize performance', text: 'How can I optimize this for better performance?' },
  { icon: '🏗️', label: 'Design architecture', text: 'Help me design the architecture for:' },
  { icon: '📝', label: 'Code review', text: 'Please review this code and suggest improvements:' },
  { icon: '🧪', label: 'Write tests', text: 'Help me write tests for this function:' },
  { icon: '📚', label: 'Explain concept', text: 'Explain how this works in simple terms:' },
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map(i => (
      <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

const BotIcon = ({ size = 'sm' }) => (
  <div className={`${size === 'sm' ? 'w-7 h-7' : 'w-10 h-10'} rounded-xl flex items-center justify-center flex-shrink-0`}
       style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}>
    <svg viewBox="0 0 24 24" className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} fill-white`}>
      <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3H8zm8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
    </svg>
  </div>
);

const WelcomeScreen = ({ onPromptClick }) => (
  <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-12 animate-fade-in">
    <div className="text-center">
      <BotIcon size="lg" />
      <h2 className="text-2xl font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
        CodeBox AI
      </h2>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        Your intelligent coding companion. Ask anything about programming, debugging, architecture, or learning new tech.
      </p>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
      {PROMPTS.map((p, i) => (
        <button
          key={i}
          onClick={() => onPromptClick(p.text)}
          className="flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all hover:scale-[1.02]"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span className="text-lg">{p.icon}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const ChatWindow = ({ conversationId, onNewMessage, onConversationCreated }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchMessages = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/get_conversation/${id}`);
      const fetched = res.data.conversation.messages.map(m => ({
        sender: m.sender,
        content: m.content,
        id: m.id,
      }));
      setMessages(fetched);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (sending || !text.trim()) return;
    const messageText = text.trim();
    setSending(true);
    setText('');

    try {
      let currentConvId = activeConversationId;

      if (!currentConvId) {
        const convRes = await api.post('/start_conversation', {});
        currentConvId = convRes.data.conversationId;
        setActiveConversationId(currentConvId);
        if (onConversationCreated) onConversationCreated(currentConvId);
      }

      const userMsg = { sender: 'user', content: messageText };
      setMessages(prev => [...prev, userMsg]);

      const res = await api.post('/send_message', {
        conversationId: currentConvId,
        message: messageText,
        sender: 'user',
      });

      const botMsg = { sender: 'bot', content: res.data.response };
      setMessages(prev => [...prev, botMsg]);
      if (onNewMessage) onNewMessage(currentConvId, res.data.title);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        content: '⚠️ Something went wrong. Please check your connection and try again.',
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const showWelcome = !activeConversationId && messages.length === 0;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-28 xl:px-40 pt-6 pb-36">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
          </div>
        ) : showWelcome ? (
          <WelcomeScreen onPromptClick={(t) => setText(t)} />
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <BotIcon />}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                  style={msg.sender === 'user' ? {
                    background: 'linear-gradient(135deg, #7c5cfc, #6d46ef)',
                    color: 'white',
                  } : {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <MessageRenderer content={msg.content} sender={msg.sender} />
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3 animate-fade-in">
                <BotIcon />
                <div className="rounded-2xl rounded-bl-sm border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 px-4 sm:px-8 pb-4 pt-4"
           style={{ background: 'linear-gradient(to top, var(--bg-primary) 80%, transparent)' }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={e => { setText(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder={sending ? 'CodeBox is thinking...' : 'Ask anything about code...'}
              disabled={sending}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'Syne, sans-serif',
                maxHeight: '160px',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !text.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
              style={{
                background: (sending || !text.trim()) ? 'var(--border)' : 'linear-gradient(135deg, #7c5cfc, #a855f7)',
                cursor: (sending || !text.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Enter to send · Shift+Enter for new line · CodeBox may make mistakes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
