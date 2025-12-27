import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: 'grid_view', label: 'Home', path: '/' },
    { icon: 'pie_chart', label: 'Stats', path: '/stats' },
    { icon: 'add', label: 'Add', path: '/add-transaction', isFab: true },
    { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
    { icon: 'person', label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto z-40 bg-surface-light dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 pb-safe pt-2 transition-colors duration-300">
      <style>{`
        @keyframes nav-pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); }
        }
        .animate-nav-pop {
            animation: nav-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
      <div className="flex justify-between items-end px-6 pb-4 pt-2">
        {navItems.map((item) => {
          if (item.isFab) {
             return (
                <div key={item.path} className="relative -top-8 flex justify-center">
                    <button 
                      onClick={() => navigate(item.path, { state: { backgroundLocation: location } })}
                      className="group w-16 h-16 bg-gray-900 dark:bg-primary rounded-full flex items-center justify-center text-primary dark:text-gray-900 shadow-2xl shadow-gray-900/40 dark:shadow-yellow-400/20 ring-4 ring-surface-light dark:ring-card-dark transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-110 hover:-translate-y-1 active:scale-90 active:translate-y-0 active:shadow-sm overflow-hidden"
                    >
                        <span className="material-icons-round text-3xl transition-transform duration-500 group-hover:rotate-90 group-active:rotate-[135deg]">add</span>
                    </button>
                </div>
             );
          }

          const active = isActive(item.path);
          
          return (
            <button 
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-12 gap-1 transition-colors ${active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <span className={`material-icons-round text-2xl transition-all duration-300 ${active ? 'animate-nav-pop text-gray-900 dark:text-white' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium transition-all duration-300 ${active ? 'font-bold text-gray-900 dark:text-white' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};