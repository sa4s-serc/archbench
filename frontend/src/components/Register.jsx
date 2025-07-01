import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/authService';

const Register = ({ onRegisterSuccess }) => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (userData.password !== userData.passwordConfirm) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            await authService.register(userData);
            setLoading(false);
            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-base-100 rounded-xl shadow-md overflow-hidden p-4 sm:p-6 border-2 border-secondary/30 bg-gradient-to-b from-secondary/5 to-transparent">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-secondary">Register</h2>
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
                            value={userData.username}
                            onChange={handleChange}
                            required
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
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
                            value={userData.password}
                            onChange={handleChange}
                            required
                            minLength="8"
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="passwordConfirm"
                            name="passwordConfirm"
                            value={userData.passwordConfirm}
                            onChange={handleChange}
                            required
                            minLength="8"
                            className="input input-bordered w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-secondary w-full"
                    >
                        {loading ?
                            <span className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                Registering...
                            </span>
                            : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p>Already have an account? <Link to="/login" className="text-secondary hover:underline font-medium">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;