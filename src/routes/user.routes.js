import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listMyAds } from '../controllers/ads.controller.js';

const router = Router();

router.get('/me/ads', authenticate, listMyAds);

export default router;
