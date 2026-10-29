/**
 * LEARNING ENGINE — deterministic scoring, skill tracking, recommendations,
 * onboarding evaluation, challenge evaluation and study-plan generation.
 */
import { SKILL_AREAS, EXPERIENCE_LEVEL } from '@marketforge/shared/constants';
import { clampScore } from '@marketforge/shared/types';

/** Score quiz answers. `answers` = { [questionId]: number | number[] } */
export function scoreQuiz(quiz, answers = {}) {
  const perSkill = {};
  const results = quiz.questions.map((q) => {
    const given = answers[q.id];
    const correct = Array.isArray(q.answer)
      ? Array.isArray(given) && given.length === q.answer.length && q.answer.every((a) => given.includes(a))
      : Number(given) === Number(q.answer);
    perSkill[q.skillArea] ??= { correct: 0, total: 0 };
    perSkill[q.skillArea].total++;
    if (correct) perSkill[q.skillArea].correct++;
    return { questionId: q.id, correct, explanation: q.explanation, answer: q.answer };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const scorePct = quiz.questions.length ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
  return { scorePct, passed: scorePct >= (quiz.passPct ?? 60), results, perSkill };
}

/** Exponential moving average skill update. `alpha` grows smaller as attempts increase. */
export function updateSkillScore(current = 0, attempts = 0, ratio = 0) {
  const alpha = Math.max(0.2, 1 / (attempts + 1));
  return clampScore(current * (1 - alpha) + ratio * 100 * alpha);
}

export function evaluateOnboarding(questions, answers = {}) {
  let experience = 0, risk = 0;
  const initialSkills = Object.fromEntries(SKILL_AREAS.map((s) => [s, 0]));
  for (const q of questions) {
    const a = answers[q.id];
    const opts = q.options ?? [];
    const chosen = Array.isArray(a) ? opts.filter((o) => a.includes(o.value)) : opts.filter((o) => o.value === a);
    for (const o of chosen) {
      experience += o.weight?.experience ?? 0;
      risk += o.weight?.risk ?? 0;
      if (q.skillArea && o.correct) initialSkills[q.skillArea] = Math.max(initialSkills[q.skillArea], 40);
    }
  }
  const experienceLevel = experience >= 2 ? EXPERIENCE_LEVEL.ADVANCED : experience >= 1 ? EXPERIENCE_LEVEL.INTERMEDIATE : EXPERIENCE_LEVEL.BEGINNER;
  const riskProfile = risk >= 2 ? 'AGGRESSIVE' : risk >= 1 ? 'BALANCED' : 'CONSERVATIVE';
  const goals = Array.isArray(answers.goals) ? answers.goals : [];
  return { experienceLevel, riskProfile, goals, initialSkills };
}

/**
 * Rank lessons: unlocked (prereqs met), not completed, weakest skill first, then difficulty.
 * @param {object[]} lessons @param {Record<string, number>} skills @param {Set<string>} completed
 */
export function recommendLessons(lessons, skills = {}, completed = new Set(), limit = 5) {
  return lessons
    .filter((l) => l.published !== false && !completed.has(l.id) && (l.prerequisites ?? []).every((p) => completed.has(p)))
    .map((l) => ({ lesson: l, priority: (100 - (skills[l.skillArea] ?? 0)) * 10 - (l.difficulty ?? 1) }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(({ lesson, priority }) => ({ ...lesson, reason: `Strengthens ${lesson.skillArea.replace(/_/g, ' ')} (your score: ${skills[lesson.skillArea] ?? 0})`, priority }));
}

export const weakSkills = (skills = {}, threshold = 50) =>
  Object.entries(skills).filter(([, s]) => s < threshold).sort((a, b) => a[1] - b[1]).map(([skillArea, score]) => ({ skillArea, score }));

/**
 * Evaluate challenge criteria deterministically.
 * @param {object} challenge @param {{holdings?:{sector:string}[], ordersWithoutWarning?:number, quizStreak?:number}} ctx
 */
export function evaluateChallenge(challenge, ctx = {}) {
  const c = challenge.criteria ?? {};
  switch (challenge.type) {
    case 'DIVERSIFY': {
      const sectors = new Set((ctx.holdings ?? []).map((h) => h.sector).filter(Boolean)).size;
      return { completed: sectors >= c.minSectors, progress: { current: sectors, target: c.minSectors } };
    }
    case 'RISK_DISCIPLINE':
      return { completed: (ctx.ordersWithoutWarning ?? 0) >= c.ordersWithoutWarning, progress: { current: ctx.ordersWithoutWarning ?? 0, target: c.ordersWithoutWarning } };
    case 'QUIZ_STREAK':
      return { completed: (ctx.quizStreak ?? 0) >= c.streak, progress: { current: ctx.quizStreak ?? 0, target: c.streak } };
    default:
      return { completed: false, progress: {} };
  }
}

/** Build a simple weekly plan from recommendations. */
export function generateStudyPlan({ recommended = [], weak = [], startDate = new Date() }) {
  const tasks = recommended.map((l, i) => ({
    title: `Lesson: ${l.title}`, type: 'LESSON', refId: l.id,
    dueDate: new Date(startDate.getTime() + (i + 1) * 864e5).toISOString().slice(0, 10), status: 'TODO', orderIndex: i,
  }));
  if (weak.length) tasks.push({ title: `Practice quiz: ${weak[0].skillArea.replace(/_/g, ' ')}`, type: 'QUIZ', refId: null, dueDate: null, status: 'TODO', orderIndex: tasks.length });
  return tasks;
}
