// filepath: /home/avilol/Downloads/GitHub/archbench/frontend/src/components/LeaderboardSubmission.jsx
import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../utils/leaderboardService';
import { useAuth } from '../utils/AuthContext';

const LeaderboardSubmission = ({ taskId, taskMetrics, onSubmissionSuccess }) => {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        task: taskId,
        model: '',
        description: '',
        metrics: [],
        proof_link: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Initialize metrics array when taskMetrics changes
    useEffect(() => {
        if (taskMetrics && taskMetrics.length > 0) {
            setFormData(prev => ({
                ...prev,
                metrics: taskMetrics.map(metric => ({
                    name: metric.name,
                    value: ''
                }))
            }));
        }
    }, [taskMetrics]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMetricChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            metrics: prev.metrics.map(metric =>
                metric.name === name ? { ...metric, value } : metric
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError('You must be logged in to submit an entry');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            const result = await leaderboardService.createEntry(formData);
            setSuccessMessage('Entry submitted successfully!');
            // Reset form
            setFormData({
                task: taskId,
                model: '',
                description: '',
                metrics: taskMetrics.map(metric => ({
                    name: metric.name,
                    value: ''
                })),
                proof_link: ''
            });

            if (onSubmissionSuccess) {
                onSubmissionSuccess(result.data.entry);
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="alert alert-warning">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Please log in to submit an entry to the leaderboard.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6">
            <h3 className="text-xl font-bold mb-4">Submit New Entry</h3>

            {error && (
                <div className="bg-error/10 border border-error/30 text-error px-3 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-success/10 border border-success/30 text-success px-3 py-2 rounded mb-4">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text">Model/Approach Name*</span>
                    </label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="e.g., GPT-4, Custom BERT, etc."
                    />
                </div>

                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="textarea textarea-bordered"
                        placeholder="Brief description of your approach"
                        rows={3}
                    />
                </div>

                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text">Proof Link*</span>
                    </label>
                    <input
                        type="url"
                        name="proof_link"
                        value={formData.proof_link}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="https://github.com/yourusername/repo or other verifiable link"
                    />
                    <label className="label">
                        <span className="label-text-alt">Link to code repository, paper, or other verifiable proof</span>
                    </label>
                </div>

                <div className="divider">Metrics</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {formData.metrics.map((metric, index) => (
                        <div key={index} className="form-control">
                            <label className="label">
                                <span className="label-text">{metric.name}*</span>
                            </label>
                            <input
                                type="number"
                                value={metric.value}
                                onChange={(e) => handleMetricChange(metric.name, e.target.value)}
                                step="any"
                                className="input input-bordered"
                                required
                                placeholder="0.0"
                            />
                        </div>
                    ))}
                </div>

                <div className="form-control mt-6">
                    <button
                        type="submit"
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ?
                            <span className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                Submitting...
                            </span>
                            : 'Submit Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeaderboardSubmission;