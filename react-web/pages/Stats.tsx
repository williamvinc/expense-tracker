import React, { useMemo, useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWallet } from '../context/WalletContext';
import { useBudget } from '../context/BudgetContext';

type StatsView = 'expense' | 'income';

export const Stats: React.FC = () => {
  const { transactions } = useTransactions();
  const { formatMoney } = useCurrency();
  const { selectedWallet } = useWallet();
  const { cycleStartDay } = useBudget();
  
  const [view, setView] = useState<StatsView>('expense');
  const [showFilter, setShowFilter] = useState(false);

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // --- Date Range Logic (Matched with Dashboard) ---
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
          end: getLocalDateString(end)
      };
  };

  // Initialize Date Range with the calculated cycle
  const [dateRange, setDateRange] = useState(getCycleRange(cycleStartDay));

  // Update date range if the global cycle setting changes
  useEffect(() => {
      setDateRange(getCycleRange(cycleStartDay));
  }, [cycleStartDay]);

  // --- Data Preparation ---
  const filteredData = useMemo(() => {
      return transactions.filter(t => {
          // Convert transaction ISO date to local YYYY-MM-DD
          const tDateObj = new Date(t.date);
          const tDate = getLocalDateString(tDateObj);
          
          const inDate = tDate >= dateRange.start && tDate <= dateRange.end;
          const inWallet = t.walletId === selectedWallet.id;
          const isType = t.type === view;
          return inDate && inWallet && isType;
      });
  }, [transactions, selectedWallet.id, view, dateRange]);

  const totalValue = useMemo(() => {
      return filteredData.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filteredData]);

  // Group by Category for Donut Chart
  const categoryData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(t => {
      const cat = t.category || (view === 'income' ? 'Source' : 'Other');
      groups[cat] = (groups[cat] || 0) + Number(t.amount);
    });
    
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const otherVal = sorted.slice(4).reduce((acc, curr) => acc + curr[1], 0);
    
    if (otherVal > 0) top.push(['Others', otherVal]);
    
    // DIFFERENTIATED PALETTES
    const colors = view === 'expense' 
        ? ['bg-rose-500', 'bg-orange-400', 'bg-amber-400', 'bg-pink-500', 'bg-indigo-400'] // Warm / Warning colors for expenses
        : ['bg-green-500', 'bg-emerald-400', 'bg-teal-400', 'bg-cyan-500', 'bg-blue-500']; // Green / Growth colors for income

    return top.map(([name, value], index) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: colors[index % colors.length]
    }));
  }, [filteredData, totalValue, view]);

  // Group by Platform / Source for Progress List
  const platformData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(t => {
      const p = t.platform || t.paymentMethod || (view === 'income' ? 'Direct' : 'Etc');
      groups[p] = (groups[p] || 0) + Number(t.amount);
    });

    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    return sorted.map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  }, [filteredData, totalValue, view]);

  // Helper to identify icon/image for platform or source
  const getEntityIcon = (name: string) => {
      const lower = name.toLowerCase();
      // Platforms
      if (lower.includes('tokopedia')) return { type: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Logo-Tokopedia.png' };
      if (lower.includes('shopee')) return { type: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/320px-Shopee.svg.png' };
      if (lower.includes('blibli')) return { type: 'img', src: 'https://toppng.com/uploads/preview/logo-blibli-11550708547os1lsnmgan.png' };
      
      // Common Income Sources
      if (lower.includes('salary') || lower.includes('work')) return { type: 'icon', icon: 'work' };
      if (lower.includes('bonus')) return { type: 'icon', icon: 'redeem' };
      if (lower.includes('freelance')) return { type: 'icon', icon: 'laptop_mac' };
      if (lower.includes('gift')) return { type: 'icon', icon: 'card_giftcard' };
      if (lower.includes('crypto')) return { type: 'icon', icon: 'currency_bitcoin' };
      
      // General fallbacks
      if (view === 'income') return { type: 'icon', icon: 'arrow_downward' };
      return { type: 'icon', icon: 'shopping_bag' };
  };

  // Last 7 Days (Ending at the selected range end date) for Bar Chart
  const weeklyData = useMemo(() => {
    const days = [];
    const endDate = new Date(dateRange.end);
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = getLocalDateString(d); // Use local YYYY-MM-DD
        
        const dayTotal = filteredData
            .filter(t => {
                const tDateObj = new Date(t.date);
                const tDate = getLocalDateString(tDateObj);
                return tDate === dateStr;
            })
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
        
        days.push({ day: dayStr, value: dayTotal });
    }
    return days;
  }, [filteredData, dateRange.end]);

  const maxDaily = Math.max(...weeklyData.map(d => d.value), 1);
  const averageDaily = weeklyData.reduce((acc, curr) => acc + curr.value, 0) / 7;

  // Font size for Total Value
  const totalValueStr = formatMoney(totalValue);
  const totalValueSize = totalValueStr.length > 14 ? 'text-xl' : totalValueStr.length > 10 ? 'text-2xl' : 'text-3xl';

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 bg-gray-50 dark:bg-background-dark transition-colors duration-300">
       <style>{`
          @keyframes growHeight {
            from { height: 0%; opacity: 0; }
            to { opacity: 1; }
          }
          .bar-animate {
            animation: growHeight 0.8s ease-out forwards;
          }
          @keyframes growWidth {
            from { width: 0%; }
            to { width: var(--target-width); }
          }
          .progress-animate {
            animation: growWidth 1s ease-out forwards;
          }
       `}</style>

       <div className="px-6 pt-12 pb-6">
         <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Financial Report</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedWallet.name}</p>
            </div>
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all ${showFilter ? 'bg-primary text-gray-900' : 'bg-white dark:bg-card-dark text-gray-900 dark:text-white'}`}
            >
                <span className="material-icons-round">date_range</span>
            </button>
         </div>

         {/* Expandable Date Range Filter */}
         {showFilter && (
            <div className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft mb-6 animate-fade-in border border-gray-100 dark:border-gray-800">
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

         {/* Segmented Toggle Control */}
         <div className="bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-2xl flex mb-2">
            <button 
                onClick={() => setView('expense')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${view === 'expense' ? 'bg-white dark:bg-card-dark text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
                <span className="material-icons-round text-lg">arrow_upward</span>
                Expenses
            </button>
            <button 
                onClick={() => setView('income')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${view === 'income' ? 'bg-white dark:bg-card-dark text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
                <span className="material-icons-round text-lg">arrow_downward</span>
                Income
            </button>
         </div>
       </div>

       <div className="px-6 space-y-6">
         
         {/* Total Value Card */}
         <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft flex items-center justify-between border border-gray-100 dark:border-gray-800">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                 {view === 'expense' ? 'Total Spent' : 'Total Income'}
               </p>
               <h2 className={`${totalValueSize} font-bold tracking-tight ${view === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                 {totalValueStr}
               </h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${view === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
               <span className={`material-icons-round ${view === 'income' ? 'text-green-600 dark:text-green-400' : 'text-expense-red'}`}>
                 {view === 'income' ? 'trending_up' : 'trending_down'}
               </span>
            </div>
         </div>

         {/* Weekly Trend Bar Chart */}
         <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        {view === 'income' ? 'Income Trend' : 'Expense Trend'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Last 7 days of selected period</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Daily Avg.</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(averageDaily)}</p>
                </div>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-40 pt-4 border-t border-dashed border-gray-100 dark:border-gray-800 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                     <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                     <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                     <div className="w-full h-px bg-transparent"></div>
                </div>

                {weeklyData.map((d, i) => (
                    <div key={`${view}-${i}`} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group z-10">
                        <div className="relative w-full flex justify-end flex-col h-[85%] bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                             <div 
                                className={`w-full rounded-t-xl bar-animate relative transition-colors ${view === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                style={{ height: `${(d.value / maxDaily) * 100}%`, animationDelay: `${i * 0.1}s` }}
                             >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-md">
                                    {formatMoney(d.value)}
                                </div>
                             </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{d.day}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Category Breakdown Donut */}
         <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">
                {view === 'income' ? 'Revenue Sources' : 'Top Categories'}
            </h3>
            
            <div className="flex flex-col items-center gap-8">
                <div className="relative w-52 h-52 flex-shrink-0">
                    <div 
                        className="w-full h-full rounded-full relative transform -rotate-90 transition-all duration-1000 ease-out"
                        style={{
                            background: `conic-gradient(
                                ${categoryData.map((d, i, arr) => {
                                    const prevSum = arr.slice(0, i).reduce((sum, item) => sum + item.percentage, 0);
                                    const colorMap: Record<string, string> = {
                                        'bg-rose-500': '#F43F5E',
                                        'bg-orange-400': '#FB923C',
                                        'bg-amber-400': '#FBBF24',
                                        'bg-pink-500': '#EC4899',
                                        'bg-indigo-400': '#818CF8',
                                        'bg-green-500': '#22C55E',
                                        'bg-emerald-400': '#34D399',
                                        'bg-teal-400': '#2DD4BF',
                                        'bg-cyan-500': '#06B6D4',
                                        'bg-blue-500': '#3B82F6'
                                    };
                                    const color = colorMap[d.color] || '#E5E7EB';
                                    return `${color} 0 ${prevSum + d.percentage}%`;
                                }).join(', ')}
                            )`
                        }}
                    >
                         <div className="absolute inset-5 bg-white dark:bg-card-dark rounded-full flex items-center justify-center flex-col z-10 transform rotate-90">
                             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total</p>
                             <p className={`${totalValueSize} font-bold text-gray-900 dark:text-white truncate max-w-[85%] text-center px-1`}>
                                {totalValueStr}
                             </p>
                         </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-3">
                    {categoryData.length === 0 && (
                         <p className="text-gray-400 text-sm text-center italic">No data yet.</p>
                    )}
                    {categoryData.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                <div className={`w-3 h-3 rounded-full ${cat.color} shadow-sm shrink-0`}></div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-gray-900 dark:text-white mr-2">{Math.round(cat.percentage)}%</span>
                                <span className="text-[10px] text-gray-400">{formatMoney(cat.value)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* Distribution List */}
         <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">
               {view === 'income' ? 'Income Channels' : 'Spending by Platform'}
            </h3>
            
            <div className="space-y-6">
                {platformData.length === 0 && (
                     <p className="text-gray-400 text-sm text-center italic">No data available.</p>
                )}
                {platformData.map((item, i) => {
                    const iconData = getEntityIcon(item.name);
                    return (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                                        {iconData.type === 'img' ? (
                                            <img src={iconData.src} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="material-icons-round text-gray-500 dark:text-gray-400 text-lg">{iconData.icon}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400">{Math.round(item.percentage)}% of total</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-bold whitespace-nowrap ${view === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {view === 'income' ? '+' : ''}{formatMoney(item.value)}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full progress-animate ${view === 'income' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'}`}
                                    style={{ '--target-width': `${item.percentage}%` } as React.CSSProperties}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
         </div>

       </div>
    </div>
  );
};