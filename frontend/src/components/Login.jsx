import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/authService';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { username, password } = credentials;
            await authService.login(username, password);
            setLoading(false);
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-base-100 rounded-xl shadow-md overflow-hidden p-4 sm:p-6 border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-primary">Login</h2>
                {error && <div className="bg-error/10 border border-error/30 text-error px-3 py-2 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="input input-bordered w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ?
                            <span className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                Logging in...
                            </span>
                            : 'Login'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p>Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;