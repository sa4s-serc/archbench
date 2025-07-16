// filepath: /home/avilol/Downloads/GitHub/archbench/frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Footer from "../components/Footer";
import {
    faUser,
    faEnvelope,
    faLock,
    faShieldAlt,
    faCheckCircle,
    faTimesCircle,
    faExclamationCircle,
    faUserCheck,
    faHistory,
    faMedal,
    faTimes,
    faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    const { user, isAuthenticated, updateProfile, updatePassword } = useAuth();
    const navigate = useNavigate();
    const API_URL = 'http://localhost:5000/api';

    // States for form data
    const [profileData, setProfileData] = useState({ email: '' });
    const [passwordData, setPasswordData] = useState({
        passwordCurrent: '',
        password: '',
        passwordConfirm: ''
    });
    const [ticketData, setTicketData] = useState({
        reason: ''
    });

    // Status messages
    const [profileSuccess, setProfileSuccess] = useState(null);
    const [profileError, setProfileError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [ticketSuccess, setTicketSuccess] = useState(null);
    const [ticketError, setTicketError] = useState(null);

    // Loading states
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

    // Tickets state
    const [userTickets, setUserTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setProfileData({
                email: user.email || '',
            });

            // Fetch user's tickets if user is unverified
            if (user.authLevel === 3) {
                fetchUserTickets();
            }
        }
    }, [user]);

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const fetchUserTickets = async () => {
        try {
            setLoadingTickets(true);
            const response = await fetch(`${API_URL}/tickets/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }

            const data = await response.json();
            setUserTickets(data.data.tickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handleTicketChange = (e) => {
        const { name, value } = e.target;
        setTicketData({
            ...ticketData,
            [name]: value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileSuccess(null);
        setProfileError(null);
        setIsSubmittingProfile(true);

        try {
            await updateProfile({ email: profileData.email });
            setProfileSuccess('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setProfileSuccess(null), 3000);
        } catch (error) {
            setProfileError(error.message || 'Failed to update profile');
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordSuccess(null);
        setPasswordError(null);

        // Validate passwords
        if (passwordData.password !== passwordData.passwordConfirm) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (passwordData.password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        setIsSubmittingPassword(true);

        try {
            await updatePassword(passwordData);
            setPasswordSuccess('Password updated successfully!');

            // Reset password fields
            setPasswordData({
                passwordCurrent: '',
                password: '',
                passwordConfirm: ''
            });

            // Clear success message after 3 seconds
            setTimeout(() => setPasswordSuccess(null), 3000);
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password');
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        setTicketSuccess(null);
        setTicketError(null);

        if (!ticketData.reason.trim()) {
            setTicketError('Please provide a reason for verification');
            return;
        }

        setIsSubmittingTicket(true);

        try {
            const response = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticketData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit verification request');
            }

            setTicketSuccess('Verification request submitted successfully!');
            setTicketData({ reason: '' });

            // Refresh tickets list
            fetchUserTickets();

            // Clear success message after 3 seconds
            setTimeout(() => setTicketSuccess(null), 3000);
        } catch (error) {
            setTicketError(error.message);
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    const getRoleBadge = () => {
        switch (user.authLevel) {
            case 0:
                return <span className="badge badge-primary">Admin</span>;
            case 1:
                return <span className="badge badge-secondary">Moderator</span>;
            case 2:
                return <span className="badge badge-accent">Verified User</span>;
            default:
                return <span className="badge badge-neutral">Unverified User</span>;
        }
    };

    const getTicketStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success">Approved</span>;
            case 'rejected':
                return <span className="badge badge-error">Rejected</span>;
            default:
                return <span className="badge badge-warning">Pending</span>;
        }
    };

    const openSubmitModal = () => {
        document.getElementById("submit_modal").showModal();
    };

    const closeModal = (e) => {
        const modal = document.getElementById("submit_modal");
        if (e.target === modal) {
            modal.close();
        }
    };

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
                                className="w-48 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
                            />
                        </div>
                        <div className="md:w-2/3">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Hi, {user.username || 'User'}!
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {getRoleBadge()}
                            </div>
                            <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                                <p className="text-lg">
                                    Manage your account settings and password
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 py-8 flex-grow">
                {/* Profile Content */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Account Information Card */}
                    <div className="card bg-base-100 shadow-md border border-base-200">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="card-title text-lg flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="mr-2 text-primary" />
                                    Account Information
                                </h2>
                                <div className="text-xs opacity-70">
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm opacity-70">Username</div>
                                    <div className="text-base font-medium">{user.username}</div>
                                </div>

                                <div>
                                    <div className="text-sm opacity-70">Email</div>
                                    <div className="text-base">{user.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Request Card - Only visible for unverified users */}
                    {user.authLevel === 3 && (
                        <div className="card bg-base-100 shadow-md border border-base-200">
                            <div className="card-body p-6">
                                <h2 className="card-title text-lg mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faUserCheck} className="mr-2 text-warning" />
                                    Request Verification
                                </h2>

                                {ticketSuccess && (
                                    <div className="alert alert-success mb-4">
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                        {ticketSuccess}
                                    </div>
                                )}

                                {ticketError && (
                                    <div className="alert alert-error mb-4">
                                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                                        {ticketError}
                                    </div>
                                )}

                                {/* Show pending tickets if any */}
                                {userTickets.filter(ticket => ticket.status === 'pending').length > 0 ? (
                                    <div className="alert alert-info mb-4">
                                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                                        You already have a pending verification request. Please wait for an admin or moderator to review it.
                                    </div>
                                ) : (
                                    <form onSubmit={handleTicketSubmit}>
                                        <div className="form-control mb-4">
                                            <label className="label">
                                                <span className="label-text font-medium">Reason for Verification</span>
                                            </label>
                                            <textarea
                                                name="reason"
                                                value={ticketData.reason}
                                                onChange={handleTicketChange}
                                                placeholder="Explain why you should be verified (e.g., your role, contributions, etc.)"
                                                className="textarea textarea-bordered w-full min-h-[100px]"
                                                required
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className={`btn btn-warning ${isSubmittingTicket ? 'loading' : ''}`}
                                            disabled={isSubmittingTicket}
                                        >
                                            Submit Verification Request
                                        </button>
                                    </form>
                                )}

                                {/* Ticket History */}
                                {userTickets.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-semibold flex items-center mb-3">
                                            <FontAwesomeIcon icon={faHistory} className="mr-2" />
                                            Verification Request History
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userTickets.map(ticket => (
                                                        <tr key={ticket._id}>
                                                            <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                            <td>{getTicketStatusBadge(ticket.status)}</td>
                                                            <td>
                                                                {ticket.reviewNote ?
                                                                    ticket.reviewNote :
                                                                    ticket.status === 'pending' ?
                                                                        'Awaiting review' : 'No notes'
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Update Email Card */}
                    <div className="card bg-base-100 shadow-md border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="card-title text-lg mb-4 flex items-center">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-secondary" />
                                Update Email
                            </h2>

                            {profileSuccess && (
                                <div className="alert alert-success mb-4">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                    {profileSuccess}
                                </div>
                            )}

                            {profileError && (
                                <div className="alert alert-error mb-4">
                                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                                    {profileError}
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="form-control flex-1">
                                    <label className="label">
                                        <span className="label-text font-medium">Email Address</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        placeholder="Your email address"
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary ${isSubmittingProfile ? 'loading' : ''}`}
                                    disabled={isSubmittingProfile}
                                >
                                    Update Email
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card bg-base-100 shadow-md border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="card-title text-lg mb-4 flex items-center">
                                <FontAwesomeIcon icon={faLock} className="mr-2 text-accent" />
                                Change Password
                            </h2>

                            {passwordSuccess && (
                                <div className="alert alert-success mb-4">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                    {passwordSuccess}
                                </div>
                            )}

                            {passwordError && (
                                <div className="alert alert-error mb-4">
                                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                                    {passwordError}
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Current Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="passwordCurrent"
                                            value={passwordData.passwordCurrent}
                                            onChange={handlePasswordChange}
                                            placeholder="Your current password"
                                            className="input input-bordered w-full"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordData.password}
                                            onChange={handlePasswordChange}
                                            placeholder="New password (min 8 characters)"
                                            className="input input-bordered w-full"
                                            required
                                            minLength="8"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Confirm Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="passwordConfirm"
                                            value={passwordData.passwordConfirm}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm new password"
                                            className="input input-bordered w-full"
                                            required
                                            minLength="8"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm opacity-70 bg-base-200 p-2 rounded-md inline-flex items-center">
                                        <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                                        Password must be at least 8 characters
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn btn-accent ${isSubmittingPassword ? 'loading' : ''}`}
                                        disabled={isSubmittingPassword}
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>


                    {/* Contact Section */}
                    {/* <section className="py-8 px-4 bg-base-200"> */}
                        <div className="max-w-6xl mx-auto">
                            <div className="card bg-base-100 shadow-md border border-base-300">
                                <div className="card-body p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between">
                                        <div className="flex items-center mb-4 md:mb-0">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-primary text-2xl mr-4" />
                                            <div>
                                                <h3 className="font-semibold text-lg">Need help?</h3>
                                                <p>For more information, please contact us at:</p>
                                            <p className="font-medium text-primary">bassam.adnan@research.iiit.ac.in</p>
                                            <p className="font-medium text-primary">aviral.gupta@research.iiit.ac.in</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/* </section> */}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Profile;