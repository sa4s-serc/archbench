import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Metric name is required']
    },
    description: {
        type: String,
        required: [true, 'Metric description is required']
    }
});

const customFieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Field name is required']
    },
    value: {
        type: String,
        required: [true, 'Field value is required']
    }
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    long_description: {
        type: String,
        required: [true, 'Task description is required']
    },
    input_format: {
        type: String,
        default: ''
    },
    output_format: {
        type: String,
        default: ''
    },
    dataset_url: {
        type: String,
        default: ''
    },
    example: {
        type: String,
        default: ''
    },
    metrics: [metricSchema],
    custom_fields: [customFieldSchema]
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;