import { Router } from 'express';
import authRoutes from './auth.routes.js';
import generalRoutes from './general.routes.js';
import adsRoutes from './ads.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', generalRoutes);
router.use('/ads', adsRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

export default router;
