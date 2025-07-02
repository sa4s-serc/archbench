import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faArrowLeft,
    faTimes,
    faMedal,
    faSearch,
    faFilter,
    faSort
} from "@fortawesome/free-solid-svg-icons";
import { leaderboardService } from '../utils/leaderboardService';

const AdminLeaderboard = ({
    entries,
    loading,
    setError,
    setSuccess,
    fetchEntries
}) => {
    const [editingEntry, setEditingEntry] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [selectedTaskMetrics, setSelectedTaskMetrics] = useState([]);
    const [entryFormData, setEntryFormData] = useState({
        task: '',
        model: '',
        description: '',
        proof_link: '',
        metrics: []
    });

    // New state for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByTask, setFilterByTask] = useState('');
    const [taskGroups, setTaskGroups] = useState({});
    const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'all'

    const API_URL = 'http://localhost:5000/api';

    // Fetch tasks for dropdown
    useEffect(() => {
        if (isAddingEntry || editingEntry) {
            fetchTasks();
        }
    }, [isAddingEntry, editingEntry]);

    // Group entries by task
    useEffect(() => {
        if (entries && entries.length > 0) {
            const groups = {};
            entries.forEach(entry => {
                const taskId = entry.task?._id || entry.task || 'unknown';
                const taskTitle = entry.task?.title || 'Unknown Task';

                if (!groups[taskId]) {
                    groups[taskId] = {
                        title: taskTitle,
                        entries: []
                    };
                }
                groups[taskId].entries.push(entry);
            });
            setTaskGroups(groups);
        }
    }, [entries]);

    // Update metrics when task changes
    useEffect(() => {
        if (entryFormData.task) {
            const selectedTask = tasks.find(task => task._id === entryFormData.task);
            if (selectedTask) {
                setSelectedTaskMetrics(selectedTask.metrics || []);

                // Initialize metrics array based on task's required metrics
                if (!editingEntry) {
                    const initialMetrics = selectedTask.metrics.map(metric => ({
                        name: metric.name,
                        value: metric.defaultValue || ''
                    }));
                    setEntryFormData(prev => ({
                        ...prev,
                        metrics: initialMetrics
                    }));
                }
            }
        }
    }, [entryFormData.task, tasks, editingEntry]);

    // Fetch tasks for filter dropdown on component mount
    useEffect(() => {
        if (!isAddingEntry && !editingEntry) {
            fetchTasks();
        }
    }, []);

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data.data.tasks);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setTasksLoading(false);
        }
    };

    const handleAddNewEntry = () => {
        setEntryFormData({
            task: '',
            model: '',
            description: '',
            proof_link: '',
            metrics: []
        });
        setIsAddingEntry(true);
        setEditingEntry(null);
    };

    const handleEditEntry = async (entry) => {
        // Fetch the complete entry to ensure we have all data
        try {
            const response = await leaderboardService.getEntry(entry._id);
            const fullEntry = response.data.entry;

            setEntryFormData({
                task: fullEntry.task._id || fullEntry.task,
                model: fullEntry.model,
                description: fullEntry.description || '',
                proof_link: fullEntry.proof_link,
                metrics: fullEntry.metrics || []
            });
            setEditingEntry(fullEntry._id);
            setIsAddingEntry(false);
        } catch (err) {
            setError('Failed to fetch entry details for editing');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleEntryChange = (e) => {
        const { name, value } = e.target;
        setEntryFormData({
            ...entryFormData,
            [name]: value,
        });
    };

    const handleMetricChange = (index, value) => {
        const updatedMetrics = [...entryFormData.metrics];
        updatedMetrics[index] = {
            ...updatedMetrics[index],
            value
        };
        setEntryFormData({ ...entryFormData, metrics: updatedMetrics });
    };

    const handleEntryFormCancel = () => {
        setIsAddingEntry(false);
        setEditingEntry(null);
        setEntryFormData({
            task: '',
            model: '',
            description: '',
            proof_link: '',
            metrics: []
        });
        setSelectedTaskMetrics([]);
    };

    const handleEntrySave = async () => {
        try {
            // Validate form
            if (!entryFormData.task || !entryFormData.model || !entryFormData.proof_link) {
                setError('Task, model name, and proof link are required');
                setTimeout(() => setError(null), 3000);
                return;
            }

            // Check that all metrics have values
            const emptyMetrics = entryFormData.metrics.filter(metric => !metric.value && metric.value !== 0);
            if (emptyMetrics.length > 0) {
                setError(`Please provide values for all metrics: ${emptyMetrics.map(m => m.name).join(', ')}`);
                setTimeout(() => setError(null), 3000);
                return;
            }

            if (editingEntry) {
                // Update existing entry
                await leaderboardService.updateEntry(editingEntry, entryFormData);
                setSuccess('Leaderboard entry updated successfully');
            } else {
                // Create new entry
                await leaderboardService.createEntry(entryFormData);
                setSuccess('Leaderboard entry created successfully');
            }

            setTimeout(() => setSuccess(null), 3000);
            handleEntryFormCancel();
            fetchEntries();
        } catch (err) {
            setError(err.message || 'An error occurred');
            setTimeout(() => setError(null), 3000);
        }
    };

    const confirmEntryDelete = (entryId) => {
        setEntryToDelete(entryId);
        setShowEntryDeleteModal(true);
    };

    const handleEntryDelete = async () => {
        if (!entryToDelete) return;

        try {
            await leaderboardService.deleteEntry(entryToDelete);
            setSuccess('Leaderboard entry deleted successfully');
            setTimeout(() => setSuccess(null), 3000);

            fetchEntries();
            setShowEntryDeleteModal(false);
            setEntryToDelete(null);
        } catch (err) {
            setError(err.message || 'Failed to delete entry');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Filter entries based on search term and task filter
    const getFilteredEntries = () => {
        let filteredEntries = [...entries];

        // Filter by task
        if (filterByTask) {
            filteredEntries = filteredEntries.filter(entry =>
                (entry.task?._id === filterByTask) ||
                (typeof entry.task === 'string' && entry.task === filterByTask)
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredEntries = filteredEntries.filter(entry =>
                entry.model.toLowerCase().includes(term) ||
                entry.description?.toLowerCase().includes(term) ||
                entry.task?.title?.toLowerCase().includes(term) ||
                entry.submitted_by?.name?.toLowerCase().includes(term) ||
                entry.submitted_by?.email?.toLowerCase().includes(term) ||
                entry.metrics?.some(m =>
                    m.name.toLowerCase().includes(term) ||
                    String(m.value).toLowerCase().includes(term)
                )
            );
        }

        return filteredEntries;
    };

    // Get grouped entries based on filters
    const getFilteredTaskGroups = () => {
        const filteredEntries = getFilteredEntries();
        const groups = {};

        filteredEntries.forEach(entry => {
            const taskId = entry.task?._id || entry.task || 'unknown';
            const taskTitle = entry.task?.title || 'Unknown Task';

            if (!groups[taskId]) {
                groups[taskId] = {
                    title: taskTitle,
                    entries: []
                };
            }
            groups[taskId].entries.push(entry);
        });

        return groups;
    };

    // Render entry table
    const renderEntryTable = (entriesToShow) => {
        return (
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Model/Approach</th>
                            <th>Metrics</th>
                            <th>Submitted By</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entriesToShow.map((entry) => (
                            <tr key={entry._id}>
                                <td>
                                    {entry.task && typeof entry.task === 'object'
                                        ? entry.task.title
                                        : "Unknown Task"}
                                </td>
                                <td>{entry.model}</td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        {entry.metrics?.map((metric, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="badge badge-sm badge-outline">
                                                    {metric.name}
                                                </span>
                                                <span>{metric.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    {entry.submitted_by && typeof entry.submitted_by === 'object'
                                        ? entry.submitted_by.username || entry.submitted_by.email
                                        : "Unknown User"}
                                </td>
                                <td>
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => handleEditEntry(entry)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-error"
                                            onClick={() => confirmEntryDelete(entry._id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                        <p className="font-medium text-lg">Loading leaderboard entries...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Leaderboard Management UI */}
            {isAddingEntry || editingEntry ? (
                <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title flex items-center gap-2 mb-4">
                            <button
                                onClick={handleEntryFormCancel}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            {editingEntry ? 'Edit Leaderboard Entry' : 'Add New Leaderboard Entry'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Task*</span>
                                    </label>
                                    <select
                                        name="task"
                                        value={entryFormData.task}
                                        onChange={handleEntryChange}
                                        className="select select-bordered w-full"
                                        required
                                    >
                                        <option value="">Select a task</option>
                                        {tasks.map(task => (
                                            <option key={task._id} value={task._id}>
                                                {task.title}
                                            </option>
                                        ))}
                                    </select>
                                    {tasksLoading && (
                                        <span className="text-xs mt-1 flex items-center">
                                            <div className="loading loading-spinner loading-xs mr-1"></div>
                                            Loading tasks...
                                        </span>
                                    )}
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Model/Approach Name*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={entryFormData.model}
                                        onChange={handleEntryChange}
                                        placeholder="e.g., GPT-4, BM25, etc."
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Description</span>
                                        <span className="label-text-alt text-base-content/70">(optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={entryFormData.description}
                                        onChange={handleEntryChange}
                                        placeholder="Brief description of the approach"
                                        className="textarea textarea-bordered h-32"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Proof Link*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="proof_link"
                                        value={entryFormData.proof_link}
                                        onChange={handleEntryChange}
                                        placeholder="https://github.com/..."
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                {entryFormData.task && (
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Metrics*</span>
                                        </label>
                                        <div className="bg-base-200 p-4 rounded-lg">
                                            {entryFormData.metrics.length > 0 ? (
                                                entryFormData.metrics.map((metric, index) => (
                                                    <div key={index} className="mb-3 last:mb-0">
                                                        <label className="text-sm font-medium block mb-1">
                                                            {metric.name}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={metric.value}
                                                            onChange={(e) => handleMetricChange(index, e.target.value)}
                                                            placeholder={`Value for ${metric.name}`}
                                                            className="input input-bordered input-sm w-full"
                                                            required
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-sm opacity-70">
                                                    Select a task to see required metrics
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleEntryFormCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleEntrySave}
                            >
                                {editingEntry ? 'Update Entry' : 'Create Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Entry List with Search and Filter */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Leaderboard Management</h2>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddNewEntry}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Add New Entry
                        </button>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
                        <div className="card-body p-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="form-control flex-grow">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium">Search</span>
                                    </label>
                                    <div className="relative flex w-full">
                                        <input
                                            type="text"
                                            placeholder="Search by model, description, metrics..."
                                            className="input input-bordered w-full pr-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button
                                            className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                                            onClick={() => searchTerm ? setSearchTerm('') : null}
                                            title={searchTerm ? "Clear search" : "Search"}
                                        >
                                            <FontAwesomeIcon icon={searchTerm ? faTimes : faSearch} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text font-medium">Filter by Task</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={filterByTask}
                                            onChange={(e) => setFilterByTask(e.target.value)}
                                        >
                                            <option value="">All Tasks</option>
                                            {tasks.map(task => (
                                                <option key={task._id} value={task._id}>
                                                    {task.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text font-medium">View Mode</span>
                                        </label>
                                        <div className="join w-full">
                                            <button
                                                className={`btn join-item w-1/2 ${viewMode === 'grouped' ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => setViewMode('grouped')}
                                            >
                                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                                Grouped
                                            </button>
                                            <button
                                                className={`btn join-item w-1/2 ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => setViewMode('all')}
                                            >
                                                <FontAwesomeIcon icon={faSort} className="mr-2" />
                                                All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(searchTerm || filterByTask) && (
                                <div className="mt-4 text-sm flex items-center">
                                    <span className="font-medium mr-2">Active filters:</span>
                                    {searchTerm && (
                                        <span className="badge badge-primary badge-outline gap-2 mr-2">
                                            Search: {searchTerm}
                                            <button onClick={() => setSearchTerm('')}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </span>
                                    )}
                                    {filterByTask && (
                                        <span className="badge badge-primary badge-outline gap-2">
                                            Task: {tasks.find(t => t._id === filterByTask)?.title || 'Unknown'}
                                            <button onClick={() => setFilterByTask('')}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        className="btn btn-xs btn-ghost ml-auto"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterByTask('');
                                        }}
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {entries.length === 0 ? (
                        <div className="card bg-base-100 shadow-xl border border-base-300 p-8">
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-5xl mb-4">🏆</div>
                                <h2 className="text-2xl font-bold mb-2">No Leaderboard Entries</h2>
                                <p className="text-base-content/70 mb-6">Start by adding your first leaderboard entry</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddNewEntry}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add New Entry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Display entries based on view mode */}
                            {viewMode === 'all' ? (
                                // All entries in a single table
                                renderEntryTable(getFilteredEntries())
                            ) : (
                                // Grouped by task
                                <div className="space-y-8">
                                    {Object.entries(getFilteredTaskGroups()).map(([taskId, taskGroup]) => (
                                        <div key={taskId} className="card bg-base-100 shadow-sm border border-base-200">
                                            <div className="card-body">
                                                <h3 className="card-title flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faMedal} className="text-warning" />
                                                    {taskGroup.title}
                                                    <span className="badge badge-sm">{taskGroup.entries.length} entries</span>
                                                </h3>
                                                {renderEntryTable(taskGroup.entries)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Delete entry confirmation modal */}
            {showEntryDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="modal-box">
                        <h3 className="text-xl font-bold mb-4 text-error">Confirm Entry Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this leaderboard entry? This action cannot be undone.</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowEntryDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleEntryDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminLeaderboard;