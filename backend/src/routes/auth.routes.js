import express from 'express';
import { signup, login, logout, protect } from '../controllers/auth.js';
import { loginLimiter } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.get('/logout', logout);
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
});

export default router;