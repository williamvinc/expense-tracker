import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';

export const Security: React.FC = () => {
    const navigate = useNavigate();
    const { hasPin, setPin, removePin, isBiometricsEnabled, toggleBiometrics, unlock } = useSecurity();
    
    // UI State for PIN Creation/Removal Mode
    const [view, setView] = useState<'settings' | 'create_pin' | 'confirm_pin' | 'verify_pin_to_remove'>('settings');
    const [tempPin, setTempPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const handleNumberClick = (num: string) => {
        setError('');
        
        if (view === 'create_pin') {
            if (tempPin.length < 4) {
                const newVal = tempPin + num;
                setTempPin(newVal);
                if (newVal.length === 4) {
                    setTimeout(() => setView('confirm_pin'), 200);
                }
            }
        } else if (view === 'confirm_pin') {
            if (confirmPin.length < 4) {
                const newVal = confirmPin + num;
                setConfirmPin(newVal);
                if (newVal.length === 4) {
                    if (newVal === tempPin) {
                        setPin(newVal);
                        setView('settings');
                        setTempPin('');
                        setConfirmPin('');
                    } else {
                        setError("PINs don't match. Try again.");
                        setTimeout(() => {
                            setConfirmPin('');
                            setTempPin('');
                            setView('create_pin');
                        }, 1000);
                    }
                }
            }
        } else if (view === 'verify_pin_to_remove') {
            if (tempPin.length < 4) {
                const newVal = tempPin + num;
                setTempPin(newVal);
                if (newVal.length === 4) {
                    // Check if PIN is correct
                    if (unlock(newVal)) {
                        removePin();
                        setView('settings');
                        setTempPin('');
                    } else {
                        setError("Incorrect PIN");
                        // Shake effect or delay before clear
                        setTimeout(() => {
                            setTempPin('');
                        }, 1000);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        if (view === 'create_pin' || view === 'verify_pin_to_remove') setTempPin(prev => prev.slice(0, -1));
        if (view === 'confirm_pin') setConfirmPin(prev => prev.slice(0, -1));
    };

    // --- Render Numpad ---
    const renderNumpad = (title: string, dots: string) => (
        <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col items-center justify-center animate-slide-up">
            <button 
                onClick={() => { setView('settings'); setTempPin(''); setConfirmPin(''); }}
                className="absolute top-8 left-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
                <span className="material-icons-round text-gray-900 dark:text-white">close</span>
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-sm text-red-500 h-4 mb-8 font-medium">{error}</p>

            <div className="flex gap-6 mb-12 h-4">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < dots.length ? 'bg-primary scale-125' : 'bg-gray-200 dark:bg-gray-700'} ${error ? 'bg-red-500' : ''}`}></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                     <button key={num} onClick={() => handleNumberClick(num.toString())} className="w-20 h-20 rounded-full text-3xl font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90">
                         {num}
                     </button>
                 ))}
                 <div className="w-20 h-20"></div>
                 <button onClick={() => handleNumberClick('0')} className="w-20 h-20 rounded-full text-3xl font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90">0</button>
                 <button onClick={handleDelete} className="w-20 h-20 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90">
                     <span className="material-icons-round text-2xl">backspace</span>
                 </button>
            </div>
        </div>
    );

    if (view === 'create_pin') return renderNumpad('Create a PIN', tempPin);
    if (view === 'confirm_pin') return renderNumpad('Confirm your PIN', confirmPin);
    if (view === 'verify_pin_to_remove') return renderNumpad('Enter PIN to Disable', tempPin);

    // --- Main Settings View ---
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-[100dvh] relative flex flex-col font-sans transition-colors duration-300">
             <header className="px-6 pt-8 pb-4 flex items-center gap-4 relative z-10">
                <button 
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm flex items-center justify-center transition-transform active:scale-95 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Security</h1>
            </header>

            <div className="p-6 space-y-6">
                <div className="bg-white dark:bg-card-dark rounded-[1.5rem] p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* App PIN Toggle */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="material-icons-round">lock</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">App PIN</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Require PIN to open app</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={hasPin}
                                onChange={() => hasPin ? setView('verify_pin_to_remove') : setView('create_pin')}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Change PIN (Only if PIN enabled) */}
                    {hasPin && (
                        <div 
                            onClick={() => setView('create_pin')}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800/50"
                        >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <span className="material-icons-round">pin</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">Change PIN</span>
                            </div>
                            <span className="material-icons-round text-gray-300">chevron_right</span>
                        </div>
                    )}

                    {/* Biometrics Toggle (Only if PIN enabled) */}
                    <div className={`p-4 flex items-center justify-between transition-opacity ${!hasPin ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span className="material-icons-round">face</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Face ID / Touch ID</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Unlock with biometrics</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isBiometricsEnabled}
                                onChange={(e) => toggleBiometrics(e.target.checked)}
                                disabled={!hasPin}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 px-8">
                    When enabled, you'll need to enter your PIN or use biometrics every time you open the app.
                </p>
            </div>
        </div>
    );
};