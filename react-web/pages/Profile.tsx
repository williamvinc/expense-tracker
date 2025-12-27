import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28">
      {/* Background decoration */}
      <div aria-hidden="true" className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none transition-colors"></div>

      <div className="px-6 pt-12 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <button 
            onClick={() => navigate('/settings')}
            className="w-12 h-12 rounded-full bg-surface-light dark:bg-card-dark shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons-round text-gray-900 dark:text-white">settings</span>
          </button>
        </div>

        <div className="bg-surface-light dark:bg-card-dark p-6 rounded-[2rem] shadow-sm mb-8 relative overflow-hidden transition-colors">
          <div className="flex flex-col items-center text-center">
            {/* Avatar with Pencil Icon */}
            <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-transparent dark:border-gray-700">
                    {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-icons-round text-5xl text-gray-400">person</span>
                    )}
                </div>
                <button 
                    onClick={() => navigate('/personal-info')}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-gray-900 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    aria-label="Edit Profile"
                >
                    <span className="material-icons-round text-sm">edit</span>
                </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{user.email}</p>
            
            <div className="w-full bg-background-light dark:bg-black/30 rounded-2xl p-4 transition-colors">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Recent Activity Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <span className="material-icons-round text-sm text-gray-900 dark:text-white">shopping_bag</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Whole Foods</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Yesterday</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">-$124.00</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <span className="material-icons-round text-sm text-yellow-600 dark:text-yellow-400">attach_money</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Salary Deposit</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Oct 20</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">+$3,250.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 px-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">General</h3>
        </div>

        <div className="space-y-3 pb-8">
          <button 
            onClick={() => navigate('/personal-info')}
            className="w-full bg-surface-light dark:bg-card-dark p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] group hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                  <span className="material-icons-round text-gray-900 dark:text-white text-xl group-hover:text-[rgb(var(--color-primary-dark))] dark:group-hover:text-primary transition-colors">person_outline</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Personal Info</span>
              </div>
              <span className="material-icons-round text-gray-400">chevron_right</span>
          </button>

          <button 
            onClick={() => navigate('/security')}
            className="w-full bg-surface-light dark:bg-card-dark p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] group hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                  <span className="material-icons-round text-gray-900 dark:text-white text-xl group-hover:text-[rgb(var(--color-primary-dark))] dark:group-hover:text-primary transition-colors">lock_outline</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Security</span>
              </div>
              <span className="material-icons-round text-gray-400">chevron_right</span>
          </button>

          <button 
            onClick={() => navigate('/help-support')}
            className="w-full bg-surface-light dark:bg-card-dark p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] group hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                  <span className="material-icons-round text-gray-900 dark:text-white text-xl group-hover:text-[rgb(var(--color-primary-dark))] dark:group-hover:text-primary transition-colors">help_outline</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Help & Support</span>
              </div>
              <span className="material-icons-round text-gray-400">chevron_right</span>
          </button>

          <a 
            href="https://teer.id/williamvnct"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-surface-light dark:bg-card-dark p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] group hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-pink-50 dark:group-hover:bg-pink-900/30 transition-colors">
                  <span className="material-icons-round text-gray-900 dark:text-white text-xl group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">favorite</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Tip the Developer</span>
              </div>
              <span className="material-icons-round text-gray-400">open_in_new</span>
          </a>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 mb-6 text-center">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                Created with <span className="text-red-500 text-[10px] material-icons-round">favorite</span> by Williamvnct
            </p>
        </div>
      </div>
    </div>
  );
};