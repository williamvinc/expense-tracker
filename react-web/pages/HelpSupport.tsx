import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HelpSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-[100dvh] relative flex flex-col font-sans transition-colors duration-300">
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center gap-4 relative z-10">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm flex items-center justify-center transition-transform active:scale-95 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800"
            >
                <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        </header>

        <div className="flex-1 px-6 pt-10 flex flex-col items-center text-center overflow-y-auto no-scrollbar pb-10">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <span className="material-icons-round text-5xl text-blue-500">support_agent</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Need Assistance?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-xs">
                If you have any questions, encountered a bug, or just want to say hi, feel free to reach out directly.
            </p>

            <div className="w-full max-w-xs bg-white dark:bg-card-dark rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 transition-transform hover:scale-[1.02]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Developer Contact</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="material-icons-round text-gray-400 text-sm">alternate_email</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white break-all">wiliam@insignia.co.id</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Monday - Friday, 9AM - 5PM</p>
            </div>

            <a 
                href="mailto:wiliam@insignia.co.id"
                className="w-full max-w-xs bg-primary hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-3xl shadow-lg shadow-yellow-200/50 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <span className="material-icons-round">email</span>
                Email Me
            </a>
            
            <div className="mt-auto pt-12 text-center opacity-50">
                <p className="text-xs text-gray-400">App Version 2.4.0</p>
            </div>
        </div>
    </div>
  );
};