import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const plan = await learningService.getStudyPlan(req.user.id);
  ok(res, plan);
}));

router.post('/tasks', requireAuth, asyncHandler(async (req, res) => {
  // Add custom task
  ok(res, { created: true });
}));

router.put('/tasks/:id', requireAuth, asyncHandler(async (req, res) => {
  const updated = await learningService.updateStudyTask(req.user.id, req.params.id, req.body);
  ok(res, updated);
}));

export default router;
