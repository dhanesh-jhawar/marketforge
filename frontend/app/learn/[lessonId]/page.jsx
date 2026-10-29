'use client';

import React, { useState, useEffect } from 'react';
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
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!lessonId) return;
    apiClient(`/learning/lessons/${lessonId}`)
      .then((data) => {
        setLesson(data);
        if (typeof window !== 'undefined') {
          try {
            const localCompleted = JSON.parse(localStorage.getItem('marketforge_completed_lessons') || '[]');
            if (localCompleted.includes(lessonId)) {
              setCompleted(true);
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => setLesson(null))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const markCompletedLocally = () => {
    setCompleted(true);
    if (typeof window !== 'undefined') {
      try {
        const localCompleted = JSON.parse(localStorage.getItem('marketforge_completed_lessons') || '[]');
        if (!localCompleted.includes(lessonId)) {
          localCompleted.push(lessonId);
          localStorage.setItem('marketforge_completed_lessons', JSON.stringify(localCompleted));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleComplete = async () => {
    try {
      await apiClient(`/learning/lessons/${lessonId}/complete`, { method: 'POST' });
      markCompletedLocally();
    } catch {
      markCompletedLocally();
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!lesson?.quiz?.id) return;
    setSubmittingQuiz(true);
    try {
      const res = await apiClient(`/quiz/${lesson.quiz.id}/submit`, {
        method: 'POST',
        body: { answers: quizAnswers },
      });
      setQuizResult(res);
      if (res.passed) {
        markCompletedLocally();
      }
    } catch (err) {
      alert(err.message || 'Quiz submission failed');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#39FF88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
        INITIALIZING LESSON MATERIAL...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#FF4D67', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)' }}>
        Lesson not found. <button onClick={() => router.push('/learn')} style={{ color: '#39FF88', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Back to Curriculum</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => router.push('/learn')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#39FF88',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ← BACK TO CURRICULUM
        </button>

        {/* Module Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#38D9FF',
              background: 'rgba(56, 217, 255, 0.12)',
              border: '1px solid rgba(56, 217, 255, 0.3)',
              padding: '3px 10px',
              borderRadius: '2px',
              textTransform: 'uppercase',
            }}
          >
            {lesson.skillArea?.replace(/_/g, ' ')}
          </span>
          <span style={{ color: '#71877B', fontSize: '12px' }}>
            ⏱ {lesson.estimatedMinutes || 8} MINUTES • LEVEL {lesson.difficulty || 1}
          </span>
          {completed && (
            <span style={{ fontSize: '11px', color: '#39FF88', fontWeight: 800, marginLeft: 'auto' }}>
              ✔ MODULE COMPLETED
            </span>
          )}
        </div>

        {/* Title & Summary */}
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '0 0 12px 0', lineHeight: 1.25 }}>
          {lesson.title}
        </h1>
        <p style={{ color: '#94B8A3', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px 0', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', paddingBottom: '20px' }}>
          {lesson.summary}
        </p>

        {/* Lesson Body Content Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {(lesson.blocks || []).map((block, i) => {
            if (block.type === 'callout') {
              const tone = block.data?.tone || 'info';
              const borderCol = tone === 'danger' ? '#FF4D67' : tone === 'warning' ? '#FFAA00' : '#39FF88';
              const bgCol = tone === 'danger' ? 'rgba(255, 77, 103, 0.1)' : tone === 'warning' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(57, 255, 136, 0.08)';

              return (
                <div
                  key={i}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '2px',
                    background: bgCol,
                    borderLeft: `4px solid ${borderCol}`,
                    borderTop: `1px solid rgba(57, 255, 136, 0.1)`,
                    borderRight: `1px solid rgba(57, 255, 136, 0.1)`,
                    borderBottom: `1px solid rgba(57, 255, 136, 0.1)`,
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#DDFBEA',
                  }}
                >
                  <b style={{ color: borderCol, display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                    KEY TAKEAWAY:
                  </b>
                  {block.data?.md}
                </div>
              );
            }

            return (
              <div key={i} style={{ fontSize: '15px', lineHeight: 1.7, color: '#DDFBEA' }}>
                {block.data?.md}
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE MCQ KNOWLEDGE CHECK */}
        {lesson.quiz && (
          <div
            style={{
              background: '#07130F',
              border: '1px solid #39FF88',
              boxShadow: '0 0 25px rgba(57, 255, 136, 0.15)',
              borderRadius: '2px',
              padding: '28px',
              marginBottom: '36px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📝</span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88', margin: 0 }}>
                  Knowledge Check: {lesson.quiz.title}
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: '#71877B', background: '#030807', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.2)' }}>
                Pass Mark: {lesson.quiz.passPct}% (+100 XP)
              </span>
            </div>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '0 0 24px 0' }}>
              Test your mastery of the concepts taught in this module. Select your answer for each question and submit for instant scoring and pedagogical feedback.
            </p>

            <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {(lesson.quiz.questions || []).map((q, qIdx) => {
                const questionFeedback = quizResult?.results?.find((r) => r.questionId === q.id);
                const hasAnswered = quizAnswers[q.id] !== undefined;

                return (
                  <div
                    key={q.id}
                    style={{
                      background: '#030807',
                      border: questionFeedback
                        ? questionFeedback.correct
                          ? '1px solid #39FF88'
                          : '1px solid #FF4D67'
                        : '1px solid rgba(57, 255, 136, 0.2)',
                      padding: '18px',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#DDFBEA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#38D9FF' }}>Q{qIdx + 1}.</span> {q.prompt}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(q.options || []).map((opt, optIdx) => {
                        const isSelected = quizAnswers[q.id] === optIdx;
                        const isCorrectOption = questionFeedback && questionFeedback.answer === optIdx;
                        const isWrongSelection = questionFeedback && isSelected && !questionFeedback.correct;

                        let borderStyle = '1px solid rgba(57, 255, 136, 0.15)';
                        let bgStyle = isSelected ? 'rgba(57, 255, 136, 0.12)' : '#07130F';
                        let textCol = '#DDFBEA';

                        if (questionFeedback) {
                          if (isCorrectOption) {
                            borderStyle = '1px solid #39FF88';
                            bgStyle = 'rgba(57, 255, 136, 0.2)';
                            textCol = '#39FF88';
                          } else if (isWrongSelection) {
                            borderStyle = '1px solid #FF4D67';
                            bgStyle = 'rgba(255, 77, 103, 0.2)';
                            textCol = '#FF4D67';
                          }
                        }

                        return (
                          <label
                            key={optIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              borderRadius: '2px',
                              background: bgStyle,
                              border: borderStyle,
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: textCol,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={isSelected}
                              onChange={() => {
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                setQuizResult(null); // Reset result on change
                              }}
                              style={{ accentColor: '#39FF88' }}
                            />
                            <span>{opt}</span>
                            {questionFeedback && isCorrectOption && (
                              <span style={{ marginLeft: 'auto', color: '#39FF88', fontWeight: 900, fontSize: '11px' }}>
                                ✔ CORRECT ANSWER
                              </span>
                            )}
                            {questionFeedback && isWrongSelection && (
                              <span style={{ marginLeft: 'auto', color: '#FF4D67', fontWeight: 900, fontSize: '11px' }}>
                                ✕ INCORRECT
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Question Explanation Banner */}
                    {questionFeedback && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: '2px',
                          background: questionFeedback.correct ? 'rgba(57, 255, 136, 0.08)' : 'rgba(255, 77, 103, 0.08)',
                          borderLeft: `3px solid ${questionFeedback.correct ? '#39FF88' : '#FF4D67'}`,
                          fontSize: '12px',
                          color: '#DDFBEA',
                          lineHeight: 1.5,
                        }}
                      >
                        <b style={{ color: questionFeedback.correct ? '#39FF88' : '#FF4D67' }}>
                          {questionFeedback.correct ? '✔ Correct!' : '✕ Explanation:'}
                        </b>{' '}
                        {questionFeedback.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submittingQuiz || Object.keys(quizAnswers).length < (lesson.quiz.questions?.length || 0)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '2px',
                    background: Object.keys(quizAnswers).length >= (lesson.quiz.questions?.length || 0) ? '#39FF88' : '#71877B',
                    color: '#030807',
                    fontWeight: 900,
                    fontSize: '13px',
                    border: 'none',
                    cursor: Object.keys(quizAnswers).length >= (lesson.quiz.questions?.length || 0) ? 'pointer' : 'not-allowed',
                    boxShadow: '0 0 15px rgba(57, 255, 136, 0.3)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {submittingQuiz ? 'EVALUATING ANSWERS...' : 'SUBMIT MCQ TEST'}
                </button>

                {Object.keys(quizAnswers).length < (lesson.quiz.questions?.length || 0) && (
                  <span style={{ fontSize: '11px', color: '#71877B' }}>
                    Please answer all {lesson.quiz.questions?.length} questions to submit.
                  </span>
                )}
              </div>
            </form>

            {/* Quiz Result Celebration Banner */}
            {quizResult && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  borderRadius: '2px',
                  background: quizResult.passed ? 'rgba(57, 255, 136, 0.15)' : 'rgba(255, 77, 103, 0.15)',
                  border: `1px solid ${quizResult.passed ? '#39FF88' : '#FF4D67'}`,
                  color: quizResult.passed ? '#39FF88' : '#FF4D67',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900 }}>
                    {quizResult.passed ? '🎉 EXCELLENT WORK! QUIZ PASSED' : '⚠ TEST NOT PASSED'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#DDFBEA', marginTop: '2px' }}>
                    Score: <b>{quizResult.scorePct}%</b> (Pass threshold: {lesson.quiz.passPct}%) —{' '}
                    {quizResult.passed ? 'You earned +100 XP and unlocked module completion.' : 'Review the explanations above and try again to improve your score.'}
                  </div>
                </div>
                {quizResult.passed && (
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88' }}>
                    +100 XP
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(57, 255, 136, 0.15)',
            paddingTop: '20px',
          }}
        >
          <button
            onClick={handleComplete}
            disabled={completed}
            style={{
              padding: '10px 24px',
              borderRadius: '2px',
              background: completed ? '#0B3D2E' : '#39FF88',
              color: completed ? '#39FF88' : '#030807',
              border: completed ? '1px solid #39FF88' : 'none',
              fontWeight: 900,
              fontSize: '13px',
              cursor: completed ? 'default' : 'pointer',
              boxShadow: completed ? 'none' : '0 0 15px rgba(57, 255, 136, 0.4)',
            }}
          >
            {completed ? '✔ LESSON COMPLETED' : 'MARK AS COMPLETE (+50 XP)'}
          </button>

          <button
            onClick={() => router.push('/learn')}
            style={{
              padding: '10px 20px',
              borderRadius: '2px',
              background: '#07130F',
              border: '1px solid rgba(57, 255, 136, 0.3)',
              color: '#DDFBEA',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            NEXT LESSON →
          </button>
        </div>
      </div>
    </div>
  );
}
