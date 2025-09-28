import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listAds, getAdById, createAd, deleteAd } from '../controllers/ads.controller.js';

const router = Router();

router.get('/', listAds);
router.get('/:id', getAdById);
router.post('/', authenticate, createAd);
router.delete('/:id', authenticate, deleteAd);

export default router;
