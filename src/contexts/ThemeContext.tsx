import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Tema değiştiğinde localStorage'a kaydet
        localStorage.setItem('theme', theme);

        // Sistem temasını takip etmek için
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Tema değişikliklerini uygula
        const applyTheme = () => {
            const isDark = 
                theme === 'dark' || 
                (theme === 'system' && mediaQuery.matches);
            
            root.classList.toggle('dark', isDark);
        };

        // İlk yüklemede temayı uygula
        applyTheme();

        // Sistem teması değiştiğinde güncelle
        const listener = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', listener);
        
        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 