import express from 'express';
import * as paperController from '../controllers/paper.js';
import { protectRoute, restrictToAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes - accessible to anyone
router.get('/', paperController.getAllPapers);
router.get('/:id', paperController.getPaper);

// Protected routes - only for admins
router.use(protectRoute);
router.use(restrictToAdmin); // Restrict to admin

router.post('/', paperController.createPaper);
router.patch('/:id', paperController.updatePaper);
router.delete('/:id', paperController.deletePaper);

export default router;