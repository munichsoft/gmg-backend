import { Router } from 'express';
import { syncFirebaseUser } from '../controllers/auth.controller.js';

const router = Router();

router.post('/sync', syncFirebaseUser);

export default router;
