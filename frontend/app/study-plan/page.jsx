'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client.js';

export default function StudyPlanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/study-plan')
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await apiClient(`/study-plan/tasks/${taskId}`, {
        method: 'PUT',
        body: { status: nextStatus },
      });
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)),
      }));
    } catch (e) {
      alert(e.message || 'Error updating task');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Personal Study & Execution Plan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Custom roadmap dynamically tailored to your weak skills and learning goals.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {data?.plan?.title || 'Weekly Learning Schedule'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1.5rem' }}>
          {data?.plan?.goal || 'Build core market literacy and risk management discipline.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(data?.tasks || []).map((task) => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.status)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isDone ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: isDone ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  readOnly
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-bullish)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Type: {task.type} {task.dueDate && `• Due: ${task.dueDate}`}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: isDone ? 'var(--color-bullish)' : 'var(--text-muted)' }}>
                  {isDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
