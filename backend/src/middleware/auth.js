import { protect, restrictToAuthLevel } from '../controllers/auth.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user.js';
import rateLimit from 'express-rate-limit';

export const protectRoute = protect;
export const restrictToAdmin = restrictToAuthLevel(1); // Admin level 1
export const restrictToEditor = restrictToAuthLevel(2); // Editor level 2

// Middleware to check if user is authenticated but continue regardless
export const isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // Verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a logged in user
            res.locals.user = currentUser;
            req.user = currentUser;
        }

        next();
    } catch (err) {
        next();
    }
};

// Rate limiting middleware
export const loginLimiter = rateLimit({
    max: 100, // limit each IP to 100 login attempts per window
    windowMs: 60 * 60 * 1000, // 1 hour window
    message: 'Too many login attempts from this IP, please try again after an hour'
});