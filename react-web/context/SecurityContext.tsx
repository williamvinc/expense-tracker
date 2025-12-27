import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SecurityContextType {
    isLocked: boolean;
    hasPin: boolean;
    isBiometricsEnabled: boolean;
    unlock: (pin: string) => boolean;
    setPin: (pin: string) => void;
    removePin: () => void;
    toggleBiometrics: (enabled: boolean) => void;
    lockApp: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pin, setPinState] = useState<string | null>(() => localStorage.getItem('wallet_security_pin'));
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(() => {
        return localStorage.getItem('wallet_biometrics') === 'true';
    });
    
    // Default to locked if a PIN exists on startup
    const [isLocked, setIsLocked] = useState<boolean>(() => !!localStorage.getItem('wallet_security_pin'));

    useEffect(() => {
        if (pin) {
            localStorage.setItem('wallet_security_pin', pin);
        } else {
            localStorage.removeItem('wallet_security_pin');
        }
    }, [pin]);

    useEffect(() => {
        localStorage.setItem('wallet_biometrics', String(isBiometricsEnabled));
    }, [isBiometricsEnabled]);

    const unlock = (inputPin: string) => {
        if (inputPin === pin) {
            setIsLocked(false);
            return true;
        }
        return false;
    };

    const setPin = (newPin: string) => {
        setPinState(newPin);
        setIsLocked(false); // Setting a PIN shouldn't immediately lock you out
    };

    const removePin = () => {
        setPinState(null);
        setIsBiometricsEnabled(false);
        setIsLocked(false);
    };

    const toggleBiometrics = (enabled: boolean) => {
        setIsBiometricsEnabled(enabled);
    };

    const lockApp = () => {
        if (pin) setIsLocked(true);
    };

    return (
        <SecurityContext.Provider value={{ 
            isLocked, 
            hasPin: !!pin, 
            isBiometricsEnabled, 
            unlock, 
            setPin, 
            removePin,
            toggleBiometrics,
            lockApp
        }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) throw new Error('useSecurity must be used within SecurityProvider');
    return context;
};