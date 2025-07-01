import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faArrowLeft,
    faTimes,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";

const AdminTasks = ({
    tasks,
    loading,
    setError,
    setSuccess,
    fetchTasks
}) => {
    const [editingTask, setEditingTask] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        long_description: '',
        input_format: '',
        output_format: '',
        dataset_url: '',
        example: '',
        metrics: [{ name: '', description: '' }],
        custom_fields: []
    });
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showTaskDeleteModal, setShowTaskDeleteModal] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const handleAddNewTask = () => {
        setTaskFormData({
            title: '',
            long_description: '',
            input_format: '',
            output_format: '',
            dataset_url: '',
            example: '',
            metrics: [{ name: '', description: '' }],
            custom_fields: []
        });
        setIsAddingTask(true);
        setEditingTask(null);
    };

    const handleEditTask = (task) => {
        // Ensure task has all necessary fields, especially metrics
        const taskToEdit = {
            ...task,
            metrics: task.metrics || [{ name: '', description: '' }]
        };
        setTaskFormData(taskToEdit);
        setEditingTask(task._id);
        setIsAddingTask(false);
    };

    const handleTaskChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaskFormData({
            ...taskFormData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleMetricChange = (index, field, value) => {
        const updatedMetrics = [...taskFormData.metrics];
        updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
        setTaskFormData({ ...taskFormData, metrics: updatedMetrics });
    };

    const addMetric = () => {
        setTaskFormData({
            ...taskFormData,
            metrics: [...taskFormData.metrics, { name: '', description: '' }]
        });
    };

    const removeMetric = (index) => {
        const updatedMetrics = [...taskFormData.metrics];
        updatedMetrics.splice(index, 1);
        setTaskFormData({ ...taskFormData, metrics: updatedMetrics });
    };

    // Custom fields management
    const handleCustomFieldChange = (index, field, value) => {
        const updatedFields = [...taskFormData.custom_fields];
        updatedFields[index] = { ...updatedFields[index], [field]: value };
        setTaskFormData({ ...taskFormData, custom_fields: updatedFields });
    };

    const addCustomField = () => {
        setTaskFormData({
            ...taskFormData,
            custom_fields: [...(taskFormData.custom_fields || []), { name: '', value: '' }]
        });
    };

    const removeCustomField = (index) => {
        const updatedFields = [...taskFormData.custom_fields];
        updatedFields.splice(index, 1);
        setTaskFormData({ ...taskFormData, custom_fields: updatedFields });
    };

    const handleTaskFormCancel = () => {
        setIsAddingTask(false);
        setEditingTask(null);
        setTaskFormData({
            title: '',
            long_description: '',
            input_format: '',
            output_format: '',
            dataset_url: '',
            example: '',
            metrics: [{ name: '', description: '' }],
            custom_fields: []
        });
    };

    const handleTaskSave = async () => {
        // Filter out empty metrics
        const filteredMetrics = taskFormData.metrics.filter(
            metric => metric.name.trim() !== '' && metric.description.trim() !== ''
        );

        const dataToSend = {
            ...taskFormData,
            metrics: filteredMetrics
        };

        try {
            let response;

            if (editingTask) {
                // Update existing task
                response = await fetch(`${API_URL}/tasks/${editingTask}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            } else {
                // Create new task
                response = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            }

            if (!response.ok) {
                throw new Error(editingTask ? 'Failed to update task' : 'Failed to create task');
            }

            setSuccess(editingTask ? 'Task updated successfully' : 'Task created successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Reset form and state
            handleTaskFormCancel();

            // Refresh task list
            fetchTasks();
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const confirmTaskDelete = (taskId) => {
        setTaskToDelete(taskId);
        setShowTaskDeleteModal(true);
    };

    const handleTaskDelete = async () => {
        if (!taskToDelete) return;

        try {
            const response = await fetch(`${API_URL}/tasks/${taskToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            setSuccess('Task deleted successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Refresh task list
            fetchTasks();
            setShowTaskDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                        <p className="font-medium text-lg">Loading task data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Task Management UI */}
            {isAddingTask || editingTask ? (
                <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title flex items-center gap-2 mb-4">
                            <button
                                onClick={handleTaskFormCancel}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Required fields */}
                            <div>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Task Title*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={taskFormData.title}
                                        onChange={handleTaskChange}
                                        placeholder="Enter task title"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Description*</span>
                                    </label>
                                    <textarea
                                        name="long_description"
                                        value={taskFormData.long_description}
                                        onChange={handleTaskChange}
                                        placeholder="Detailed description of the task"
                                        className="textarea textarea-bordered h-32"
                                        required
                                    ></textarea>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Dataset URL*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="dataset_url"
                                        value={taskFormData.dataset_url || ''}
                                        onChange={handleTaskChange}
                                        placeholder="URL to dataset"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Example*</span>
                                    </label>
                                    <textarea
                                        name="example"
                                        value={taskFormData.example || ''}
                                        onChange={handleTaskChange}
                                        placeholder="Example input/output or usage example"
                                        className="textarea textarea-bordered h-24"
                                        required
                                    ></textarea>
                                </div>

                                {/* Custom Fields Section */}
                                <div className="form-control">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-lg font-medium">Custom Fields</label>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={addCustomField}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                            Add Custom Field
                                        </button>
                                    </div>

                                    {taskFormData.custom_fields && taskFormData.custom_fields.map((field, index) => (
                                        <div key={index} className="card bg-base-200 p-3 mb-3">
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="font-medium">Custom Field #{index + 1}</div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost text-error"
                                                        onClick={() => removeCustomField(index)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={field.name || ''}
                                                    onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                                                    placeholder="Field name (e.g., Time Limit, Dataset Size)"
                                                    className="input input-bordered input-sm w-full"
                                                />
                                                <input
                                                    type="text"
                                                    value={field.value || ''}
                                                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                                    placeholder="Field value (e.g., 2 hours, 1000 records)"
                                                    className="input input-bordered input-sm w-full"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {(!taskFormData.custom_fields || taskFormData.custom_fields.length === 0) && (
                                        <div className="text-center p-4 bg-base-200 rounded-lg">
                                            <p className="text-sm opacity-70">No custom fields added yet</p>
                                            <button
                                                className="btn btn-xs btn-outline mt-2"
                                                onClick={addCustomField}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                                Add First Custom Field
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Input/Output Formats and Evaluation Metrics */}
                            <div>
                                {/* Input Format - Moved from left column */}
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Input Format*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="input_format"
                                        value={taskFormData.input_format || ''}
                                        onChange={handleTaskChange}
                                        placeholder="e.g., JSON, CSV"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                {/* Output Format - Moved from left column */}
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Output Format*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="output_format"
                                        value={taskFormData.output_format || ''}
                                        onChange={handleTaskChange}
                                        placeholder="e.g., JSON, CSV"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-lg font-medium">Evaluation Metrics</label>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={addMetric}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                            Add Metric
                                        </button>
                                    </div>

                                    {taskFormData.metrics.map((metric, index) => (
                                        <div key={index} className="card bg-base-200 p-3 mb-3">
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="font-medium">Metric #{index + 1}</div>
                                                    {taskFormData.metrics.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-ghost text-error"
                                                            onClick={() => removeMetric(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={metric.name}
                                                    onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                                                    placeholder="Metric name"
                                                    className="input input-bordered input-sm w-full"
                                                />
                                                <textarea
                                                    value={metric.description}
                                                    onChange={(e) => handleMetricChange(index, 'description', e.target.value)}
                                                    placeholder="Metric description"
                                                    className="textarea textarea-bordered textarea-sm w-full"
                                                    rows={2}
                                                ></textarea>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleTaskFormCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleTaskSave}
                            >
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Task List */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Task Management</h2>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddNewTask}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Add New Task
                        </button>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="card bg-base-100 shadow-xl border border-base-300 p-8">
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-5xl mb-4">📋</div>
                                <h2 className="text-2xl font-bold mb-2">No Tasks Available</h2>
                                <p className="text-base-content/70 mb-6">Start by creating your first task</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddNewTask}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add New Task
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.map((task) => (
                                <div key={task._id} className="card bg-base-100 shadow-lg hover:shadow-xl border border-base-200 transition-all">
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start">
                                            <h3 className="card-title text-lg">{task.title}</h3>
                                        </div>

                                        <div className="mt-2 mb-4">
                                            <p className="line-clamp-3 text-sm opacity-80">{task.long_description}</p>
                                        </div>

                                        <div className="card-actions justify-end">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleEditTask(task)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline btn-error"
                                                onClick={() => confirmTaskDelete(task._id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Delete task confirmation modal */}
            {showTaskDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="modal-box">
                        <h3 className="text-xl font-bold mb-4 text-error">Confirm Task Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowTaskDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleTaskDelete}
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

export default AdminTasks;