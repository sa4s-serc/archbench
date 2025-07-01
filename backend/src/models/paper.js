import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Paper title is required'],
        trim: true
    },
    year: {
        type: String,
        required: [true, 'Paper year is required']
    },
    authors: {
        type: [String],
        required: [true, 'At least one author is required']
    },
    conference: {
        type: String,
        default: ''
    },
    abstract: {
        type: String,
        required: [true, 'Paper abstract is required']
    },
    arxivLink: {
        type: String,
        required: [true, 'arXiv link is required']
    },
    githubLink: {
        type: String,
        default: ''
    },
    citation: {
        type: String,
        required: [true, 'Citation is required']
    }
}, {
    timestamps: true
});

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;