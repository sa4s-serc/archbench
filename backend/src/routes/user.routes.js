// filepath: /home/avilol/Downloads/GitHub/archbench/backend/src/routes/user.routes.js
import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getUserPassword } from '../controllers/user.js';
import { protect, restrictToAuthLevel } from '../controllers/auth.js';

const router = express.Router();

// Protect all routes after this middleware - require login
router.use(protect);

// Restrict to admins (authLevel 0)
router.use(restrictToAuthLevel(0));

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUserById)
    .patch(updateUser)
    .delete(deleteUser);

router.route('/:id/password')
    .get(getUserPassword);

export default router;