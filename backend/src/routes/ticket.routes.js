import express from 'express';
import { createTicket, getAllTickets, getUserTickets, reviewTicket, deleteTicket } from '../controllers/ticket.js';
import { protect, restrictToAuthLevel } from '../controllers/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.post('/', createTicket);
router.get('/me', getUserTickets);

// Routes for admins and moderators only
router.use(restrictToAuthLevel(1)); // Restrict to admins (0) and moderators (1)
router.get('/', getAllTickets);
router.patch('/:id/review', reviewTicket);
router.delete('/:id', deleteTicket);

export default router;