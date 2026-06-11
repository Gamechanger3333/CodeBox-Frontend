"use client";
import { useState } from 'react';

// Lightweight code block with syntax highlighting using CSS classes
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-bright)', background: 'var(--code-bg)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: '#0a0a0c' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="text-xs px-2 py-1 rounded-md transition-all flex items-center gap-1"
          style={{
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
          }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Parse markdown to React elements (lightweight, no heavy libraries needed)
const parseMarkdown = (text) => {
  const elements = [];
  const lines = text.split('\n');
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={key++} code={codeLines.join('\n')} language={lang} />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-bold mt-4 mb-1" style={{ color: 'var(--text-primary)' }}>{line.slice(4)}</h3>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(3)}</h2>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(2)}</h1>);
      i++; continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={key++} className="my-4 border-t" style={{ borderColor: 'var(--border)' }} />);
      i++; continue;
    }

    // Bullet list
    if (line.match(/^[-*+] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-1 my-2 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm flex gap-2" style={{ color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)' }}>•</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="space-y-1 my-2 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm flex gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="font-mono text-xs pt-0.5" style={{ color: 'var(--accent)', minWidth: '16px' }}>{idx + 1}.</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-2 pl-3 py-0.5 my-2 italic text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>
          {line.slice(2)}
        </blockquote>
      );
      i++; continue;
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
};

// Inline formatting: bold, italic, inline code
const inlineFormat = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  const parts = [];
  let remaining = text;
  let key = 0;

  // Simple inline code
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|⚠️[^⚠]*|💡[^💡]*|✅[^✅]*|❌[^❌]*)/g;
  const split = remaining.split(regex);
  
  return split.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-elevated)', color: '#c084fc', fontFamily: 'JetBrains Mono, monospace' }}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold" style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} style={{ color: 'var(--text-secondary)' }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const MessageRenderer = ({ content, sender }) => {
  if (sender === 'user') {
    return <span className="text-sm leading-relaxed whitespace-pre-wrap">{content}</span>;
  }
  return <div className="space-y-0.5">{parseMarkdown(content)}</div>;
};

export default MessageRenderer;
