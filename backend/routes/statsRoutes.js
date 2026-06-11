import { Router } from 'express';
import { getDailyStats } from '../controllers/statsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/daily', authMiddleware, getDailyStats);

export default router;
