import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

export const Onboarding: React.FC = () => {
    const { completeOnboarding } = useUser();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNext = () => {
        if (!name.trim()) return;
        setIsAnimating(true);
        setTimeout(() => {
            completeOnboarding(name, email);
        }, 500);
    };

    return (
        <div className="h-[100dvh] bg-surface-light dark:bg-background-dark flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className={`flex-1 flex flex-col px-8 pt-20 pb-8 transition-opacity duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Logo / Icon */}
                <div className="mb-10">
                    <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-lg shadow-yellow-200/50 mb-6 rotate-3">
                        <span className="material-icons-round text-4xl text-gray-900">account_balance_wallet</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        Let's set up your <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-yellow-500">Virtual Wallet</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Manage your finances with ease.
                    </p>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label className="text-sm font-bold text-gray-900 dark:text-white ml-1">
                            What should we call you? <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-white dark:bg-card-dark border-none rounded-2xl p-5 text-lg font-medium text-gray-900 dark:text-white shadow-input focus:ring-2 focus:ring-primary/50 transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label className="text-sm font-bold text-gray-900 dark:text-white ml-1">
                            Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-white dark:bg-card-dark border-none rounded-2xl p-5 text-lg font-medium text-gray-900 dark:text-white shadow-input focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!name.trim()}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg py-5 rounded-[1.5rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                >
                    Get Started
                    <span className="material-icons-round">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};