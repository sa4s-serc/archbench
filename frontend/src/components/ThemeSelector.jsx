import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

const ThemeSelector = () => {
    // Initialize state from the current theme already applied to the document
    // This ensures we're in sync with what the inline script already set
    const [theme, setTheme] = React.useState(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return currentTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // Set up listener for system theme changes (only when user hasn't set preference)
    React.useEffect(() => {
        if (!localStorage.getItem('theme')) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Save user's preference
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <FontAwesomeIcon
                icon={faSun}
                className={`text-yellow-500 ${theme === 'light' ? 'text-yellow-400 opacity-100' : 'opacity-60'} transition-all duration-300 text-lg`}
            />

            <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                <span className="sr-only">Switch theme</span>
                <span
                    className={`${theme === 'dark' ? 'bg-primary/80' : 'bg-base-300'} w-full h-full rounded-full shadow-inner transition-colors duration-300`}
                />
                <span
                    className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} absolute top-0.5 left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
                />
            </button>

            <FontAwesomeIcon
                icon={faMoon}
                className={`text-blue-400 ${theme === 'dark' ? 'text-blue-300 opacity-100' : 'opacity-60'} transition-all duration-300 text-lg`}
            />
        </div>
    );
}

export default ThemeSelector