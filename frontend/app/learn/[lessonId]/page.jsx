'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api/client.js';

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params?.lessonId;
  const [lesson, setLesson] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!lessonId) return;
    apiClient(`/learning/lessons/${lessonId}`)
      .then((data) => setLesson(data))
      .catch(() => setLesson(null))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      await apiClient(`/learning/lessons/${lessonId}/complete`, { method: 'POST' });
      setCompleted(true);
    } catch (e) {
      alert(e.message || 'Error completing lesson');
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!lesson?.quiz?.id) return;
    try {
      const res = await apiClient(`/quiz/${lesson.quiz.id}/submit`, {
        method: 'POST',
        body: { answers: quizAnswers },
      });
      setQuizResult(res);
      if (res.passed) {
        setCompleted(true);
      }
    } catch (err) {
      alert(err.message || 'Quiz submission failed');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading lesson...</div>;
  if (!lesson) return <div style={{ textAlign: 'center', padding: '5rem' }}>Lesson not found.</div>;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <button
        onClick={() => router.push('/learn')}
        style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Curriculum
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
          {lesson.skillArea?.replace(/_/g, ' ')}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{lesson.estimatedMinutes} minutes</span>
      </div>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
        {lesson.title}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
        {lesson.summary}
      </p>

      {/* Lesson Content Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {(lesson.blocks || []).map((block, i) => {
          if (block.type === 'callout') {
            return (
              <div
                key={i}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 229, 255, 0.08)',
                  borderLeft: '4px solid var(--accent-cyan)',
                  fontSize: '15px',
                  lineHeight: 1.6,
                }}
              >
                {block.data?.md}
              </div>
            );
          }
          return (
            <div key={i} style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
              {block.data?.md}
            </div>
          );
        })}
      </div>

      {/* Embedded Quiz if Present */}
      {lesson.quiz && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Knowledge Check: {lesson.quiz.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '1.5rem' }}>
            Pass threshold: {lesson.quiz.passPct}%
          </p>

          <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(lesson.quiz.questions || []).map((q, qIdx) => (
              <div key={q.id}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '0.75rem' }}>
                  {qIdx + 1}. {q.prompt}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(q.options || []).map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: quizAnswers[q.id] === optIdx ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={quizAnswers[q.id] === optIdx}
                        onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 2rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)',
                color: 'var(--text-inverse)',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Submit Quiz
            </button>
          </form>

          {quizResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: quizResult.passed ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                border: `1px solid ${quizResult.passed ? 'var(--color-bullish)' : 'var(--color-bearish)'}`,
                color: quizResult.passed ? 'var(--color-bullish)' : 'var(--color-bearish)',
              }}
            >
              Score: {quizResult.scorePct}% — {quizResult.passed ? 'Passed! XP awarded.' : 'Try again to master this skill.'}
            </div>
          )}
        </div>
      )}

      {/* Completion Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleComplete}
          disabled={completed}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: 'var(--radius-md)',
            background: completed ? 'rgba(0, 230, 118, 0.2)' : 'linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)',
            color: completed ? 'var(--color-bullish)' : 'var(--text-inverse)',
            fontWeight: 700,
            fontSize: '15px',
          }}
        >
          {completed ? '✔ Lesson Completed' : 'Mark as Complete (+50 XP)'}
        </button>

        <button
          onClick={() => router.push('/learn')}
          className="glass-panel"
          style={{ padding: '0.85rem 1.5rem', fontSize: '14px', color: 'var(--text-primary)' }}
        >
          Next Lesson →
        </button>
      </div>
    </div>
  );
}
