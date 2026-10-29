import { repos } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  scoreQuiz,
  updateSkillScore,
  evaluateOnboarding,
  recommendLessons,
  weakSkills,
  evaluateChallenge,
  generateStudyPlan,
} from '../../engines/learningEngine/index.js';
import { toPublicQuiz } from '@marketforge/shared/types';
import { nowIso, uuid } from '../../utils/index.js';

export const learningService = {
  async getLessons() {
    return repos.lessons.findMany({ published: true });
  },

  async getLessonById(id) {
    const lesson = await repos.lessons.findById(id);
    if (!lesson) throw ApiError.notFound('Lesson not found');
    let quiz = null;
    if (lesson.quizId) {
      const q = await repos.quizzes.findById(lesson.quizId);
      if (q) quiz = toPublicQuiz(q);
    }
    return { ...lesson, quiz };
  },

  async completeLesson(userId, lessonId) {
    await repos.lessonProgress.upsert({
      userId,
      lessonId,
      progressPct: 100,
      completedAt: nowIso(),
    });
    // Award 50 XP
    const user = await repos.users.findById(userId);
    await repos.users.update(userId, { xp: (user.xp || 0) + 50 });
    return { completed: true, awardedXp: 50 };
  },

  async submitQuiz(userId, quizId, answers) {
    const quiz = await repos.quizzes.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');

    const result = scoreQuiz(quiz, answers);

    await repos.quizResults.insert({
      id: uuid(),
      userId,
      quizId,
      answers,
      scorePct: result.scorePct,
      passed: result.passed,
    });

    // Update user skill scores
    for (const [skillArea, data] of Object.entries(result.perSkill)) {
      const current = await repos.userSkills.findById({ userId, skillArea });
      const currentScore = current?.score || 0;
      const currentAttempts = current?.attempts || 0;
      const ratio = data.total > 0 ? data.correct / data.total : 0;
      const newScore = updateSkillScore(currentScore, currentAttempts, ratio);

      await repos.userSkills.upsert({
        userId,
        skillArea,
        score: newScore,
        attempts: currentAttempts + 1,
      });
    }

    if (result.passed) {
      const user = await repos.users.findById(userId);
      await repos.users.update(userId, { xp: (user.xp || 0) + 100 });
    }

    return result;
  },

  async getRecommendedLessons(userId) {
    const userSkills = await repos.userSkills.findMany({ userId });
    const skillsMap = Object.fromEntries(userSkills.map((s) => [s.skillArea, s.score]));
    const progress = await repos.lessonProgress.findMany({ userId, progressPct: 100 });
    const completedSet = new Set(progress.map((p) => p.lessonId));
    const allLessons = await repos.lessons.findMany({ published: true });

    return recommendLessons(allLessons, skillsMap, completedSet, 5);
  },

  async getSkills(userId) {
    return repos.userSkills.findMany({ userId });
  },

  async getWeakSkills(userId) {
    const userSkills = await repos.userSkills.findMany({ userId });
    const skillsMap = Object.fromEntries(userSkills.map((s) => [s.skillArea, s.score]));
    return weakSkills(skillsMap);
  },

  async getOnboardingQuestions() {
    const cfg = await repos.marketConfig.findById('onboardingQuestions');
    return cfg?.value || [];
  },

  async submitOnboarding(userId, answers) {
    const questions = await this.getOnboardingQuestions();
    const evaluation = evaluateOnboarding(questions, answers);

    await repos.onboarding.upsert({
      userId,
      answers,
      experienceLevel: evaluation.experienceLevel,
      riskProfile: evaluation.riskProfile,
      goals: evaluation.goals,
      result: evaluation,
      completedAt: nowIso(),
    });

    // Update user record
    await repos.users.update(userId, {
      experienceLevel: evaluation.experienceLevel,
      onboardingComplete: true,
    });

    // Seed initial skills
    for (const [skillArea, score] of Object.entries(evaluation.initialSkills)) {
      await repos.userSkills.upsert({ userId, skillArea, score, attempts: 1 });
    }

    return evaluation;
  },

  async getChallenges(userId) {
    const challenges = await repos.challenges.findMany({ isActive: true });
    const userProgress = await repos.challengeProgress.findMany({ userId });
    const progressMap = new Map(userProgress.map((p) => [p.challengeId, p]));

    return challenges.map((c) => ({
      ...c,
      userProgress: progressMap.get(c.id) || { status: 'NOT_STARTED', progress: {} },
    }));
  },

  async startChallenge(userId, challengeId) {
    const challenge = await repos.challenges.findById(challengeId);
    if (!challenge) throw ApiError.notFound('Challenge not found');

    await repos.challengeProgress.upsert({
      userId,
      challengeId,
      status: 'IN_PROGRESS',
      progress: {},
      startedAt: nowIso(),
    });
    return { status: 'IN_PROGRESS' };
  },

  async checkChallengeCompletion(userId, challengeId, context = {}) {
    const challenge = await repos.challenges.findById(challengeId);
    if (!challenge) throw ApiError.notFound('Challenge not found');

    const evalResult = evaluateChallenge(challenge, context);
    if (evalResult.completed) {
      await repos.challengeProgress.update({ userId, challengeId }, {
        status: 'COMPLETED',
        completedAt: nowIso(),
        progress: evalResult.progress,
      });
      const user = await repos.users.findById(userId);
      await repos.users.update(userId, { xp: (user.xp || 0) + (challenge.rewardXp || 0) });
    }
    return evalResult;
  },

  async getStudyPlan(userId) {
    let plan = await repos.studyPlans.findOne({ userId });
    if (!plan) {
      const recommended = await this.getRecommendedLessons(userId);
      const weak = await this.getWeakSkills(userId);
      const tasks = generateStudyPlan({ recommended, weak });

      const planId = uuid();
      plan = await repos.studyPlans.insert({
        id: planId,
        userId,
        title: 'Personalized Study Plan',
        goal: 'Build core market literacy and risk management discipline',
        weeklyMinutes: 60,
      });

      for (const t of tasks) {
        await repos.studyTasks.insert({ ...t, planId, id: uuid() });
      }
    }
    const tasks = await repos.studyTasks.findMany({ planId: plan.id }, { orderBy: 'orderIndex' });
    return { plan, tasks };
  },

  async updateStudyTask(userId, taskId, patch) {
    const task = await repos.studyTasks.findById(taskId);
    if (!task) throw ApiError.notFound('Task not found');
    return repos.studyTasks.update(taskId, patch);
  },

  async getGlossary() {
    return repos.glossary.findMany();
  },
};
