// filepath: /home/avilol/Downloads/GitHub/archbench/frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../components/Footer";
import AdminUsers from '../components/AdminUsers';
import AdminTasks from '../components/AdminTasks';
import AdminPapers from '../components/AdminPapers';
import AdminTickets from '../components/AdminTickets';
import {
    faUsers,
    faTasks,
    faBook,
    faTicketAlt
} from "@fortawesome/free-solid-svg-icons";

const Admin = () => {
    const { user } = useAuth();
    // Users state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tasks state
    const [tasks, setTasks] = useState([]);
    const [taskLoading, setTaskLoading] = useState(true);

    // Papers state
    const [papers, setPapers] = useState([]);
    const [paperLoading, setPaperLoading] = useState(true);

    // Verification tickets state
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [ticketFilter, setTicketFilter] = useState('pending');
    const [ticketSuccess, setTicketSuccess] = useState(null);
    const [ticketError, setTicketError] = useState(null);

    // Shared state
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Tab management
    const [currentTab, setCurrentTab] = useState('users');

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
        } else if (currentTab === 'tickets') {
            fetchTickets();
        }
    }, [currentTab]);

    // New useEffect to refetch tickets when filter changes
    useEffect(() => {
        if (currentTab === 'tickets') {
            fetchTickets();
        }
    }, [ticketFilter]);

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

    const fetchTickets = async () => {
        try {
            setTicketsLoading(true);
            const response = await fetch(`${API_URL}/tickets?status=${ticketFilter}`, {
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
            setTickets(data.data.tickets);
        } catch (err) {
            setTicketError(err.message);
            setTimeout(() => setTicketError(null), 3000);
        } finally {
            setTicketsLoading(false);
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
                            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Admin Panel
                            </h1>
                            <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                                <p className="text-lg">
                                    Manage users, tasks, papers, and site settings for the SA4S research platform.
                                </p>

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
                                    <button
                                        className={`tab tab-bordered ${currentTab === 'tickets' ? 'tab-active' : ''}`}
                                        onClick={() => setCurrentTab('tickets')}
                                    >
                                        <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
                                        Verification Tickets
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-full mx-40 px-4 py-8 flex-grow">
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

                {/* Render the appropriate component based on the current tab */}
                {currentTab === 'users' && (
                    <AdminUsers
                        users={users}
                        setUsers={setUsers}
                        loading={loading}
                        setError={setError}
                        setSuccess={setSuccess}
                        fetchUsers={fetchUsers}
                    />
                )}

                {currentTab === 'tasks' && (
                    <AdminTasks
                        tasks={tasks}
                        loading={taskLoading}
                        setError={setError}
                        setSuccess={setSuccess}
                        fetchTasks={fetchTasks}
                    />
                )}

                {currentTab === 'papers' && (
                    <AdminPapers
                        papers={papers}
                        loading={paperLoading}
                        setError={setError}
                        setSuccess={setSuccess}
                        fetchPapers={fetchPapers}
                    />
                )}

                {currentTab === 'tickets' && (
                    <AdminTickets
                        tickets={tickets}
                        loading={ticketsLoading}
                        ticketFilter={ticketFilter}
                        setTicketFilter={setTicketFilter}
                        ticketSuccess={ticketSuccess}
                        setTicketSuccess={setTicketSuccess}
                        ticketError={ticketError}
                        setTicketError={setTicketError}
                        fetchTickets={fetchTickets}
                    />
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Admin;