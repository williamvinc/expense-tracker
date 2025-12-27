import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface SecurityContextType {
    isLocked: boolean;
    pin: string | null; // Added
    isBiometricsEnabled: boolean;
    isBiometricsSupported: boolean; // Added
    unlock: (pin: string) => boolean;
    setPin: (pin: string | null) => void; // Modified to accept null
    removePin: () => void;
    toggleBiometrics: (enabled: boolean) => void;
    lockApp: () => void;
    authenticateWithBiometrics: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pin, setPinState] = useState<string | null>(null);
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);
    const [isBiometricsSupported, setIsBiometricsSupported] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(false);

    useEffect(() => {
        checkBiometricsSupport();
        loadSecuritySettings();
    }, []);

    const loadSecuritySettings = async () => {
        try {
            const [savedPin, savedBio] = await Promise.all([
                 AsyncStorage.getItem('wallet_security_pin'),
                 AsyncStorage.getItem('wallet_biometrics')
            ]);

            if (savedPin) {
                setPinState(savedPin);
                setIsLocked(true); // Lock on startup if PIN exists
            }
            if (savedBio === 'true') {
                setIsBiometricsEnabled(true);
            }
        } catch (e) {
            console.error('Failed to load security settings', e);
        }
    };

    const checkBiometricsSupport = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricsSupported(compatible);
        } catch (e) {
            console.error('Failed to check biometrics support', e);
        }
    };

    const unlock = (inputPin: string) => {
        if (inputPin === pin) {
            setIsLocked(false);
            return true;
        }
        return false;
    };

    const setPin = (newPin: string | null) => {
        setPinState(newPin);
        if (newPin) {
            setIsLocked(false); 
            AsyncStorage.setItem('wallet_security_pin', newPin);
        } else {
             // If null is passed, it acts like removePin, but let's keep it simple or delegate
             AsyncStorage.removeItem('wallet_security_pin');
        }
    };

    const removePin = () => {
        setPinState(null);
        setIsBiometricsEnabled(false);
        setIsLocked(false);
        AsyncStorage.removeItem('wallet_security_pin');
        AsyncStorage.setItem('wallet_biometrics', 'false');
    };

    const toggleBiometrics = (enabled: boolean) => {
        setIsBiometricsEnabled(enabled);
        AsyncStorage.setItem('wallet_biometrics', String(enabled));
    };

    const lockApp = () => {
        if (pin) setIsLocked(true);
    };

    const authenticateWithBiometrics = async (): Promise<boolean> => {
        if (!isBiometricsEnabled) return false;
        
        try {
             const hasHardware = await LocalAuthentication.hasHardwareAsync();
             const isEnrolled = await LocalAuthentication.isEnrolledAsync();
             
             if (!hasHardware || !isEnrolled) return false;

             const result = await LocalAuthentication.authenticateAsync({
                 promptMessage: 'Unlock Wallet',
                 fallbackLabel: 'Use PIN'
             });

             if (result.success) {
                 setIsLocked(false);
                 return true;
             }
             return false;
        } catch (e) {
            console.error('Biometric auth failed', e);
            return false;
        }
    };

    return (
        <SecurityContext.Provider value={{ 
            isLocked, 
            pin, // Added to context value
            isBiometricsEnabled, 
            isBiometricsSupported, // Added to context value
            unlock, 
            setPin, 
            removePin,
            toggleBiometrics,
            lockApp,
            authenticateWithBiometrics
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
