import Ticket from '../models/ticket.js';
import User from '../models/user.js';

// Create a verification ticket - Only for unverified users (type 3)
export const createTicket = async (req, res) => {
    try {
        // Check if user is already verified
        if (req.user.authLevel !== 3) {
            return res.status(400).json({
                status: 'fail',
                message: 'Only unverified users can request verification'
            });
        }

        // Check if the user already has a pending ticket
        const existingTicket = await Ticket.findOne({
            user: req.user._id,
            status: 'pending'
        });

        if (existingTicket) {
            return res.status(400).json({
                status: 'fail',
                message: 'You already have a pending verification request'
            });
        }

        // Create a new ticket
        const ticket = await Ticket.create({
            user: req.user._id,
            reason: req.body.reason
        });

        res.status(201).json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get all tickets - Admin/Moderator only
export const getAllTickets = async (req, res) => {
    try {
        // Default filter to pending tickets
        const status = req.query.status || 'pending';
        let filter = {};

        if (status !== 'all') {
            filter.status = status;
        }

        // Find tickets and populate with user data
        const tickets = await Ticket.find(filter)
            .populate('user', 'username email createdAt')
            .populate('reviewedBy', 'username')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: tickets.length,
            data: {
                tickets
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id })
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: tickets.length,
            data: {
                tickets
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Review ticket (approve/reject) - Admin/Moderator only
export const reviewTicket = async (req, res) => {
    try {
        const { action, note } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid action. Use "approve" or "reject"'
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'fail',
                message: 'Ticket not found'
            });
        }

        if (ticket.status !== 'pending') {
            return res.status(400).json({
                status: 'fail',
                message: 'This ticket has already been processed'
            });
        }

        // Update ticket status
        ticket.status = action === 'approve' ? 'approved' : 'rejected';
        ticket.reviewedBy = req.user._id;
        ticket.reviewNote = note || '';

        await ticket.save();

        // If approved, update the user's auth level
        if (action === 'approve') {
            await User.findByIdAndUpdate(
                ticket.user,
                { authLevel: 2 }, // Update to verified user
                { runValidators: true }
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Delete a ticket - Admin/Moderator or ticket owner (if reviewed)
export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'fail',
                message: 'Ticket not found'
            });
        }

        // Only admins (0) and moderators (1) can delete any ticket
        // Regular users can only delete their own tickets, and only if they're already reviewed
        if (req.user.authLevel > 1) {
            // Check if the ticket belongs to the user and is reviewed
            if (ticket.user.toString() !== req.user.id || ticket.status === 'pending') {
                return res.status(403).json({
                    status: 'fail',
                    message: 'You do not have permission to delete this ticket'
                });
            }
        }

        await Ticket.findByIdAndDelete(req.params.id);

        res.status(200).json({
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