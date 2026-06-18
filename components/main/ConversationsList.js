"use client";
import { useState, useEffect, useRef } from 'react';
import api from '@/app/api';
import toast from 'react-hot-toast';

const PinIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12 }}>
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const ConversationsList = ({ conversationId, onSelectConversation, refresh }) => {
  const [conversations, setConversations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const editRef = useRef(null);

  useEffect(() => { fetchConversations(); }, [refresh]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/getAllConversationIDs');
      setConversations(res.data);
    } catch {}
  };

  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversation/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const togglePin = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/conversation/${id}/pin`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned: res.data.isPinned } : c));
    } catch {}
  };

  const startEdit = (e, c) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title || '');
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      await api.patch(`/conversation/${id}/title`, { title: editTitle.trim() });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
    } catch {}
    setEditingId(null);
  };

  const grouped = {
    pinned: conversations.filter(c => c.isPinned),
    today: conversations.filter(c => !c.isPinned && isToday(c.createdAt)),
    older: conversations.filter(c => !c.isPinned && !isToday(c.createdAt)),
  };

  const renderGroup = (label, items) => {
    if (!items.length) return null;
    return (
      <div key={label} style={{ marginBottom: 8 }}>
        <div style={{ padding: '4px 10px 2px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
        {items.map(c => (
          <ConvItem key={c.id} c={c} active={c.id === conversationId}
            onSelect={() => onSelectConversation(c.id)}
            onDelete={deleteConversation}
            onPin={togglePin}
            editing={editingId === c.id}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            onStartEdit={startEdit}
            onSaveEdit={() => saveEdit(c.id)}
            editRef={editRef}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {conversations.length === 0 ? (
        <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          No conversations yet
        </div>
      ) : (
        <>
          {renderGroup('Pinned', grouped.pinned)}
          {renderGroup('Today', grouped.today)}
          {renderGroup('Earlier', grouped.older)}
        </>
      )}
    </div>
  );
};

const ConvItem = ({ c, active, onSelect, onDelete, onPin, editing, editTitle, setEditTitle, onStartEdit, onSaveEdit, editRef }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 6px', margin: '1px 4px',
        borderRadius: 8, cursor: 'pointer',
        background: active ? 'var(--accent-dim)' : hovered ? 'var(--bg-elevated)' : 'transparent',
        border: `1px solid ${active ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
        transition: 'background 0.1s',
        minHeight: 34,
      }}>
      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 4px' }}>
        {editing ? (
          <input
            ref={editRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={() => onSaveEdit(c.id)}
            onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(c.id); if (e.key === 'Escape') { /* cancel */ } }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--accent)', borderRadius: 5,
              padding: '2px 6px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
        ) : (
          <div style={{
            fontSize: 13, fontWeight: active ? 500 : 400,
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {c.title || 'New conversation'}
          </div>
        )}
      </div>

      {(hovered || active) && !editing && (
        <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <IconBtn onClick={(e) => onPin(e, c.id)} title={c.isPinned ? 'Unpin' : 'Pin'}
            color={c.isPinned ? 'var(--accent)' : 'var(--text-muted)'}>
            <PinIcon filled={c.isPinned} />
          </IconBtn>
          <IconBtn onClick={(e) => onStartEdit(e, c)} title="Rename" color="var(--text-muted)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>
          <IconBtn onClick={(e) => onDelete(e, c.id)} title="Delete" color="var(--text-muted)" hoverColor="#ef4444">
            <TrashIcon />
          </IconBtn>
        </div>
      )}
    </div>
  );
};

const IconBtn = ({ onClick, title, color, hoverColor, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov && hoverColor ? hoverColor : color, transition: 'color 0.1s',
      }}>
      {children}
    </button>
  );
};

const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export default ConversationsList;
