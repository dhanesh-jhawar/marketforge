import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/questions', asyncHandler(async (req, res) => {
  const questions = await learningService.getOnboardingQuestions();
  ok(res, questions);
}));

router.post('/submit', requireAuth, asyncHandler(async (req, res) => {
  const result = await learningService.submitOnboarding(req.user.id, req.body);
  ok(res, result);
}));

router.get('/result', requireAuth, asyncHandler(async (req, res) => {
  const user = req.user;
  const skills = await learningService.getSkills(user.id);
  ok(res, {
    experienceLevel: user.experienceLevel,
    onboardingComplete: user.onboardingComplete,
    skills,
  });
}));

export default router;
