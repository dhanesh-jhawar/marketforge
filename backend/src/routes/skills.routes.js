import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const skills = await learningService.getSkills(req.user.id);
  ok(res, skills);
}));

router.get('/weak', requireAuth, asyncHandler(async (req, res) => {
  const weak = await learningService.getWeakSkills(req.user.id);
  ok(res, weak);
}));

router.get('/recommendations', requireAuth, asyncHandler(async (req, res) => {
  const recs = await learningService.getRecommendedLessons(req.user.id);
  ok(res, recs);
}));

export default router;
