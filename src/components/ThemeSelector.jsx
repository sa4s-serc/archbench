import React from 'react'

const ThemeSelector = () => {
    const [theme, setTheme] = React.useState('dark');
    
    const getSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const getCookie = (name) => {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    };

    const setCookie = (name, value, days = 365) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    const toggleTheme = (e) => {
        const isChecked = e.target.checked;
        const newTheme = isChecked ? 'dark' : 'light';
        setTheme(newTheme);
        setCookie('theme', newTheme);
    };

    React.useEffect(() => {
        // Initialize theme from cookie or system preference
        const savedTheme = getCookie('theme');
        const initialTheme = savedTheme || getSystemTheme();
        setTheme(initialTheme);
        document.querySelector('html').setAttribute('data-theme', initialTheme);
    }, []);

    React.useEffect(() => {
        document.querySelector('html').setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <label className="flex cursor-pointer gap-1 items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden sm:block">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
            <input 
                type="checkbox" 
                className="toggle toggle-sm md:toggle-md theme-controller"
                onChange={toggleTheme}
                checked={theme === 'dark'}
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden sm:block">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        </label>
    );
}

export default ThemeSelector