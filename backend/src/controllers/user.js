// filepath: /home/avilol/Downloads/GitHub/archbench/backend/src/controllers/user.js
import User from '../models/user.js';

// Get all users - Admin only
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// Get user by ID - Admin only
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update user - Admin only
export const updateUser = async (req, res) => {
    try {
        // Filter out fields that shouldn't be updated directly
        const filteredBody = { ...req.body };
        const allowedFields = ['username', 'email', 'authLevel'];
        Object.keys(filteredBody).forEach(key => {
            if (!allowedFields.includes(key)) delete filteredBody[key];
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            filteredBody,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get user password - Admin only
export const getUserPassword = async (req, res) => {
    try {
        // Special query to get the password hash (normally excluded from queries)
        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                password: user.password
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Delete user - Admin only
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};