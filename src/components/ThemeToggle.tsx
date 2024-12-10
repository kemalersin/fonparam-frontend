import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg transition-colors ${
                    theme === 'light'
                        ? 'text-amber-600 bg-amber-50 dark:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Aydınlık mod"
            >
                <SunIcon className="h-5 w-5" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                        ? 'text-indigo-600 bg-indigo-50 dark:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Karanlık mod"
            >
                <MoonIcon className="h-5 w-5" />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-lg transition-colors ${
                    theme === 'system'
                        ? 'text-green-600 bg-green-50 dark:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Sistem teması"
            >
                <ComputerDesktopIcon className="h-5 w-5" />
            </button>
        </div>
    );
} 