import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    faUsers
} from "@fortawesome/free-solid-svg-icons";

const AdminUsers = ({
    users,
    setUsers,
    loading,
    setError,
    setSuccess,
    fetchUsers
}) => {
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [authLevelFilter, setAuthLevelFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const API_URL = 'http://localhost:5000/api';

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
    }, [users, searchTerm, authLevelFilter, sortConfig]);

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
    };

    if (loading) {
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

    return (
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

                                {/* Actions */}
                                <div className="form-control">
                                    <label className="label pt-0">
                                        <span className="label-text">Actions</span>
                                    </label>
                                    <div className="join w-full">
                                        <button
                                            onClick={resetFilters}
                                            className="join-item btn btn-outline flex-1"
                                            disabled={!searchTerm && authLevelFilter === 'all'}
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

                        {(searchTerm || authLevelFilter !== 'all') && (
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
        </>
    );
};

export default AdminUsers;