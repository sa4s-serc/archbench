import express from 'express';
import { signup, login, logout, protect, updateMe, updatePassword } from '../controllers/auth.js';
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

// Profile management routes - all protected
router.patch('/updateMe', protect, updateMe);
router.patch('/updateMyPassword', protect, updatePassword);

export default router;