// filepath: /home/avilol/Downloads/GitHub/archbench/frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../components/Footer";
import {
    faSearch,
    faRefresh,
    faUserShield,
    faPen,
    faCheck,
    faTimes,
    faTrash,
    faSort,
    faSortUp,
    faSortDown,
    faFilter,
    faUserCheck,
    faUserClock,
    faUsers,
    faTasks,
    faPlus,
    faEdit,
    faArrowLeft,
    faBook
} from "@fortawesome/free-solid-svg-icons";

const Admin = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [papers, setPapers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskLoading, setTaskLoading] = useState(true);
    const [paperLoading, setPaperLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});

    // Task management state
    const [currentTab, setCurrentTab] = useState('users'); // 'users', 'tasks', or 'papers'
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

    // Paper management state
    const [editingPaper, setEditingPaper] = useState(null);
    const [paperFormData, setPaperFormData] = useState({
        title: '',
        year: '',
        authors: [''],
        conference: '',
        abstract: '',
        arxivLink: '',
        githubLink: '',
        citation: ''
    });
    const [isAddingPaper, setIsAddingPaper] = useState(false);
    const [paperToDelete, setPaperToDelete] = useState(null);
    const [showPaperDeleteModal, setShowPaperDeleteModal] = useState(false);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [authLevelFilter, setAuthLevelFilter] = useState('all');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Redirect if user is not admin (authLevel 0)
    if (!user || user.authLevel !== 0) {
        return <Navigate to="/" />;
    }

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (currentTab === 'users') {
            fetchUsers();
        } else if (currentTab === 'tasks') {
            fetchTasks();
        } else if (currentTab === 'papers') {
            fetchPapers();
        }
    }, [currentTab]);

    useEffect(() => {
        // Apply filters and search whenever the source data or filter criteria change
        let result = [...users];

        // Apply search
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.username.toLowerCase().includes(lowerCaseSearch) ||
                user.email.toLowerCase().includes(lowerCaseSearch)
            );
        }

        // Apply auth level filter
        if (authLevelFilter !== 'all') {
            result = result.filter(user => user.authLevel === parseInt(authLevelFilter));
        }

        // Apply verified filter
        if (verifiedFilter !== 'all') {
            result = result.filter(user => user.verified === (verifiedFilter === 'true'));
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredUsers(result);
    }, [users, searchTerm, authLevelFilter, verifiedFilter, sortConfig]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.data.users);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            setTaskLoading(true);
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data.data.tasks);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setTaskLoading(false);
        }
    };

    const fetchPapers = async () => {
        try {
            setPaperLoading(true);
            const response = await fetch(`${API_URL}/papers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch papers');
            }

            const data = await response.json();
            setPapers(data.data.papers);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setPaperLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="text-gray-400" />;
        return sortConfig.direction === 'asc'
            ? <FontAwesomeIcon icon={faSortUp} className="text-primary" />
            : <FontAwesomeIcon icon={faSortDown} className="text-primary" />;
    };

    const handleEdit = (user) => {
        setEditingUser(user._id);
        setFormData({ ...user });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'authLevel' ? Number(value) : value,
        });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({});
    };

    const handleSave = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            setSuccess('User updated successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Refresh user list
            fetchUsers();
            setEditingUser(null);
            setFormData({});
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const confirmDelete = (userId) => {
        setUserToDelete(userId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`${API_URL}/users/${userToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Refresh user list
            fetchUsers();
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setAuthLevelFilter('all');
        setVerifiedFilter('all');
    };

    // Task management functions
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

    const handleTestCaseChange = (e) => {
        setTaskFormData({
            ...taskFormData,
            test_cases: { ...taskFormData.test_cases, description: e.target.value }
        });
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

    // Paper management functions
    const handleAddNewPaper = () => {
        setPaperFormData({
            title: '',
            year: '',
            authors: [''],
            conference: '',
            abstract: '',
            arxivLink: '',
            githubLink: '',
            citation: ''
        });
        setIsAddingPaper(true);
        setEditingPaper(null);
    };

    const handleEditPaper = (paper) => {
        setPaperFormData({
            ...paper,
            // Ensure authors is always an array
            authors: paper.authors || ['']
        });
        setEditingPaper(paper._id);
        setIsAddingPaper(false);
    };

    const handlePaperChange = (e) => {
        const { name, value } = e.target;
        setPaperFormData({
            ...paperFormData,
            [name]: value,
        });
    };

    const handleAuthorChange = (index, value) => {
        const updatedAuthors = [...paperFormData.authors];
        updatedAuthors[index] = value;
        setPaperFormData({ ...paperFormData, authors: updatedAuthors });
    };

    const addAuthor = () => {
        setPaperFormData({
            ...paperFormData,
            authors: [...paperFormData.authors, '']
        });
    };

    const removeAuthor = (index) => {
        const updatedAuthors = [...paperFormData.authors];
        updatedAuthors.splice(index, 1);
        setPaperFormData({ ...paperFormData, authors: updatedAuthors });
    };

    const handlePaperFormCancel = () => {
        setIsAddingPaper(false);
        setEditingPaper(null);
        setPaperFormData({
            title: '',
            year: '',
            authors: [''],
            conference: '',
            abstract: '',
            arxivLink: '',
            githubLink: '',
            citation: ''
        });
    };

    const handlePaperSave = async () => {
        // Filter out empty authors
        const filteredAuthors = paperFormData.authors.filter(
            author => author.trim() !== ''
        );

        if (filteredAuthors.length === 0) {
            setError('At least one author is required');
            setTimeout(() => setError(null), 3000);
            return;
        }

        const dataToSend = {
            ...paperFormData,
            authors: filteredAuthors
        };

        try {
            let response;

            if (editingPaper) {
                // Update existing paper
                response = await fetch(`${API_URL}/papers/${editingPaper}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            } else {
                // Create new paper
                response = await fetch(`${API_URL}/papers`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            }

            if (!response.ok) {
                throw new Error(editingPaper ? 'Failed to update paper' : 'Failed to create paper');
            }

            setSuccess(editingPaper ? 'Paper updated successfully' : 'Paper created successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Reset form and state
            handlePaperFormCancel();

            // Refresh paper list
            fetchPapers();
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const confirmPaperDelete = (paperId) => {
        setPaperToDelete(paperId);
        setShowPaperDeleteModal(true);
    };

    const handlePaperDelete = async () => {
        if (!paperToDelete) return;

        try {
            const response = await fetch(`${API_URL}/papers/${paperToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete paper');
            }

            setSuccess('Paper deleted successfully');
            setTimeout(() => setSuccess(null), 3000);

            // Refresh paper list
            fetchPapers();
            setShowPaperDeleteModal(false);
            setPaperToDelete(null);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading && currentTab === 'users') {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                        <p className="font-medium text-lg">Loading user data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (taskLoading && currentTab === 'tasks') {
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

    if (paperLoading && currentTab === 'papers') {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                        <p className="font-medium text-lg">Loading paper data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header Section */}
            <section className="py-12 px-4 bg-base-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300">
                        <div className="md:w-1/3 flex justify-center">
                            <img
                                src="/sa4s_logo_final.svg"
                                alt="SA4S Logo"
                                className="w-64 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
                            />
                        </div>
                        <div className="md:w-2/3">
                            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Admin Panel
                            </h1>
                            <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                                <p className="text-lg">
                                    Manage users, tasks, papers, and site settings for the SA4S research platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-full mx-40 px-4 py-8 flex-grow">
                {/* Header with title and stats */}
                <div className="card bg-base-200 shadow-xl mb-8 border border-base-300">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="bg-primary/20 text-primary rounded-full w-16">
                                        <FontAwesomeIcon icon={faUserShield} className="text-2xl" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                                    <p className="text-sm opacity-70">Select a section to manage</p>
                                </div>
                            </div>

                            <div className="tabs tabs-boxed bg-base-100">
                                <button
                                    className={`tab ${currentTab === 'users' ? 'tab-active' : ''}`}
                                    onClick={() => setCurrentTab('users')}
                                >
                                    <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                    Users
                                </button>
                                <button
                                    className={`tab ${currentTab === 'tasks' ? 'tab-active' : ''}`}
                                    onClick={() => setCurrentTab('tasks')}
                                >
                                    <FontAwesomeIcon icon={faTasks} className="mr-2" />
                                    Tasks
                                </button>
                                <button
                                    className={`tab ${currentTab === 'papers' ? 'tab-active' : ''}`}
                                    onClick={() => setCurrentTab('papers')}
                                >
                                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                                    Papers
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success/Error messages */}
                {success && (
                    <div className="alert alert-success mb-6 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{success}</span>
                        <div className="ml-auto">
                            <button className="btn btn-sm btn-ghost" onClick={() => setSuccess(null)}>Dismiss</button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                        <div className="ml-auto">
                            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>Dismiss</button>
                        </div>
                    </div>
                )}

                {currentTab === 'users' && (
                    <>
                        {/* Search and filter section */}
                        <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
                            <div className="card-body p-5">
                                <h2 className="card-title text-lg mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2 text-primary" />
                                    Search & Filters
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    {/* Search - takes more space */}
                                    <div className="form-control lg:col-span-5">
                                        <label className="label">
                                            <span className="label-text font-medium">Search</span>
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                placeholder="Search by username or email..."
                                                className="input input-bordered w-full pr-10 focus:input-primary"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/70">Search by username or email</span>
                                        </label>
                                    </div>

                                    <div className="divider lg:divider-horizontal lg:col-span-1"></div>

                                    {/* Filters group - arranged in a column on smaller screens */}
                                    <div className="lg:col-span-6">
                                        <label className="label mb-1">
                                            <span className="label-text font-medium">Filter Options</span>
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {/* Auth Level Filter */}
                                            <div className="form-control">
                                                <label className="label pt-0">
                                                    <span className="label-text">Role</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={authLevelFilter}
                                                    onChange={(e) => setAuthLevelFilter(e.target.value)}
                                                >
                                                    <option value="all">All Roles</option>
                                                    <option value="0">Admin</option>
                                                    <option value="1">Moderator</option>
                                                    <option value="2">Verified User</option>
                                                    <option value="3">Unverified User</option>
                                                </select>
                                            </div>

                                            {/* Verified Filter */}
                                            <div className="form-control">
                                                <label className="label pt-0">
                                                    <span className="label-text">Status</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={verifiedFilter}
                                                    onChange={(e) => setVerifiedFilter(e.target.value)}
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="true">Verified</option>
                                                    <option value="false">Unverified</option>
                                                </select>
                                            </div>

                                            {/* Actions */}
                                            <div className="form-control">
                                                <label className="label pt-0">
                                                    <span className="label-text">Actions</span>
                                                </label>
                                                <div className="join w-full">
                                                    <button
                                                        onClick={resetFilters}
                                                        className="join-item btn btn-outline flex-1"
                                                        disabled={!searchTerm && authLevelFilter === 'all' && verifiedFilter === 'all'}
                                                        title="Clear all filters"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                                        {/* Reset */}
                                                    </button>
                                                    <button
                                                        onClick={fetchUsers}
                                                        className="join-item btn btn-primary flex-1"
                                                        title="Refresh user data"
                                                    >
                                                        <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                                                        {/* Refresh */}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results summary */}
                                <div className="flex justify-between items-center mt-4">
                                    <div className="badge badge-lg bg-base-200 text-base-content gap-1">
                                        <FontAwesomeIcon icon={filteredUsers.length > 0 ? faUserCheck : faUserClock} className="mr-1" />
                                        <span className="font-medium">
                                            {filteredUsers.length === 0 ? 'No users found' :
                                                `Showing ${filteredUsers.length} ${filteredUsers.length === 1 ? 'user' : 'users'}`}
                                        </span>
                                        {filteredUsers.length !== users.length && filteredUsers.length > 0 && (
                                            <span className="opacity-70">(filtered from {users.length})</span>
                                        )}
                                    </div>

                                    {(searchTerm || authLevelFilter !== 'all' || verifiedFilter !== 'all') && (
                                        <button
                                            onClick={resetFilters}
                                            className="btn btn-sm btn-ghost btn-active"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User table */}
                        <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead className="bg-base-200 text-base-content">
                                        <tr>
                                            <th className="cursor-pointer hover:bg-base-300 text-center" onClick={() => handleSort('username')}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Username {getSortIcon('username')}
                                                </div>
                                            </th>
                                            <th className="cursor-pointer hover:bg-base-300 text-center" onClick={() => handleSort('email')}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Email {getSortIcon('email')}
                                                </div>
                                            </th>
                                            <th className="cursor-pointer hover:bg-base-300 text-center" onClick={() => handleSort('authLevel')}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Role {getSortIcon('authLevel')}
                                                </div>
                                            </th>
                                            <th className="cursor-pointer hover:bg-base-300 text-center" onClick={() => handleSort('verified')}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Status {getSortIcon('verified')}
                                                </div>
                                            </th>
                                            <th className="cursor-pointer hover:bg-base-300 text-center" onClick={() => handleSort('createdAt')}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Created {getSortIcon('createdAt')}
                                                </div>
                                            </th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-base-200/50">
                                                <td className="text-center">
                                                    {editingUser === user._id ? (
                                                        <input
                                                            type="text"
                                                            name="username"
                                                            value={formData.username || ''}
                                                            onChange={handleChange}
                                                            className="input input-bordered input-sm w-full text-center"
                                                        />
                                                    ) : (
                                                        <div className="font-medium">{user.username}</div>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {editingUser === user._id ? (
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email || ''}
                                                            onChange={handleChange}
                                                            className="input input-bordered input-sm w-full text-center"
                                                        />
                                                    ) : (
                                                        user.email
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {editingUser === user._id ? (
                                                        <select
                                                            name="authLevel"
                                                            value={formData.authLevel || 0}
                                                            onChange={handleChange}
                                                            className="select select-bordered select-sm w-full text-center"
                                                        >
                                                            <option value={0}>0 - Admin</option>
                                                            <option value={1}>1 - Moderator</option>
                                                            <option value={2}>2 - Verified User</option>
                                                            <option value={3}>3 - Unverified User</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`badge ${user.authLevel === 0 ? 'badge-primary' :
                                                            user.authLevel === 1 ? 'badge-secondary' :
                                                                user.authLevel === 2 ? 'badge-accent' :
                                                                    'badge-neutral'
                                                            }`}>
                                                            {user.authLevel === 0 ? 'Admin' :
                                                                user.authLevel === 1 ? 'Moderator' :
                                                                    user.authLevel === 2 ? 'Verified User' : 'Unverified User'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {editingUser === user._id ? (
                                                        <label className="cursor-pointer label justify-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="verified"
                                                                checked={formData.verified || false}
                                                                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                                                                className="toggle toggle-success toggle-sm"
                                                            />
                                                            <span className="label-text">{formData.verified ? "Verified" : "Unverified"}</span>
                                                        </label>
                                                    ) : (
                                                        user.verified ? (
                                                            <div className="badge badge-success gap-1">
                                                                <FontAwesomeIcon icon={faUserCheck} className="mr-1" />
                                                                Verified
                                                            </div>
                                                        ) : (
                                                            <div className="badge badge-ghost gap-1">
                                                                <FontAwesomeIcon icon={faUserClock} className="mr-1" />
                                                                Unverified
                                                            </div>
                                                        )
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="text-sm">
                                                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-xs opacity-70">
                                                        {new Date(user.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {editingUser === user._id ? (
                                                        <div className="flex gap-1 justify-center">
                                                            <button
                                                                onClick={() => handleSave(user._id)}
                                                                className="btn btn-circle btn-sm btn-primary"
                                                                title="Save changes"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} />
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="btn btn-circle btn-sm btn-ghost"
                                                                title="Cancel"
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1 justify-center">
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="btn btn-circle btn-sm btn-ghost hover:bg-base-200"
                                                                title="Edit user"
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(user._id)}
                                                                className="btn btn-circle btn-sm btn-ghost hover:bg-error/10 text-error"
                                                                title="Delete user"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8">
                                                    <div className="flex flex-col items-center">
                                                        <div className="avatar placeholder">
                                                            <div className="bg-base-300 text-base-content rounded-full w-16">
                                                                <span className="text-3xl">?</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-lg font-semibold mt-4">No users found</p>
                                                        <p className="text-sm text-base-content/60 mt-1">Try adjusting your search or filter criteria</p>
                                                        <button
                                                            className="btn btn-sm btn-outline mt-4"
                                                            onClick={resetFilters}
                                                        >
                                                            Clear all filters
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {currentTab === 'tasks' && (
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
                    </>
                )}

                {currentTab === 'papers' && (
                    <>
                        {/* Paper Management UI */}
                        {isAddingPaper || editingPaper ? (
                            <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
                                <div className="card-body">
                                    <h2 className="card-title flex items-center gap-2 mb-4">
                                        <button
                                            onClick={handlePaperFormCancel}
                                            className="btn btn-circle btn-sm btn-ghost"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </button>
                                        {editingPaper ? 'Edit Paper' : 'Add New Paper'}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div>
                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">Paper Title*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={paperFormData.title}
                                                    onChange={handlePaperChange}
                                                    placeholder="Enter paper title"
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                            </div>

                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">Year*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="year"
                                                    value={paperFormData.year}
                                                    onChange={handlePaperChange}
                                                    placeholder="e.g., 2025"
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                            </div>

                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">Conference</span>
                                                    <span className="label-text-alt text-base-content/70">(optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="conference"
                                                    value={paperFormData.conference || ''}
                                                    onChange={handlePaperChange}
                                                    placeholder="e.g., ICSA 2025"
                                                    className="input input-bordered w-full"
                                                />
                                            </div>

                                            <div className="form-control mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-lg font-medium">Authors*</label>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline"
                                                        onClick={addAuthor}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                                        Add Author
                                                    </button>
                                                </div>

                                                {paperFormData.authors.map((author, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={author}
                                                            onChange={(e) => handleAuthorChange(index, e.target.value)}
                                                            placeholder={`Author ${index + 1}`}
                                                            className="input input-bordered w-full"
                                                            required
                                                        />
                                                        {paperFormData.authors.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-ghost text-error"
                                                                onClick={() => removeAuthor(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div>
                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">Abstract*</span>
                                                </label>
                                                <textarea
                                                    name="abstract"
                                                    value={paperFormData.abstract}
                                                    onChange={handlePaperChange}
                                                    placeholder="Paper abstract"
                                                    className="textarea textarea-bordered h-32"
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">arXiv Link*</span>
                                                </label>
                                                <input
                                                    type="url"
                                                    name="arxivLink"
                                                    value={paperFormData.arxivLink || ''}
                                                    onChange={handlePaperChange}
                                                    placeholder="https://arxiv.org/abs/..."
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                            </div>

                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">GitHub Link</span>
                                                    <span className="label-text-alt text-base-content/70">(optional)</span>
                                                </label>
                                                <input
                                                    type="url"
                                                    name="githubLink"
                                                    value={paperFormData.githubLink || ''}
                                                    onChange={handlePaperChange}
                                                    placeholder="https://github.com/..."
                                                    className="input input-bordered w-full"
                                                />
                                            </div>

                                            <div className="form-control mb-4">
                                                <label className="label">
                                                    <span className="label-text font-medium">Citation (BibTeX)*</span>
                                                </label>
                                                <textarea
                                                    name="citation"
                                                    value={paperFormData.citation || ''}
                                                    onChange={handlePaperChange}
                                                    placeholder="@article{...}"
                                                    className="textarea textarea-bordered h-32 font-mono text-sm"
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end mt-6">
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={handlePaperFormCancel}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handlePaperSave}
                                        >
                                            {editingPaper ? 'Update Paper' : 'Create Paper'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Paper List */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Paper Management</h2>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAddNewPaper}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        Add New Paper
                                    </button>
                                </div>

                                {papers.length === 0 ? (
                                    <div className="card bg-base-100 shadow-xl border border-base-300 p-8">
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="text-5xl mb-4">📄</div>
                                            <h2 className="text-2xl font-bold mb-2">No Papers Available</h2>
                                            <p className="text-base-content/70 mb-6">Start by adding your first research paper</p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleAddNewPaper}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                Add New Paper
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {papers.map((paper) => (
                                            <div key={paper._id} className="card bg-base-100 shadow-lg hover:shadow-xl border border-base-200 transition-all">
                                                <div className="card-body p-5">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="card-title text-lg">{paper.title}</h3>
                                                            <div className="badge badge-sm badge-primary mt-1">{paper.year}</div>
                                                            {paper.conference && (
                                                                <div className="badge badge-sm badge-outline ml-2 mt-1">{paper.conference}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 mb-4">
                                                        <p className="text-xs opacity-70 mb-1">{paper.authors.join(', ')}</p>
                                                        <p className="line-clamp-3 text-sm opacity-80">{paper.abstract}</p>
                                                    </div>

                                                    <div className="card-actions justify-end">
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => handleEditPaper(paper)}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline btn-error"
                                                            onClick={() => confirmPaperDelete(paper._id)}
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
                    </>
                )}

                {/* Delete user confirmation modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="modal-box">
                            <h3 className="text-xl font-bold mb-4 text-error">Confirm Deletion</h3>
                            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
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

                {/* Delete paper confirmation modal */}
                {showPaperDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="modal-box">
                            <h3 className="text-xl font-bold mb-4 text-error">Confirm Paper Deletion</h3>
                            <p className="mb-6">Are you sure you want to delete this paper? This action cannot be undone.</p>
                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowPaperDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={handlePaperDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Admin;