import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-[100dvh] flex justify-center font-sans text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
      <div className="w-full max-w-md bg-background-light dark:bg-background-dark min-h-[100dvh] relative shadow-2xl overflow-hidden border-x border-gray-200 dark:border-gray-800 transition-colors duration-300">
        {children}
      </div>
    </div>
  );
};