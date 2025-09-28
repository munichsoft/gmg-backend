import { Router } from 'express';
import { listCities, listCategories } from '../controllers/general.controller.js';

const router = Router();

router.get('/cities', listCities);
router.get('/categories', listCategories);

export default router;
