import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.post('/:id/submit', requireAuth, asyncHandler(async (req, res) => {
  const result = await learningService.submitQuiz(req.user.id, req.params.id, req.body.answers);
  ok(res, result);
}));

export default router;
