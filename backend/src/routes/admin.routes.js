import { Router } from 'express';
import { adminService } from '../services/admin/adminService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await adminService.getUsers({
    limit: Number(req.query.limit) || 50,
    offset: Number(req.query.offset) || 0,
  });
  ok(res, users);
}));

router.get('/rules', asyncHandler(async (req, res) => {
  const rules = await adminService.getRules();
  ok(res, rules);
}));

router.put('/rules', asyncHandler(async (req, res) => {
  const { id, ...patch } = req.body;
  const updated = await adminService.updateRule(req.user.id, id, patch);
  ok(res, updated);
}));

router.get('/challenges', asyncHandler(async (req, res) => {
  const challenges = await adminService.getChallenges();
  ok(res, challenges);
}));

router.get('/content', asyncHandler(async (req, res) => {
  const content = await adminService.getContent();
  ok(res, content);
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();
  ok(res, analytics);
}));

router.get('/sync', asyncHandler(async (req, res) => {
  const events = await adminService.getSyncEvents();
  ok(res, events);
}));

router.get('/audit-log', asyncHandler(async (req, res) => {
  const logs = await adminService.getAuditLogs();
  ok(res, logs);
}));

router.get('/system-status', asyncHandler(async (req, res) => {
  const status = await adminService.getSystemStatus();
  ok(res, status);
}));

export default router;
