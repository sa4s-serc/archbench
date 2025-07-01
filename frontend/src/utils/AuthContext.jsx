import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage first to avoid flashing/redirects
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const [user, setUser] = useState(storedUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Only check with server if we think we're logged in
                if (storedUser) {
                    const currentUser = await authService.getCurrentUser();
                    if (currentUser) {
                        setUser(currentUser);
                    } else {
                        // If server says no valid session but we have localStorage data
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            setUser(response.data.user);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await authService.register(userData);
            setUser(response.data.user);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {loading && storedUser ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;