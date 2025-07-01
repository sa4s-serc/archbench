const API_URL = 'http://localhost:5000/api';

export const authService = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('user', JSON.stringify(data.data.user));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('user', JSON.stringify(data.data.user));
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include',
            });

            localStorage.removeItem('user');
            return response.ok;
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('user');
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;

            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                this.logout();
                return null;
            }

            const data = await response.json();
            return data.data.user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    isAuthenticated() {
        const user = localStorage.getItem('user');
        return !!user;
    },
};