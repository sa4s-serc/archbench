import express from 'express';
import * as taskController from '../controllers/task.js';
import { protectRoute, restrictToAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route - accessible to anyone
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTask);

// Protected routes - only for admins
router.use(protectRoute);
router.use(restrictToAdmin); // Restrict to admin

router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;