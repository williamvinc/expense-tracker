import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar: string; // URL or base64
}

interface UserContextType {
    user: UserProfile;
    isOnboarded: boolean;
    updateUser: (data: Partial<UserProfile>) => void;
    completeOnboarding: (name: string, email?: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Check if user has completed onboarding based on localStorage flag
    const [isOnboarded, setIsOnboarded] = useState(() => {
        return localStorage.getItem('wallet_onboarding_complete') === 'true';
    });

    const [user, setUser] = useState<UserProfile>(() => {
        try {
            const saved = localStorage.getItem('wallet_user_profile');
            return saved ? JSON.parse(saved) : {
                name: '',
                email: '',
                phone: '',
                address: '',
                avatar: '' 
            };
        } catch {
            return {
                name: '',
                email: '',
                phone: '',
                address: '',
                avatar: ''
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('wallet_user_profile', JSON.stringify(user));
    }, [user]);

    const updateUser = (data: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    const completeOnboarding = (name: string, email: string = '') => {
        setUser(prev => ({
            ...prev,
            name,
            email
        }));
        setIsOnboarded(true);
        localStorage.setItem('wallet_onboarding_complete', 'true');
    };

    return (
        <UserContext.Provider value={{ user, isOnboarded, updateUser, completeOnboarding }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};