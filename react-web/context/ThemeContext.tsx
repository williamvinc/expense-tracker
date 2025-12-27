import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available accent colors with their RGB values for Tailwind CSS variables
// We use RGB triplets to allow Tailwind's opacity modifiers (e.g., bg-primary/50) to work
export const ACCENT_COLORS = [
    { id: 'yellow', name: 'Yellow', tailwindClass: 'bg-[#FDE047]', rgb: '253 224 71', rgbDark: '234 179 8' },
    { id: 'blue', name: 'Blue', tailwindClass: 'bg-blue-400', rgb: '96 165 250', rgbDark: '37 99 235' },
    { id: 'red', name: 'Red', tailwindClass: 'bg-red-400', rgb: '248 113 113', rgbDark: '220 38 38' },
    { id: 'purple', name: 'Purple', tailwindClass: 'bg-purple-400', rgb: '192 132 252', rgbDark: '147 51 234' },
    { id: 'green', name: 'Green', tailwindClass: 'bg-green-400', rgb: '74 222 128', rgbDark: '22 163 74' },
];

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    accentColor: string; // id of the color
    setAccentColor: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // FORCE DEFAULT LIGHT MODE logic
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('wallet_theme');
            // If explicitly saved as 'dark', use it. Otherwise default to 'light' (false).
            // Ignoring system preference to ensure light mode is default active.
            return saved === 'dark'; 
        } catch {
            return false;
        }
    });

    const [accentColor, setAccentColorState] = useState(() => {
        try {
            return localStorage.getItem('wallet_accent') || 'yellow';
        } catch {
            return 'yellow';
        }
    });

    const setAccentColor = (id: string) => {
        setAccentColorState(id);
        localStorage.setItem('wallet_accent', id);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    // Apply Dark Mode Class to HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('wallet_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('wallet_theme', 'light');
        }
    }, [isDarkMode]);

    // Apply Accent Color Variables
    useEffect(() => {
        const selected = ACCENT_COLORS.find(c => c.id === accentColor) || ACCENT_COLORS[0];
        const root = document.documentElement;
        root.style.setProperty('--color-primary', selected.rgb);
        root.style.setProperty('--color-primary-dark', selected.rgbDark);
    }, [accentColor]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, accentColor, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};