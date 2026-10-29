import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../services/auth/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok, created } from '../utils/index.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const result = await register(req.body);
  created(res, result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const result = await login(req.body);
  ok(res, result);
}));

router.post('/logout', asyncHandler(async (req, res) => {
  // Stateless JWT or session revoke
  ok(res, { message: 'Logged out successfully' });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  ok(res, req.user);
}));

router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const updated = await updateProfile(req.user.id, req.body);
  ok(res, updated);
}));

export default router;
