import React, { useState, useEffect } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { useUser } from '../context/UserContext';

export const LockScreen: React.FC = () => {
    const { isLocked, unlock, isBiometricsEnabled } = useSecurity();
    const { user } = useUser();
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [isBioScanning, setIsBioScanning] = useState(false);

    // Auto-trigger biometrics on mount if enabled
    useEffect(() => {
        if (isLocked && isBiometricsEnabled) {
            handleBiometricAuth();
        }
    }, [isLocked, isBiometricsEnabled]);

    const handleNumberClick = (num: string) => {
        if (input.length < 4) {
            const newInput = input + num;
            setInput(newInput);
            
            // Auto-submit on 4th digit
            if (newInput.length === 4) {
                setTimeout(() => attemptUnlock(newInput), 100);
            }
        }
    };

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1));
        setError(false);
    };

    const attemptUnlock = (pinToVerify: string) => {
        const success = unlock(pinToVerify);
        if (success) {
            setInput('');
            setError(false);
        } else {
            setError(true);
            setInput('');
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBiometricAuth = () => {
        setIsBioScanning(true);
        // Simulate Face ID / Touch ID delay
        setTimeout(() => {
            setIsBioScanning(false);
            // In a real app, this would use navigator.credentials.get()
            // Here we assume success for the simulation if they have it enabled
            unlock(localStorage.getItem('wallet_security_pin') || '');
        }, 1500);
    };

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center font-sans">
            {/* Background Blur Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
                {/* User Avatar */}
                <div className="mb-6 flex flex-col items-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 p-1 mb-4 shadow-lg">
                        {user.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                <span className="material-icons-round text-3xl text-gray-500">person</span>
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter PIN to unlock</p>
                </div>

                {/* PIN Dots */}
                <div className="flex gap-6 mb-12 h-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                i < input.length 
                                    ? 'bg-primary scale-125' 
                                    : 'bg-gray-300 dark:bg-gray-700'
                            } ${error ? 'bg-red-500 animate-bounce' : ''}`}
                        ></div>
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="w-16 h-16 rounded-full text-2xl font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto active:scale-95"
                        >
                            {num}
                        </button>
                    ))}
                    
                    {/* Bottom Row */}
                    <div className="flex items-center justify-center">
                        {isBiometricsEnabled && (
                            <button 
                                onClick={handleBiometricAuth}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-primary active:scale-95"
                            >
                                {isBioScanning ? (
                                    <span className="material-icons-round text-3xl animate-pulse">face</span>
                                ) : (
                                    <span className="material-icons-round text-3xl">face</span>
                                )}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => handleNumberClick('0')}
                        className="w-16 h-16 rounded-full text-2xl font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto active:scale-95"
                    >
                        0
                    </button>

                    <div className="flex items-center justify-center">
                        {input.length > 0 && (
                            <button
                                onClick={handleDelete}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"
                            >
                                <span className="material-icons-round text-2xl">backspace</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4 cursor-pointer hover:text-primary">Forgot PIN?</p>
            </div>
        </div>
    );
};