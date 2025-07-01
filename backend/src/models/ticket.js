import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Ticket must belong to a user']
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for verification request'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewNote: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;