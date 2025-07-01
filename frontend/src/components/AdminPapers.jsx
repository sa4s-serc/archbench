import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faArrowLeft,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";

const AdminPapers = ({
    papers,
    loading,
    setError,
    setSuccess,
    fetchPapers
}) => {
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

    const API_URL = 'http://localhost:5000/api';

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

    if (loading) {
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
        </>
    );
};

export default AdminPapers;