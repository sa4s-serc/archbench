// filepath: /home/avilol/Downloads/GitHub/archbench/backend/src/models/leaderboard.js
import mongoose from 'mongoose';

const metricResultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Metric name is required']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Metric value is required']
    }
});

const leaderboardEntrySchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task reference is required']
    },
    model: {
        type: String,
        required: [true, 'Model/approach name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    metrics: [metricResultSchema],
    proof_link: {
        type: String,
        required: [true, 'Proof link is required']
    },
    submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    }
}, {
    timestamps: true
});

// Create a compound index to ensure uniqueness of model per task
leaderboardEntrySchema.index({ task: 1, model: 1 }, { unique: true });

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

export default LeaderboardEntry;