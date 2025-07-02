// filepath: /home/avilol/Downloads/GitHub/archbench/backend/src/controllers/leaderboard.js
import LeaderboardEntry from '../models/leaderboard.js';
import Task from '../models/task.js';

// Get all leaderboard entries for a specific task
export const getTaskLeaderboard = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Check if task exists
        const taskExists = await Task.findById(taskId);
        if (!taskExists) {
            return res.status(404).json({
                status: 'fail',
                message: 'Task not found'
            });
        }

        // Get all entries for this task, sort by creation date (newest first)
        const entries = await LeaderboardEntry.find({ task: taskId })
            .populate('submitted_by', 'username name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: entries.length,
            data: {
                entries
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a specific leaderboard entry
export const getLeaderboardEntry = async (req, res) => {
    try {
        const entry = await LeaderboardEntry.findById(req.params.id)
            .populate('submitted_by', 'username name email')
            .populate('task');

        if (!entry) {
            return res.status(404).json({
                status: 'fail',
                message: 'Leaderboard entry not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                entry
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create a new leaderboard entry
export const createLeaderboardEntry = async (req, res) => {
    try {
        // Check if the task exists
        const task = await Task.findById(req.body.task);
        if (!task) {
            return res.status(404).json({
                status: 'fail',
                message: 'Task not found'
            });
        }

        // Check if all required metrics are provided
        const taskMetrics = task.metrics.map(metric => metric.name);
        const providedMetrics = req.body.metrics.map(metric => metric.name);

        // Check if all required metrics from the task are included in the submission
        const missingMetrics = taskMetrics.filter(metric => !providedMetrics.includes(metric));

        if (missingMetrics.length > 0) {
            return res.status(400).json({
                status: 'fail',
                message: `Missing required metrics: ${missingMetrics.join(', ')}`
            });
        }

        // Add user ID from authenticated user
        req.body.submitted_by = req.user.id;

        const newEntry = await LeaderboardEntry.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                entry: newEntry
            }
        });
    } catch (error) {
        // Handle duplicate entry error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'fail',
                message: 'A leaderboard entry for this model and task already exists'
            });
        }

        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update a leaderboard entry
export const updateLeaderboardEntry = async (req, res) => {
    try {
        const entry = await LeaderboardEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                status: 'fail',
                message: 'Leaderboard entry not found'
            });
        }

        // Only allow the owner or admin to update
        if (entry.submitted_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only update your own leaderboard entries'
            });
        }

        // If metrics are being updated, validate against task metrics
        if (req.body.metrics) {
            const task = await Task.findById(entry.task);
            const taskMetrics = task.metrics.map(metric => metric.name);
            const providedMetrics = req.body.metrics.map(metric => metric.name);

            // Check if all required metrics from the task are included in the update
            const missingMetrics = taskMetrics.filter(metric => !providedMetrics.includes(metric));

            if (missingMetrics.length > 0) {
                return res.status(400).json({
                    status: 'fail',
                    message: `Missing required metrics: ${missingMetrics.join(', ')}`
                });
            }
        }

        const updatedEntry = await LeaderboardEntry.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('submitted_by', 'username name email');

        res.status(200).json({
            status: 'success',
            data: {
                entry: updatedEntry
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Delete a leaderboard entry
export const deleteLeaderboardEntry = async (req, res) => {
    try {
        const entry = await LeaderboardEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                status: 'fail',
                message: 'Leaderboard entry not found'
            });
        }

        // Only allow the owner or admin to delete
        if (entry.submitted_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only delete your own leaderboard entries'
            });
        }

        await LeaderboardEntry.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all leaderboard entries across all tasks
export const getAllLeaderboardEntries = async (req, res) => {
    try {
        const entries = await LeaderboardEntry.find()
            .populate('task', 'title')
            .populate('submitted_by', 'username name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: entries.length,
            data: {
                entries
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};