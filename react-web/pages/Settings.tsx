import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currency, symbol, setCurrency } = useCurrency();
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } = useTheme();

  const cycleCurrency = () => {
    if (currency === 'USD') setCurrency('IDR');
    else if (currency === 'IDR') setCurrency('SGD');
    else setCurrency('USD');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark antialiased transition-colors duration-300 min-h-[100dvh] relative overflow-hidden flex flex-col">
        {/* Background Accents (Use primary color for dynamic tint) */}
        <div className="blur-accent -top-20 -right-20 dark:opacity-20"></div>
        <div className="blur-accent top-1/3 -left-20 bg-blue-400/10 dark:bg-blue-600/10 dark:opacity-20"></div>
        
        <div className="relative z-10 flex-1 flex flex-col h-full w-full pb-24 overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-20">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm flex items-center justify-center transition-transform active:scale-95 text-text-primary-light dark:text-text-primary-dark border border-gray-100 dark:border-gray-800"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">App Settings</h1>
            </header>

            <div className="px-6 space-y-8 flex-1">
                {/* Appearance Section */}
                <section>
                    <h3 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-3 ml-1">Appearance</h3>
                    <div className="bg-card-light dark:bg-card-dark rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col gap-1">
                        
                        {/* Dark Mode Toggle */}
                        <div 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-2xl transition-colors cursor-pointer" 
                            onClick={toggleDarkMode}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                        <span className="material-icons-round">dark_mode</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Dark Mode</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Adjust screen brightness</p>
                                    </div>
                                </div>
                                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Accent Colors */}
                        <div className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-2xl transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark">
                                        <span className="material-icons-round">palette</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Accent Colors</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Customize theme</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setAccentColor(color.id)}
                                            className={`w-6 h-6 rounded-full ${color.tailwindClass} transition-transform hover:scale-110 ${accentColor === color.id ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600 dark:ring-offset-gray-800 scale-110' : ''}`}
                                            aria-label={`Select ${color.name} Accent`}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section>
                    <h3 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-3 ml-1">Preferences</h3>
                    <div className="bg-card-light dark:bg-card-dark rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col gap-1">
                        
                        {/* Currency */}
                        <div 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-2xl transition-colors cursor-pointer"
                            onClick={cycleCurrency}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <span className="material-icons-round">attach_money</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Currency</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Tap to switch</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{currency} ({symbol})</span>
                                    <span className="material-icons-round text-gray-400 text-xl">chevron_right</span>
                                </div>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-2xl transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <span className="material-icons-round">language</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Language</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">English (US)</p>
                                    </div>
                                </div>
                                <span className="material-icons-round text-gray-400 text-xl">chevron_right</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <h3 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-3 ml-1">Security</h3>
                    <div className="bg-card-light dark:bg-card-dark rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        
                        {/* Face ID */}
                        <div className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-2xl transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <span className="material-icons-round">face</span>
                                    </div>
                                    <span className="font-bold text-text-primary-light dark:text-text-primary-dark">Face ID</span>
                                </div>
                                <div className="relative w-11 h-6 bg-primary rounded-full transition-colors duration-200">
                                    <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <section className="pb-4">
                    <div className="bg-card-light dark:bg-card-dark rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <span className="font-bold text-text-primary-light dark:text-text-primary-dark">About & Legal</span>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">v2.4.0</span>
                    </div>
                    <div className="mt-8 text-center">
                        <button className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors">Log Out</button>
                    </div>
                </section>
            </div>
        </div>
    </div>
  );
};