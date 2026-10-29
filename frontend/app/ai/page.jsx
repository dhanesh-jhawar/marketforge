'use client';
import { useState } from 'react';
import { useAI } from '../../context/AIContext.jsx';

export default function AIPage() {
  const { messages, loading, sendMessage } = useAI();
  const [input, setInput] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input;
    setInput('');
    await sendMessage(txt);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>MarketForge AI Pedagogical Assistant</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '0.25rem' }}>
          Ask questions regarding SEBI guidelines, order types, risk management rules, or financial concepts.
        </p>
      </div>

      {/* Message History */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
            Hello! I am your MarketForge learning mentor. Ask me anything about how the Indian stock market works, order mechanics, or risk discipline.
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={i}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isUser ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {m.content}
              </div>
            );
          })
        )}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: '13px' }}>
            Thinking...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the Indian stock market..."
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.85rem 1.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)',
            color: 'var(--text-inverse)',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
