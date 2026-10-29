'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminRulesPage() {
  const [rules, setRules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient('/admin/rules')
      .then((data) => setRules(data || []))
      .catch(() => setRules([]));
  }, []);

  const handleUpdate = async (ruleId, newSeverity, newValue) => {
    setSaving(true);
    try {
      await apiClient('/admin/rules', {
        method: 'PUT',
        body: { id: ruleId, severity: newSeverity, value: newValue },
      });
      alert('Risk rule updated and logged to audit trail.');
    } catch (err) {
      alert(err.message || 'Error updating rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Deterministic Risk Rules Engine</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Configure thresholds enforced by the backend risk engine before orders can reach the matching engine.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {rules.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.label || r.id}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{r.description}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Threshold / Value:</span>
                <input
                  type="text"
                  defaultValue={typeof r.value === 'object' ? JSON.stringify(r.value) : r.value}
                  id={`val-${r.id}`}
                  style={{
                    width: '80px',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                  }}
                />

                <select
                  defaultValue={r.severity || 'BLOCKING'}
                  id={`sev-${r.id}`}
                  style={{
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="BLOCKING">BLOCKING</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>

                <button
                  onClick={() => {
                    const val = document.getElementById(`val-${r.id}`).value;
                    const sev = document.getElementById(`sev-${r.id}`).value;
                    handleUpdate(r.id, sev, isNaN(Number(val)) ? val : Number(val));
                  }}
                  disabled={saving}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 229, 255, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
