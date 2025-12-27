import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ACCENT_COLORS = [
    { id: 'yellow', color: '#FDE047', darkColor: '#FACC15', label: 'Yellow' },
    { id: 'blue', color: '#60A5FA', darkColor: '#3B82F6', label: 'Blue' },
    { id: 'green', color: '#4ADE80', darkColor: '#22C55E', label: 'Green' },
    { id: 'purple', color: '#C084FC', darkColor: '#A855F7', label: 'Purple' },
    { id: 'rose', color: '#FB7185', darkColor: '#F43F5E', label: 'Rose' },
    { id: 'orange', color: '#FB923C', darkColor: '#F97316', label: 'Orange' },
];

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    accentColor: string;
    setAccentColor: (id: string) => void;
    currentAccentColor: string; // The actual hex color to use
    ACCENT_COLORS: { id: string; color: string; darkColor?: string; label: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [accentColor, setAccentColorState] = useState('yellow');

    useEffect(() => {
        loadThemeSettings();
    }, []);

    const loadThemeSettings = async () => {
        try {
            const [savedTheme, savedAccent] = await Promise.all([
                AsyncStorage.getItem('wallet_theme'),
                AsyncStorage.getItem('wallet_accent')
            ]);

            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                 setIsDarkMode(systemColorScheme === 'dark');
            }

            if (savedAccent) {
                setAccentColorState(savedAccent);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const setAccentColor = (id: string) => {
        setAccentColorState(id);
        AsyncStorage.setItem('wallet_accent', id);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            AsyncStorage.setItem('wallet_theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

       // Apply Dark Mode - React Native handles this via StatusBar and ThemeProvider, 
    // but we prefer to toggle via context to control app-wide styles manually if needed.
    
    // Note: In React Native we don't set CSS variables on root. 
    // Components must use `useTheme` to get `currentAccentColor`.

    const selectedAccent = ACCENT_COLORS.find(c => c.id === accentColor) || ACCENT_COLORS[0];
    const currentAccentColor = (isDarkMode ? selectedAccent.darkColor : selectedAccent.color) || '#FDE047';

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, accentColor, setAccentColor, currentAccentColor, ACCENT_COLORS }}>
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
