import Paper from '../models/paper.js';

// Get all papers
export const getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find();

        res.status(200).json({
            status: 'success',
            results: papers.length,
            data: {
                papers
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single paper by ID
export const getPaper = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);

        if (!paper) {
            return res.status(404).json({
                status: 'fail',
                message: 'Paper not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                paper
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create a new paper
export const createPaper = async (req, res) => {
    try {
        const newPaper = await Paper.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                paper: newPaper
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update a paper
export const updatePaper = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!paper) {
            return res.status(404).json({
                status: 'fail',
                message: 'Paper not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                paper
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Delete a paper
export const deletePaper = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndDelete(req.params.id);

        if (!paper) {
            return res.status(404).json({
                status: 'fail',
                message: 'Paper not found'
            });
        }

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