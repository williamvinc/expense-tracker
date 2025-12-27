import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [onboardingStatus, savedUser] = await Promise.all([
                AsyncStorage.getItem('wallet_onboarding_complete'),
                AsyncStorage.getItem('wallet_user_profile')
            ]);
            
            if (onboardingStatus === 'true') {
                setIsOnboarded(true);
            }

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error('Failed to load user data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (data: Partial<UserProfile>) => {
        const newUser = { ...user, ...data };
        setUser(newUser);
        await AsyncStorage.setItem('wallet_user_profile', JSON.stringify(newUser));
    };

    const completeOnboarding = async (name: string, email: string = '') => {
        const newUser = {
            ...user,
            name,
            email
        };
        setUser(newUser);
        setIsOnboarded(true);
        
        await Promise.all([
            AsyncStorage.setItem('wallet_user_profile', JSON.stringify(newUser)),
            AsyncStorage.setItem('wallet_onboarding_complete', 'true')
        ]);
    };

    return (
        <UserContext.Provider value={{ user, isOnboarded, updateUser, completeOnboarding, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
