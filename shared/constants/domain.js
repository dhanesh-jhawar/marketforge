export const ROLES = Object.freeze({
  STUDENT: 'student',
  MENTOR: 'mentor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

export const EXPERIENCE_LEVEL = Object.freeze({
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
});

export const SKILL_AREAS = Object.freeze([
  'market_basics',
  'order_types',
  'risk_management',
  'diversification',
  'fundamental_analysis',
  'technical_analysis',
  'news_interpretation',
  'behavioral_finance',
  'taxation_basics',
]);

export const LESSON_DIFFICULTY = Object.freeze({ BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 });

export const CHALLENGE_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export const STUDY_TASK_STATUS = Object.freeze({ TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', DONE: 'DONE', SKIPPED: 'SKIPPED' });

/** NSE / industry-level sector taxonomy (normalized). Providers map onto these. */
export const SECTORS = Object.freeze([
  'Financial Services', 'Information Technology', 'Oil Gas & Consumable Fuels', 'Fast Moving Consumer Goods',
  'Automobile and Auto Components', 'Healthcare', 'Metals & Mining', 'Capital Goods', 'Construction',
  'Construction Materials', 'Consumer Durables', 'Consumer Services', 'Chemicals', 'Power', 'Telecommunication',
  'Realty', 'Textiles', 'Media Entertainment & Publication', 'Services', 'Diversified', 'Forest Materials',
  'Utilities', 'Unclassified',
]);
