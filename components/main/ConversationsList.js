"use client";
import { useState, useEffect } from 'react';
import api from '@/app/api';
import toast from 'react-hot-toast';

const ConversationsList = ({ conversationId, onSelectConversation, refresh }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [conversationId, refresh]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/getAllConversationIDs');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversation/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handlePin = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/conversation/${id}/pin`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned: res.data.isPinned } : c));
    } catch {
      toast.error('Failed to pin');
    }
  };

  const startEdit = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || `Chat ${conv.id.substring(0, 8)}`);
  };

  const saveTitle = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      await api.patch(`/conversation/${id}/title`, { title: editTitle });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle } : c));
    } catch { toast.error('Failed to rename'); }
    setEditingId(null);
  };

  if (loading) return (
    <div className="flex justify-center mt-6">
      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );

  if (!conversations.length) return (
    <p className="text-xs text-center mt-6 px-4" style={{ color: 'var(--text-muted)' }}>
      No conversations yet.<br/>Start chatting to see them here.
    </p>
  );

  const pinned = conversations.filter(c => c.isPinned);
  const unpinned = conversations.filter(c => !c.isPinned);

  const ConvItem = ({ conv }) => {
    const isActive = conv.id === conversationId;
    const title = conv.title || `Chat ${conv.id.substring(0, 8)}...`;

    return (
      <li
        onClick={() => onSelectConversation(conv.id)}
        className="group relative flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all animate-slide-in"
        style={{
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          border: isActive ? '1px solid rgba(124,92,252,0.3)' : '1px solid transparent',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0 fill-current" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>

        {editingId === conv.id ? (
          <input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={() => saveTitle(conv.id)}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(conv.id); if (e.key === 'Escape') setEditingId(null); }}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}
          />
        ) : (
          <span className="flex-1 text-xs truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {title}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          <button onClick={e => handlePin(e, conv.id)} className="p-1 rounded hover:text-white transition-colors"
            style={{ color: conv.isPinned ? 'var(--accent)' : 'var(--text-muted)' }} title={conv.isPinned ? 'Unpin' : 'Pin'}>
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17 4v7l2 3H5l2-3V4h10zm-5 16a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm7-7l-2-3V4H7v6L5 13h14z"/></svg>
          </button>
          <button onClick={e => startEdit(e, conv)} className="p-1 rounded hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }} title="Rename">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button onClick={e => handleDelete(e, conv.id)} className="p-1 rounded hover:text-red-400 transition-colors" style={{ color: 'var(--text-muted)' }} title="Delete">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="overflow-y-auto flex-1 px-2 space-y-1">
      {pinned.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest px-2 pt-2 pb-1" style={{ color: 'var(--text-muted)' }}>Pinned</p>
          <ul className="space-y-0.5">
            {pinned.map(conv => <ConvItem key={conv.id} conv={conv} />)}
          </ul>
          {unpinned.length > 0 && <p className="text-xs font-semibold uppercase tracking-widest px-2 pt-3 pb-1" style={{ color: 'var(--text-muted)' }}>Recent</p>}
        </>
      )}
      {!pinned.length && <p className="text-xs font-semibold uppercase tracking-widest px-2 pt-2 pb-1" style={{ color: 'var(--text-muted)' }}>Recent</p>}
      <ul className="space-y-0.5">
        {unpinned.map(conv => <ConvItem key={conv.id} conv={conv} />)}
      </ul>
    </div>
  );
};

export default ConversationsList;
