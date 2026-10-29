/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 * @property {string|null} avatarUrl
 * @property {string} role               see ROLES
 * @property {string} experienceLevel    see EXPERIENCE_LEVEL
 * @property {boolean} onboardingComplete
 * @property {number} xp
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OnboardingResult
 * @property {string} experienceLevel
 * @property {string} riskProfile        CONSERVATIVE | BALANCED | AGGRESSIVE
 * @property {string[]} goals
 * @property {Object<string, number>} initialSkills
 * @property {string[]} recommendedLessonIds
 */

/** Remove sensitive fields before returning a user to the client. */
export function toPublicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}
