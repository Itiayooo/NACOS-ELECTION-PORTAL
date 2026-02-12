import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import Department from '../models/Department';

const router = express.Router();

// Public route to get departments for registration
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.json({ departments });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
