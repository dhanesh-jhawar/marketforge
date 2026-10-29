import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/lessons', asyncHandler(async (req, res) => {
  const lessons = await learningService.getLessons();
  ok(res, lessons);
}));

router.get('/recommended', requireAuth, asyncHandler(async (req, res) => {
  const recommended = await learningService.getRecommendedLessons(req.user.id);
  ok(res, recommended);
}));

router.get('/lessons/:id', asyncHandler(async (req, res) => {
  const lesson = await learningService.getLessonById(req.params.id);
  ok(res, lesson);
}));

router.post('/lessons/:id/complete', requireAuth, asyncHandler(async (req, res) => {
  const result = await learningService.completeLesson(req.user.id, req.params.id);
  ok(res, result);
}));

router.get('/progress', requireAuth, asyncHandler(async (req, res) => {
  const skills = await learningService.getSkills(req.user.id);
  ok(res, { skills });
}));

export default router;
