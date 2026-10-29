import { Router } from 'express';
import { learningService } from '../services/learning/learningService.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const glossary = await learningService.getGlossary();
  ok(res, glossary);
}));

export default router;
