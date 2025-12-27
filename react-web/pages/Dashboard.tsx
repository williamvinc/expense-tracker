import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBudget } from '../context/BudgetContext';
import { useUser } from '../context/UserContext';
import { useWallet } from '../context/WalletContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions } = useTransactions();
  const { formatMoney, symbol } = useCurrency();
  const { getLimitForWallet, isLimitEnabledForWallet, cycleStartDay } = useBudget();
  const { user } = useUser();
  const { selectedWallet, wallets, selectWallet } = useWallet();
  
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Calculate Cycle Date Range based on cycleStartDay
  const getCycleRange = (startDay: number) => {
      const now = new Date();
      const currentDay = now.getDate();
      let start: Date, end: Date;

      if (currentDay >= startDay) {
          // We are in the cycle that started this month
          start = new Date(now.getFullYear(), now.getMonth(), startDay);
          // End is next month startDay - 1 day
          end = new Date(now.getFullYear(), now.getMonth() + 1, startDay);
          end.setDate(end.getDate() - 1);
      } else {
          // We are in the cycle that started last month
          start = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
          end = new Date(now.getFullYear(), now.getMonth(), startDay);
          end.setDate(end.getDate() - 1);
      }

      return { 
          start: getLocalDateString(start), 
          end: getLocalDateString(end),
          startObj: start,
          endObj: end
      };
  };

  const currentCycle = useMemo(() => getCycleRange(cycleStartDay), [cycleStartDay]);

  // Initialize Date Range with the calculated cycle
  const [dateRange, setDateRange] = useState(currentCycle);
  
  // Update date range if the global cycle setting changes
  useEffect(() => {
      setDateRange(getCycleRange(cycleStartDay));
  }, [cycleStartDay]);

  const [showFilter, setShowFilter] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Time & Date Logic for Header
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
      const hour = currentDate.getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
  };

  const formattedTodayDate = currentDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
  });

  // Filter transactions by DATE and WALLET (Used for List & Income/Expense Card)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        // Convert transaction ISO date to local YYYY-MM-DD for accurate comparison
        const tDateObj = new Date(t.date);
        const tDate = getLocalDateString(tDateObj);
        
        const inDate = tDate >= dateRange.start && tDate <= dateRange.end;
        const inWallet = t.walletId === selectedWallet.id;
        return inDate && inWallet;
    });
  }, [transactions, dateRange, selectedWallet.id]);

  const { income, expense } = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
        const val = Number(curr.amount);
        if (curr.type === 'income') acc.income += val;
        if (curr.type === 'expense') acc.expense += val;
        return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  // Budget Logic: Specific to Current Cycle (Independent of filter if user changes filter)
  const currentCycleExpenses = useMemo(() => {
     const cycleData = getCycleRange(cycleStartDay);
     return transactions.filter(t => {
        const tDateObj = new Date(t.date);
        const tDate = getLocalDateString(tDateObj);
        
        const inDate = tDate >= cycleData.start && tDate <= cycleData.end;
        const inWallet = t.walletId === selectedWallet.id;
        return inDate && inWallet && t.type === 'expense';
     }).reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions, cycleStartDay, selectedWallet.id]);

  // Wallet Balance (All time)
  const walletBalance = useMemo(() => {
      const walletTx = transactions.filter(t => t.walletId === selectedWallet.id);
      return walletTx.reduce((acc, curr) => {
        const val = Number(curr.amount);
        if (curr.type === 'income') return acc + val;
        return acc - val;
      }, 0);
  }, [transactions, selectedWallet.id]);

  const monthlyLimit = getLimitForWallet(selectedWallet.id);
  const isLimitEnabled = isLimitEnabledForWallet(selectedWallet.id);

  const budgetUsedPercentage = isLimitEnabled && monthlyLimit > 0 
    ? (currentCycleExpenses / monthlyLimit) * 100 
    : 0;
  
  const isOverBudget = budgetUsedPercentage > 100;
  
  const formatTxDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayedTransactions = useMemo(() => {
      return showAll ? filteredTransactions : filteredTransactions.slice(0, 10);
  }, [filteredTransactions, showAll]);

  const firstName = user.name.split(' ')[0];

  // Dynamic Font Sizing Logic
  const balanceStr = formatMoney(walletBalance);
  const balanceFontSize = balanceStr.length > 14 ? 'text-3xl' : balanceStr.length > 10 ? 'text-4xl' : 'text-[3.5rem]';

  const incomeStr = formatMoney(income);
  const expenseStr = formatMoney(expense);
  const maxIncExpLength = Math.max(incomeStr.length, expenseStr.length);
  const incExpFontSize = maxIncExpLength > 13 ? 'text-lg' : 'text-2xl';

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28">
      {/* Background decoration */}
      <div aria-hidden="true" className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none transition-colors duration-300"></div>

      <div className="px-6 pt-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{formattedTodayDate}</p>
            <h1 className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{getGreeting()}, {firstName}</h1>
          </div>
          
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all ${showFilter ? 'bg-primary text-gray-900 ring-4 ring-yellow-100 dark:ring-yellow-900/30' : 'bg-surface-light dark:bg-card-dark text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            aria-label="Toggle Date Filter"
          >
              <span className="material-icons-round">{showFilter ? 'close' : 'date_range'}</span>
          </button>
        </div>

        {/* Expandable Date Range Filter */}
        {showFilter && (
            <div className="bg-surface-light dark:bg-card-dark p-5 rounded-[1.5rem] shadow-soft mb-6 animate-fade-in-down border border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">From</label>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:border-primary focus:ring-primary" 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">To</label>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:border-primary focus:ring-primary" 
                        />
                    </div>
                </div>
            </div>
        )}

        {/* REDESIGNED MAIN BALANCE CARD */}
        <div className="bg-surface-light dark:bg-card-dark p-6 rounded-[2rem] shadow-sm mb-4 border border-gray-100 dark:border-gray-800 transition-colors">
            
            {/* Top Row: Title Left, Wallet Dropdown Right */}
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase pt-2">Total Balance</h3>
                
                <div className="relative z-20">
                    <button 
                        onClick={() => setShowWalletSelector(!showWalletSelector)}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 py-1.5 pl-2 pr-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className={`w-5 h-5 rounded-full ${selectedWallet.themeColor || 'bg-gray-900'} flex items-center justify-center text-white`}>
                            <span className="material-icons-round text-[10px]">{selectedWallet.icon || 'account_balance_wallet'}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white max-w-[100px] truncate">{selectedWallet.name}</span>
                        <span className={`material-icons-round text-sm text-gray-400 transition-transform ${showWalletSelector ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showWalletSelector && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in z-30">
                            {wallets.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => {
                                        selectWallet(w.id);
                                        setShowWalletSelector(false);
                                    }}
                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedWallet.id === w.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${selectedWallet.id === w.id ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                    <span className={`text-sm font-bold ${selectedWallet.id === w.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{w.name}</span>
                                </button>
                            ))}
                            <div className="border-t border-gray-100 dark:border-gray-800">
                                <button 
                                    onClick={() => {
                                        setShowWalletSelector(false);
                                        navigate('/wallet');
                                    }}
                                    className="w-full px-4 py-3 flex items-center gap-2 text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-icons-round text-sm">add</span>
                                    <span className="text-xs font-bold">Manage Wallets</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle: Centered Balance */}
            <div className="flex items-center justify-center gap-3 mb-10 min-h-[4rem]">
                <h2 className={`${balanceFontSize} leading-none font-bold text-gray-900 dark:text-white tracking-tight transition-all text-center`}>
                    {isBalanceVisible ? balanceStr : (
                        <span className="text-4xl text-gray-800 dark:text-gray-200">•••••••</span>
                    )}
                </h2>
                <button 
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full p-1 self-center mt-1"
                >
                    <span className="material-icons-round text-2xl">
                        {isBalanceVisible ? 'visibility' : 'visibility_off'}
                    </span>
                </button>
            </div>

            {/* Bottom Row: Budget Info */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">Cycle Budget</span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium">
                            {currentCycle.startObj.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - {currentCycle.endObj.toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                        </span>
                    </div>
                    <button 
                        onClick={() => navigate('/limits', { state: { from: '/' } })}
                        className={`text-xs font-bold hover:underline ${isLimitEnabled && monthlyLimit > 0 ? 'text-gray-900 dark:text-white' : 'text-expense-red'}`}
                    >
                        {isLimitEnabled && monthlyLimit > 0 ? formatMoney(monthlyLimit) : 'Set limit'}
                    </button>
                </div>

                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${isOverBudget ? 'bg-expense-red' : 'bg-primary'}`}
                        style={{ width: isLimitEnabled && monthlyLimit > 0 ? `${Math.min(budgetUsedPercentage, 100)}%` : '0%' }}
                    ></div>
                </div>

                <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>{formatMoney(currentCycleExpenses)} used</span>
                    {monthlyLimit > 0 && <span>{Math.round(budgetUsedPercentage)}%</span>}
                </div>
            </div>
        </div>

        {/* Unified Income/Expense Card */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex items-center justify-between relative overflow-hidden transition-colors">
            {/* Income Section */}
            <div className="flex flex-col gap-1 w-1/2 relative z-10 pr-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-green-600 dark:text-green-400 text-lg">arrow_downward</span>
                    </div>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 truncate">Income</span>
                </div>
                <p className={`${incExpFontSize} font-bold text-gray-900 dark:text-white pl-1 tracking-tight truncate`}>
                    {isBalanceVisible ? incomeStr : '••••'}
                </p>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2"></div>

            {/* Expense Section */}
            <div className="flex flex-col gap-1 w-1/2 items-end relative z-10 pl-2">
                <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-red-600 dark:text-red-400 text-lg">arrow_upward</span>
                    </div>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 truncate">Expense</span>
                </div>
                <p className={`${incExpFontSize} font-bold text-gray-900 dark:text-white pr-1 tracking-tight truncate`}>
                    {isBalanceVisible ? expenseStr : '••••'}
                </p>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Activity</h3>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {showAll ? 'Show Less' : 'See All'}
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {filteredTransactions.length === 0 ? (
             <div className="text-center py-8 text-gray-400 text-sm">
                No transactions found for this period.
             </div>
          ) : (
            displayedTransactions.map((tx) => (
                <div 
                    key={tx.id} 
                    onClick={() => navigate(`/transaction/${tx.id}`, { state: { backgroundLocation: location } })}
                    className="bg-surface-light dark:bg-card-dark p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent dark:border-gray-800"
                >
                    <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.color?.includes('text') ? tx.color : `${tx.color} text-gray-900`}`}>
                        <span className="material-icons-round text-xl">{tx.icon}</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{tx.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {tx.platform ? `${tx.platform} • ` : ''}{formatTxDate(tx.date)}
                        </p>
                    </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(Number(tx.amount))}
                    </span>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};