import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for form, including avatar for preview
  const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar
  });

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Simple validation: limit to 2MB to respect localStorage limits
          if (file.size > 2 * 1024 * 1024) {
              alert("Please select an image smaller than 2MB.");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  handleChange('avatar', reader.result);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const handleSave = () => {
      setIsLoading(true);
      // Simulate network request
      setTimeout(() => {
          updateUser(formData);
          setIsLoading(false);
          navigate(-1);
      }, 800);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-[100dvh] relative flex flex-col font-sans transition-colors duration-300">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-yellow-50/50 to-transparent dark:from-yellow-900/10 pointer-events-none"></div>

        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center gap-4 relative z-10">
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm flex items-center justify-center transition-transform active:scale-95 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800"
            >
                <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personal Info</h1>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-10 mt-4">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                <div 
                    className="relative cursor-pointer group"
                    onClick={triggerFileInput}
                >
                    <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-card-dark shadow-sm">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-icons-round text-6xl text-gray-400">person</span>
                        )}
                    </div>
                    <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-gray-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform pointer-events-none">
                        <span className="material-icons-round text-sm">edit</span>
                    </button>
                </div>
                <p 
                    className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-primary-dark transition-colors"
                    onClick={triggerFileInput}
                >
                    Tap to change photo
                </p>
            </div>

            {/* Form Inputs */}
            <div className="space-y-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-icons-round text-gray-400">person_outline</span>
                        </div>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                            placeholder="Your Name"
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-icons-round text-gray-400">mail_outline</span>
                        </div>
                        <input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Phone Number</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-icons-round text-gray-400">phone</span>
                        </div>
                        <input 
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                            placeholder="+62 (000) 000-0000"
                        />
                    </div>
                </div>

                {/* Physical Address */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Physical Address</label>
                    <div className="relative">
                        <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                            <span className="material-icons-round text-gray-400">location_on</span>
                        </div>
                        <textarea 
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="w-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none"
                            placeholder="Your Address"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Floating Action Button / Bottom Button */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
            <button 
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold py-4 rounded-3xl shadow-lg shadow-yellow-200/50 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    "Save Changes"
                )}
            </button>
        </div>
    </div>
  );
};