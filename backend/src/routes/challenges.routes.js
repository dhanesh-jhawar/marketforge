import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const challenges = await learningService.getChallenges(req.user.id);
  ok(res, challenges);
}));

router.post('/:id/start', requireAuth, asyncHandler(async (req, res) => {
  const started = await learningService.startChallenge(req.user.id, req.params.id);
  ok(res, started);
}));

router.post('/:id/complete', requireAuth, asyncHandler(async (req, res) => {
  const result = await learningService.checkChallengeCompletion(req.user.id, req.params.id, req.body.context);
  ok(res, result);
}));

export default router;
