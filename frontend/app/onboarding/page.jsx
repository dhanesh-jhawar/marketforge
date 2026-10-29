'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api/client.js';

export default function OnboardingPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiClient('/onboarding/questions')
      .then((data) => setQuestions(data || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (qId, val, isMulti) => {
    setAnswers((prev) => {
      if (isMulti) {
        const cur = prev[qId] || [];
        const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
        return { ...prev, [qId]: next };
      }
      return { ...prev, [qId]: val };
    });
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setSubmitting(true);
      try {
        await apiClient('/onboarding/submit', { method: 'POST', body: answers });
        router.push('/dashboard');
      } catch (err) {
        console.warn('Onboarding error', err);
        router.push('/dashboard');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Onboarding Questionnaire...</div>;
  }

  const q = questions[currentIdx] || {
    id: 'exp',
    prompt: 'What is your background in Indian stocks?',
    type: 'single',
    options: [
      { value: 'none', label: 'Complete beginner — I want to understand terms like LTP & NIFTY' },
      { value: 'some', label: 'I know the basics — looking to learn risk management and discipline' },
      { value: 'active', label: 'Active trader — testing strategies in a simulated sandbox' },
    ],
  };

  const isSelected = (val) => {
    const cur = answers[q.id];
    return Array.isArray(cur) ? cur.includes(val) : cur === val;
  };

  return (
    <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '13px' }}>
          <span>STEP {currentIdx + 1} OF {Math.max(questions.length, 1)}</span>
          <span>MARKET LITERACY PROFILING</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.3 }}>
          {q.prompt}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
          {(q.options || []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(q.id, opt.value, q.type === 'multi')}
              style={{
                textAlign: 'left',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected(opt.value) ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected(opt.value) ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: 1.4,
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            disabled={currentIdx === 0}
            style={{ color: 'var(--text-secondary)', fontSize: '14px', opacity: currentIdx === 0 ? 0.3 : 1 }}
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {submitting ? 'Generating Desk...' : currentIdx < questions.length - 1 ? 'Continue →' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
