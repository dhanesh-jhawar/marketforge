import { Router } from 'express';
import { whatIfService } from '../services/whatif/whatifService.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/scenarios', asyncHandler(async (req, res) => {
  const scenarios = await whatIfService.getScenarios();
  ok(res, scenarios);
}));

router.get('/scenarios/:id', asyncHandler(async (req, res) => {
  const scenario = await whatIfService.getScenarioById(req.params.id);
  ok(res, scenario);
}));

router.post('/scenarios/:id/run', optionalAuth, asyncHandler(async (req, res) => {
  const result = await whatIfService.runScenarioSimulation(req.user?.id, req.params.id, req.body);
  ok(res, result);
}));

router.post('/run', optionalAuth, asyncHandler(async (req, res) => {
  const result = await whatIfService.runSimulation(req.user?.id, req.body);
  ok(res, result);
}));

export default router;
