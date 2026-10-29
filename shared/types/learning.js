/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} summary
 * @property {string} skillArea        see SKILL_AREAS
 * @property {number} difficulty       1-3
 * @property {number} estimatedMinutes
 * @property {Array<{type:'text'|'callout'|'chart'|'interactive'|'quiz', data:Object}>} blocks
 * @property {string|null} quizId
 * @property {string[]} prerequisites  lesson ids
 * @property {boolean} published
 */

/**
 * @typedef {Object} Quiz
 * @property {string} id
 * @property {string} lessonId
 * @property {string} title
 * @property {Question[]} questions
 * @property {number} passPct
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} prompt
 * @property {'single'|'multi'|'numeric'} type
 * @property {string[]} options
 * @property {number[]|number} answer   hidden from client
 * @property {string} explanation
 * @property {string} skillArea
 */

/**
 * @typedef {Object} UserSkill
 * @property {string} skillArea
 * @property {number} score       0-100, maintained by learning engine
 * @property {number} attempts
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Scenario   What-If historical simulation.
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} symbol | benchmark-able security
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} [eventContext]  e.g. "COVID crash, Mar 2020"
 * @property {Object} params          configurable inputs (amount, sip, stopLoss...)
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} type       e.g. DIVERSIFY | QUIZ_STREAK | RISK_DISCIPLINE | RETURN_TARGET
 * @property {Object} criteria   evaluated deterministically by learning engine
 * @property {number} rewardXp
 * @property {string|null} startsAt
 * @property {string|null} endsAt
 */

/**
 * @typedef {Object} StudyTask
 * @property {string} id
 * @property {string} planId
 * @property {string} title
 * @property {'LESSON'|'QUIZ'|'SCENARIO'|'CHALLENGE'|'CUSTOM'} type
 * @property {string|null} refId
 * @property {string|null} dueDate
 * @property {string} status
 */

export const clampScore = (n) => Math.max(0, Math.min(100, Math.round(n)));

/** Strip answers before sending a quiz to the client. */
export const toPublicQuiz = (quiz) => ({
  ...quiz,
  questions: (quiz?.questions ?? []).map(({ answer, explanation, ...q }) => q),
});
