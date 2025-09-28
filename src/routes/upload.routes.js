import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import cloudinary, { initCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/signature', authenticate, async (req, res) => {
  initCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET);
  res.status(200).json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
