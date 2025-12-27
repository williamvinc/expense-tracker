import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWallet } from '../context/WalletContext';

export const Limits: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLimitForWallet, setLimitForWallet, isLimitEnabledForWallet, toggleLimitForWallet, cycleStartDay, setCycleStartDay } = useBudget();
  const { currency: code, symbol } = useCurrency();
  const { selectedWallet } = useWallet();

  // Determine previous location for back navigation
  // Default to wallet if no state is present
  const from = (location.state as any)?.from || '/wallet';

  const currentLimit = getLimitForWallet(selectedWallet.id);
  const currentEnabled = isLimitEnabledForWallet(selectedWallet.id);

  // Local state for editing
  const [localEnabled, setLocalEnabled] = useState(currentEnabled);
  const [localLimit, setLocalLimit] = useState(currentLimit.toString());
  const [localCycleDay, setLocalCycleDay] = useState(cycleStartDay);

  // Sync with context on mount or wallet change
  useEffect(() => {
    setLocalEnabled(currentEnabled);
    setLocalLimit(currentLimit.toString());
  }, [currentEnabled, currentLimit, selectedWallet.id]);

  useEffect(() => {
      setLocalCycleDay(cycleStartDay);
  }, [cycleStartDay]);

  const handleSave = () => {
      const limitValue = parseFloat(localLimit);
      if (!isNaN(limitValue)) {
          setLimitForWallet(selectedWallet.id, limitValue);
          toggleLimitForWallet(selectedWallet.id, localEnabled);
          setCycleStartDay(localCycleDay);
          navigate(from);
      }
  };

  // Helper to get day suffix
  const getDaySuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
      }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-32">
       <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate(from)}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card-dark rounded-full shadow-soft text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <span className="material-icons-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold dark:text-white">Manage Limits</h1>
        <button className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card-dark rounded-full shadow-soft text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition opacity-0 cursor-default">
            <span className="material-icons-round">more_vert</span>
        </button>
      </header>

      <div className="px-6 space-y-6 mt-2">
        <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${selectedWallet.themeColor || 'bg-gray-900'} flex items-center justify-center text-white`}>
                    <span className="material-icons-outlined">{selectedWallet.icon}</span>
                </div>
                <div>
                    <h2 className="font-bold text-lg dark:text-white">{selectedWallet.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: {selectedWallet.cardNumber ? `...${selectedWallet.cardNumber.slice(-4)}` : '...8829'}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Set spending limits to control your expenses for this wallet. Changes apply instantly.
            </p>
        </div>

        {/* Budget Cycle Setting */}
        <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <span className="material-icons-outlined">calendar_month</span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Budget Cycle</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reset day for your budget</p>
                </div>
            </div>

            {/* Tip Box */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl flex gap-2.5 items-start">
                <span className="material-icons-round text-blue-500 text-sm mt-0.5">lightbulb</span>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>Tip:</strong> Set this to the day you receive your salary or allowance. This helps you track exactly how much of your income you've spent so far.
                </p>
            </div>
            
            <div className="relative">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Start Day</p>
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <button
                            key={day}
                            onClick={() => setLocalCycleDay(day)}
                            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all ${localCycleDay === day ? 'bg-primary text-gray-900 shadow-md scale-110' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center bg-gray-50 dark:bg-gray-800 py-2 rounded-xl">
                    Current Cycle resets on the <span className="font-bold text-gray-900 dark:text-white">{localCycleDay}{getDaySuffix(localCycleDay)}</span> of every month.
                </p>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${localEnabled ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}`}>
                        <span className="material-icons-outlined">account_balance_wallet</span>
                    </div>
                    <div>
                        <h3 className={`font-bold transition-colors ${localEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>Cycle Limit</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Max spend per cycle</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localEnabled}
                        onChange={(e) => setLocalEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            
            <div className={`relative mt-2 transition-opacity ${localEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 font-bold text-lg">{symbol}</span>
                <input 
                    type="number" 
                    value={localLimit}
                    onChange={(e) => setLocalLimit(e.target.value)}
                    disabled={!localEnabled}
                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">{code}</span>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We'll calculate your spending from the <span className="font-bold">{localCycleDay}{getDaySuffix(localCycleDay)}</span>. Set this to your total paycheck or allowance to see how much "runway" you have left for the month.
            </p>
        </div>
      </div>

      <div className="fixed bottom-10 left-0 right-0 px-6 z-40 max-w-md mx-auto">
        <button 
            onClick={handleSave}
            className="w-full bg-primary text-gray-900 font-bold text-lg py-4 rounded-3xl shadow-lg shadow-yellow-200/50 hover:bg-yellow-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
            <span className="material-icons-round">save</span>
            Save Changes
        </button>
      </div>
    </div>
  );
};