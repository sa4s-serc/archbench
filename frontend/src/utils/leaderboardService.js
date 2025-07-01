// filepath: /home/avilol/Downloads/GitHub/archbench/frontend/src/utils/leaderboardService.js
const API_URL = 'http://localhost:5000/api';

export const leaderboardService = {
    // Get all entries across all tasks
    getAllEntries: async () => {
        try {
            const response = await fetch(`${API_URL}/leaderboard`, {
                credentials: 'include' // Include cookies for authentication
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching all entries:', error);
            throw error;
        }
    },

    // Get entries for a specific task
    getTaskLeaderboard: async (taskId) => {
        try {
            const response = await fetch(`${API_URL}/leaderboard/task/${taskId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        } catch (error) {
            console.error('Error fetching task leaderboard:', error);
            throw error;
        }
    },

    // Get specific entry
    getEntry: async (entryId) => {
        try {
            const response = await fetch(`${API_URL}/leaderboard/${entryId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        } catch (error) {
            console.error('Error fetching entry:', error);
            throw error;
        }
    },

    // Create new entry
    createEntry: async (entryData) => {
        try {
            const response = await fetch(`${API_URL}/leaderboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(entryData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        } catch (error) {
            console.error('Error creating entry:', error);
            throw error;
        }
    },

    // Update existing entry
    updateEntry: async (entryId, entryData) => {
        try {
            const response = await fetch(`${API_URL}/leaderboard/${entryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(entryData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        } catch (error) {
            console.error('Error updating entry:', error);
            throw error;
        }
    },

    // Delete an entry
    deleteEntry: async (entryId) => {
        try {
            const response = await fetch(`${API_URL}/leaderboard/${entryId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw data;
            }

            return { status: 'success' };
        } catch (error) {
            console.error('Error deleting entry:', error);
            throw error;
        }
    }
};