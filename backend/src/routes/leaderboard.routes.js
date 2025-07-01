// filepath: /home/avilol/Downloads/GitHub/archbench/backend/src/routes/leaderboard.routes.js
import express from 'express';
import {
    getTaskLeaderboard,
    getLeaderboardEntry,
    createLeaderboardEntry,
    updateLeaderboardEntry,
    deleteLeaderboardEntry,
    getAllLeaderboardEntries
} from '../controllers/leaderboard.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Get all leaderboard entries (across all tasks)
router.get('/', getAllLeaderboardEntries);

// Get all leaderboard entries for a specific task
router.get('/task/:taskId', getTaskLeaderboard);

// Get a specific leaderboard entry
router.get('/:id', getLeaderboardEntry);

// Protected routes (require authentication)
router.use(protectRoute);

// Create a new leaderboard entry
router.post('/', createLeaderboardEntry);

// Update a leaderboard entry
router.patch('/:id', updateLeaderboardEntry);

// Delete a leaderboard entry
router.delete('/:id', deleteLeaderboardEntry);

export default router;