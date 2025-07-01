import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faRefresh,
    faUserCheck,
    faUserTimes,
    faInfoCircle,
    faTrash,
    faTicketAlt,
} from "@fortawesome/free-solid-svg-icons";

const AdminTickets = ({
    tickets,
    loading,
    ticketFilter,
    setTicketFilter,
    ticketSuccess,
    setTicketSuccess,
    ticketError,
    setTicketError,
    fetchTickets
}) => {
    const [reviewTicketId, setReviewTicketId] = useState(null);
    const [reviewAction, setReviewAction] = useState('');
    const [reviewNote, setReviewNote] = useState('');
    const [showTicketReviewModal, setShowTicketReviewModal] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [showTicketDeleteModal, setShowTicketDeleteModal] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const openReviewModal = (ticketId, action) => {
        setReviewTicketId(ticketId);
        setReviewAction(action);
        setReviewNote('');
        setShowTicketReviewModal(true);
    };

    const handleTicketReview = async () => {
        try {
            const response = await fetch(`${API_URL}/tickets/${reviewTicketId}/review`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: reviewAction,
                    note: reviewNote
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process ticket');
            }

            setTicketSuccess(`Ticket ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`);
            setTimeout(() => setTicketSuccess(null), 3000);

            // Refresh tickets
            fetchTickets();

            // Close modal
            setShowTicketReviewModal(false);
            setReviewTicketId(null);
            setReviewAction('');
            setReviewNote('');
        } catch (err) {
            setTicketError(err.message);
            setTimeout(() => setTicketError(null), 3000);
        }
    };

    const confirmTicketDelete = (ticketId) => {
        setTicketToDelete(ticketId);
        setShowTicketDeleteModal(true);
    };

    const handleTicketDelete = async () => {
        if (!ticketToDelete) return;

        try {
            const response = await fetch(`${API_URL}/tickets/${ticketToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete ticket');
            }

            setTicketSuccess('Ticket history deleted successfully');
            setTimeout(() => setTicketSuccess(null), 3000);

            // Refresh tickets
            fetchTickets();
            setShowTicketDeleteModal(false);
            setTicketToDelete(null);
        } catch (err) {
            setTicketError(err.message);
            setTimeout(() => setTicketError(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                        <p className="font-medium text-lg">Loading ticket data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Success and error messages */}
            {ticketSuccess && (
                <div className="alert alert-success mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{ticketSuccess}</span>
                    <div className="ml-auto">
                        <button className="btn btn-sm btn-ghost" onClick={() => setTicketSuccess(null)}>Dismiss</button>
                    </div>
                </div>
            )}

            {ticketError && (
                <div className="alert alert-error mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{ticketError}</span>
                    <div className="ml-auto">
                        <button className="btn btn-sm btn-ghost" onClick={() => setTicketError(null)}>Dismiss</button>
                    </div>
                </div>
            )}

            {/* Filter section */}
            <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
                <div className="card-body p-5">
                    <h2 className="card-title text-lg mb-4 flex items-center">
                        <FontAwesomeIcon icon={faFilter} className="mr-2 text-primary" />
                        Filter Tickets
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`btn ${ticketFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTicketFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`btn ${ticketFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTicketFilter('approved')}
                        >
                            Approved
                        </button>
                        <button
                            className={`btn ${ticketFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTicketFilter('rejected')}
                        >
                            Rejected
                        </button>
                        <button
                            className={`btn ${ticketFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTicketFilter('all')}
                        >
                            All
                        </button>

                        <button
                            onClick={fetchTickets}
                            className="btn btn-outline ml-auto"
                            title="Refresh tickets"
                        >
                            <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Tickets table */}
            <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="loading loading-spinner loading-lg text-primary"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="avatar placeholder mb-4">
                                <div className="bg-base-300 text-base-content rounded-full w-24">
                                    <span className="text-3xl">
                                        <FontAwesomeIcon icon={faTicketAlt} />
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No tickets found</h3>
                            <p className="text-base-content/60 max-w-md mb-6">
                                {ticketFilter === 'pending'
                                    ? "There are no pending verification requests at this time."
                                    : ticketFilter === 'all'
                                        ? "There are no verification requests in the system."
                                        : `No ${ticketFilter} tickets found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead className="bg-base-200 text-base-content">
                                    <tr>
                                        <th>User</th>
                                        <th>Submitted</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket._id} className="hover:bg-base-200/50">
                                            <td>
                                                <div className="font-medium">{ticket.user.username}</div>
                                                <div className="text-xs opacity-70">{ticket.user.email}</div>
                                            </td>
                                            <td>
                                                <div>
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs opacity-70">
                                                    {new Date(ticket.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="whitespace-pre-wrap max-w-md">{ticket.reason}</div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {ticket.status === 'approved' ? (
                                                        <span className="badge badge-success">Approved</span>
                                                    ) : ticket.status === 'rejected' ? (
                                                        <span className="badge badge-error">Rejected</span>
                                                    ) : (
                                                        <span className="badge badge-warning">Pending</span>
                                                    )}
                                                </div>
                                                {(ticket.status === 'approved' || ticket.status === 'rejected') && ticket.reviewedBy && (
                                                    <div className="text-xs opacity-70 mt-1">
                                                        by {ticket.reviewedBy.username || 'Unknown'}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {ticket.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openReviewModal(ticket._id, 'approve')}
                                                            className="btn btn-sm btn-success"
                                                            title="Approve verification request"
                                                        >
                                                            <FontAwesomeIcon icon={faUserCheck} />
                                                        </button>
                                                        <button
                                                            onClick={() => openReviewModal(ticket._id, 'reject')}
                                                            className="btn btn-sm btn-error"
                                                            title="Reject verification request"
                                                        >
                                                            <FontAwesomeIcon icon={faUserTimes} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 items-center">
                                                        {ticket.reviewNote ? (
                                                            <div className="tooltip tooltip-left" data-tip={ticket.reviewNote}>
                                                                <FontAwesomeIcon
                                                                    icon={faInfoCircle}
                                                                    className="text-info cursor-help mr-2"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <FontAwesomeIcon
                                                                icon={faInfoCircle}
                                                                className="text-base-300 mr-2"
                                                                title="No review note"
                                                            />
                                                        )}
                                                        <button
                                                            onClick={() => confirmTicketDelete(ticket._id)}
                                                            className="btn btn-sm btn-outline btn-error"
                                                            title="Delete ticket history"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket review confirmation modal */}
            {showTicketReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="modal-box max-w-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={reviewAction === 'approve' ? faUserCheck : faUserTimes}
                                className={reviewAction === 'approve' ? "text-success" : "text-error"}
                            />
                            {reviewAction === 'approve' ? 'Approve' : 'Reject'} Verification Request
                        </h3>

                        <p className="mb-4">
                            Are you sure you want to {reviewAction === 'approve' ? 'approve' : 'reject'} this verification request?
                            {reviewAction === 'approve'
                                ? " The user will be promoted to verified user status."
                                : " The user will remain unverified."}
                        </p>

                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-medium">
                                    {reviewAction === 'approve' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
                                </span>
                            </label>
                            <textarea
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                                placeholder={reviewAction === 'approve'
                                    ? "Optional note about why this user is being verified"
                                    : "Explain why the verification request is being rejected"
                                }
                                className="textarea textarea-bordered w-full min-h-[100px]"
                            ></textarea>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowTicketReviewModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${reviewAction === 'approve' ? 'btn-success' : 'btn-error'}`}
                                onClick={handleTicketReview}
                                disabled={reviewAction === 'reject' && !reviewNote.trim()}
                            >
                                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete ticket confirmation modal */}
            {showTicketDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="modal-box">
                        <h3 className="text-xl font-bold mb-4 text-error">Confirm Ticket Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this ticket? This action cannot be undone.</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowTicketDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleTicketDelete}
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

export default AdminTickets;