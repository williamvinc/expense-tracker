import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWallet } from '../context/WalletContext';
import { Transaction } from '../types';

interface CategoryItem {
    id: string;
    icon: string;
    label: string;
    type?: 'expense' | 'income';
}

const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
    { id: 'food', icon: 'lunch_dining', label: 'Food & Drink' },
    { id: 'housing', icon: 'home', label: 'Housing' },
    { id: 'transport', icon: 'directions_car', label: 'Transportation' },
    { id: 'groceries', icon: 'shopping_cart', label: 'Groceries' },
    { id: 'clothing', icon: 'checkroom', label: 'Clothing' },
    { id: 'health', icon: 'medical_services', label: 'Health' },
    { id: 'education', icon: 'school', label: 'Education' },
    { id: 'entertainment', icon: 'sports_esports', label: 'Entertainment' },
    { id: 'tech', icon: 'smartphone', label: 'Technology' },
    { id: 'financial', icon: 'account_balance', label: 'Financial' },
    { id: 'social', icon: 'volunteer_activism', label: 'Social' },
    { id: 'others', icon: 'more_horiz', label: 'Others' },
];

const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
    { id: 'salary', icon: 'payments', label: 'Salary' },
    { id: 'business', icon: 'work', label: 'Business' },
    { id: 'investment', icon: 'trending_up', label: 'Investment' },
    { id: 'property', icon: 'apartment', label: 'Property' },
    { id: 'gift', icon: 'card_giftcard', label: 'Gift' },
    { id: 'refund', icon: 'restore', label: 'Refund' },
    { id: 'others_in', icon: 'more_horiz', label: 'Others' },
];

const CUSTOM_CATEGORY_ICONS = [
    'lunch_dining', 'home', 'directions_car', 'shopping_cart', 
    'checkroom', 'medical_services', 'school', 'sports_esports', 
    'smartphone', 'account_balance', 'volunteer_activism', 'more_horiz',
    'payments', 'work', 'trending_up', 'apartment', 'card_giftcard', 
    'restore', 'pets', 'flight', 'wifi', 'fitness_center', 'local_cafe',
    'child_friendly', 'palette', 'music_note', 'local_florist'
];

interface PlatformItem {
    id: string;
    label: string;
    type: 'icon' | 'image';
    icon?: string;
    src?: string;
    color: string;
}

const PLATFORMS: PlatformItem[] = [
    { id: 'etc', label: 'Etc', type: 'icon', icon: 'more_horiz', color: 'bg-gray-100 text-gray-500' },
    
    // Indonesia / SEA
    { id: 'gojek', label: 'Gojek', type: 'icon', icon: 'two_wheeler', color: 'bg-green-100 text-green-600' },
    { id: 'grab', label: 'Grab', type: 'icon', icon: 'local_taxi', color: 'bg-green-100 text-green-600' },
    { id: 'shopee', label: 'Shopee', type: 'icon', icon: 'shopping_bag', color: 'bg-orange-100 text-orange-600' },
    { id: 'tokopedia', label: 'Tokopedia', type: 'icon', icon: 'storefront', color: 'bg-green-100 text-green-600' },
    { id: 'lazada', label: 'Lazada', type: 'icon', icon: 'shopping_cart', color: 'bg-blue-100 text-blue-600' },
    { id: 'blibli', label: 'Blibli', type: 'icon', icon: 'local_mall', color: 'bg-blue-50 text-blue-500' },
    { id: 'zalora', label: 'Zalora', type: 'icon', icon: 'checkroom', color: 'bg-gray-800 text-white' },
    { id: 'sociolla', label: 'Sociolla', type: 'icon', icon: 'brush', color: 'bg-pink-100 text-pink-500' },
    { id: 'orami', label: 'Orami', type: 'icon', icon: 'child_friendly', color: 'bg-pink-50 text-pink-400' },
    { id: 'datascrip', label: 'DatascripMall.ID', type: 'icon', icon: 'print', color: 'bg-red-50 text-red-600' },

    // Global
    { id: 'amazon', label: 'Amazon', type: 'icon', icon: 'public', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'ebay', label: 'eBay', type: 'icon', icon: 'sell', color: 'bg-blue-50 text-blue-600' },
    { id: 'aliexpress', label: 'AliExpress', type: 'icon', icon: 'local_shipping', color: 'bg-red-100 text-red-600' },
    { id: 'etsy', label: 'Etsy', type: 'icon', icon: 'palette', color: 'bg-orange-50 text-orange-600' },
    { id: 'walmart', label: 'Walmart', type: 'icon', icon: 'store', color: 'bg-blue-100 text-blue-700' },
    { id: 'rakuten', label: 'Rakuten', type: 'icon', icon: 'language', color: 'bg-red-100 text-red-600' },
    { id: 'jd', label: 'JD.com', type: 'icon', icon: 'inventory_2', color: 'bg-red-50 text-red-600' },
    { id: 'wish', label: 'Wish', type: 'icon', icon: 'loyalty', color: 'bg-blue-50 text-blue-500' },
];

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { symbol, currency } = useCurrency();
  const { selectedWallet } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  
  // Custom Categories Logic
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
      try {
          const saved = localStorage.getItem('wallet_custom_categories');
          return saved ? JSON.parse(saved) : [];
      } catch {
          return [];
      }
  });

  useEffect(() => {
      localStorage.setItem('wallet_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Combine defaults with custom
  const currentCategories = type === 'expense' 
    ? [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense')]
    : [...DEFAULT_INCOME_CATEGORIES, ...customCategories.filter(c => c.type === 'income')];

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(currentCategories[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(PLATFORMS[0]);

  // Initialize date with LOCAL time YYYY-MM-DD
  const [date, setDate] = useState(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  });

  const [note, setNote] = useState('');
  
  // UI States
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSelectingPlatform, setIsSelectingPlatform] = useState(false);

  // New Category Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(CUSTOM_CATEGORY_ICONS[0]);

  // Reset selected category when type changes if current selection is invalid for new type
  useEffect(() => {
      const exists = currentCategories.find(c => c.id === selectedCategory.id);
      if (!exists) {
          setSelectedCategory(currentCategories[0]);
      }
  }, [type, currentCategories]);

  // --- Formatting Logic ---
  const formatAmount = (value: string) => {
    const isIDR = currency === 'IDR';
    const thousandsSep = isIDR ? '.' : ',';
    const decimalSep = isIDR ? ',' : '.';
    
    let clean = value.replace(isIDR ? /[^0-9,]/g : /[^0-9.]/g, '');
    const parts = clean.split(decimalSep);
    if (parts.length > 2) {
        clean = parts[0] + decimalSep + parts.slice(1).join('');
    }
    let [integer, decimal] = clean.split(decimalSep);
    if (integer) {
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    }
    if (decimal !== undefined) {
        return `${integer}${decimalSep}${decimal}`;
    }
    return integer;
  };

  const parseAmount = (value: string) => {
    if (!value) return 0;
    const isIDR = currency === 'IDR';
    if (isIDR) {
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(value.replace(/,/g, ''));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatAmount(e.target.value);
      setAmount(formatted);
  };

  const handleSave = () => {
    const numericAmount = parseAmount(amount);
    if (!numericAmount || numericAmount <= 0) return;

    // Construct date object using local time midnight to avoid timezone shifts
    // Appending T00:00:00 to YYYY-MM-DD creates a local time date object in standard browsers
    const localDate = new Date(date + 'T00:00:00');
    
    const newTransaction: Transaction = {
        id: Date.now().toString(),
        name: selectedCategory.label, 
        date: localDate.toISOString(), 
        amount: numericAmount,
        type,
        icon: selectedCategory.icon,
        color: type === 'income' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-900',
        category: selectedCategory.label,
        platform: type === 'expense' ? selectedPlatform.label : undefined, // Only for expenses
        status: 'Successful',
        paymentMethod: selectedWallet.name,
        note: note,
        walletId: selectedWallet.id
    };

    addTransaction(newTransaction);
    navigate(-1);
  };

  const handleCreateCategory = () => {
      if (!newCategoryName.trim()) return;
      const newCat: CategoryItem = {
          id: `custom_${Date.now()}`,
          label: newCategoryName,
          icon: newCategoryIcon,
          type: type
      };
      setCustomCategories([...customCategories, newCat]);
      setSelectedCategory(newCat);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      setNewCategoryIcon(CUSTOM_CATEGORY_ICONS[0]);
  };

  // Determine displayed categories (First 8 or all)
  const displayedCategories = showAllCategories ? currentCategories : currentCategories.slice(0, 8);

  // --- Render Create Category Modal ---
  if (isCreatingCategory) {
      return (
        <div className="h-[100dvh] overflow-hidden absolute inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsCreatingCategory(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col h-[85dvh]">
                <div className="px-8 pt-6 pb-2 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">New {type === 'income' ? 'Income' : 'Expense'} Category</h2>
                    <button 
                        onClick={() => setIsCreatingCategory(false)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                    <div className="mb-8">
                        <label className="text-sm font-bold text-gray-900 mb-2 block">Category Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="e.g. Subscription, Freelance"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-lg font-medium focus:border-primary focus:ring-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Choose Icon</label>
                        <div className="grid grid-cols-5 gap-3">
                            {CUSTOM_CATEGORY_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setNewCategoryIcon(icon)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${newCategoryIcon === icon ? 'bg-primary text-gray-900 shadow-lg shadow-yellow-200/50 ring-2 ring-primary ring-offset-2' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <span className="material-icons-round text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                     <button 
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim()}
                        className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark text-gray-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-200/50 transition-all"
                    >
                        Create Category
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- Render Platform Selection Modal ---
  if (isSelectingPlatform) {
    return (
      <div className="h-[100dvh] overflow-hidden absolute inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsSelectingPlatform(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col h-[85dvh]">
              <div className="px-8 pt-6 pb-2 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Select Platform</h2>
                  <button 
                      onClick={() => setIsSelectingPlatform(false)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                      <span className="material-icons-round">close</span>
                  </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
                  <div className="space-y-2">
                      {PLATFORMS.map((platform) => {
                          const isSelected = selectedPlatform.id === platform.id;
                          return (
                              <button
                                  key={platform.id}
                                  onClick={() => {
                                      setSelectedPlatform(platform);
                                      setIsSelectingPlatform(false);
                                  }}
                                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'border-primary bg-yellow-50/50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                              >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${platform.color || 'bg-white'}`}>
                                      {platform.type === 'icon' ? (
                                          <span className="material-icons-round text-lg">{platform.icon}</span>
                                      ) : (
                                          <img src={platform.src} alt={platform.label} className="w-full h-full object-contain p-1" />
                                      )}
                                  </div>
                                  <span className={`text-base font-bold flex-1 text-left ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                      {platform.label}
                                  </span>
                                  {isSelected && (
                                      <span className="material-icons-round text-primary-dark">check_circle</span>
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden absolute inset-0 z-50">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => navigate(-1)}
        ></div>
        
        {/* Drawer */}
        <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col h-[92%]">
            <div className="w-full flex justify-center pt-4 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-8 pt-6 pb-2 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">New Transaction</h2>
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                {/* Amount Display */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <p className="text-sm text-gray-500 font-medium mb-2">Enter Amount</p>
                    <div className="relative flex items-baseline justify-center text-gray-900">
                        <span className="text-4xl font-semibold mr-1 text-gray-400">{symbol}</span>
                        <input 
                            type="text"
                            inputMode="decimal"
                            placeholder="0" 
                            value={amount}
                            onChange={handleAmountChange}
                            className="text-6xl font-bold bg-transparent border-none text-center w-full focus:ring-0 placeholder-gray-300 p-0 m-0"
                        />
                    </div>
                </div>

                {/* Type Toggle */}
                <div className="bg-gray-100 p-1.5 rounded-2xl flex mb-8">
                    <button 
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-primary text-gray-900' : 'text-gray-500 hover:text-gray-900 bg-transparent shadow-none'}`}
                    >
                        <span className="material-icons-round text-lg">arrow_upward</span>
                        Expense
                    </button>
                    <button 
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-primary text-gray-900' : 'text-gray-500 hover:text-gray-900 bg-transparent shadow-none'}`}
                    >
                        <span className="material-icons-round text-lg">arrow_downward</span>
                        Income
                    </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-900">Category</label>
                        <div className="flex gap-4">
                             <button 
                                onClick={() => setIsCreatingCategory(true)}
                                className="text-xs text-primary-dark font-bold hover:underline flex items-center gap-1"
                             >
                                <span className="material-icons-round text-sm">add</span> New
                             </button>
                             <button 
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="text-xs text-yellow-600 font-medium hover:underline"
                             >
                                {showAllCategories ? 'Show Less' : 'See All'}
                             </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 animate-fade-in">
                        {displayedCategories.map((cat) => {
                            const isSelected = selectedCategory.id === cat.id;
                            return (
                                <div 
                                    key={cat.id} 
                                    className="flex flex-col items-center gap-2 group cursor-pointer"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    <button 
                                        type="button"
                                        className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center ${isSelected ? 'bg-primary text-gray-900 shadow-lg shadow-yellow-200/50 ring-2 ring-offset-2 ring-primary ring-offset-surface-light' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
                                    >
                                        <span className="material-icons-round">{cat.icon}</span>
                                    </button>
                                    <span className={`text-xs text-center truncate w-full px-1 ${isSelected ? 'font-bold text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                        {cat.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Platform Selection (Only for Expenses) */}
                {type === 'expense' && (
                    <div className="mb-8 animate-fade-in">
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Platform</label>
                        <div className="relative">
                             <button 
                                type="button"
                                onClick={() => setIsSelectingPlatform(true)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between group hover:border-primary transition-colors"
                             >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${selectedPlatform.color || 'bg-white'}`}>
                                        {selectedPlatform.type === 'icon' ? (
                                            <span className="material-icons-round text-lg">{selectedPlatform.icon}</span>
                                        ) : (
                                            <img src={selectedPlatform.src} alt={selectedPlatform.label} className="w-full h-full object-contain p-1" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 text-base">{selectedPlatform.label}</p>
                                    </div>
                                </div>
                                <span className="material-icons-round text-gray-400 group-hover:text-primary transition-colors">expand_more</span>
                             </button>
                        </div>
                    </div>
                )}

                {/* Pay With */}
                <div className="mb-8">
                    <label className="text-sm font-bold text-gray-900 mb-4 block">
                        {type === 'income' ? 'Deposit To' : 'Pay With'}
                    </label>
                    <div className="relative">
                        <button type="button" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between group hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${selectedWallet.themeColor || 'bg-gray-900'} flex items-center justify-center text-white`}>
                                    <span className="material-icons-round text-sm">{selectedWallet.icon}</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 text-sm">{selectedWallet.name}</p>
                                    <p className="text-xs text-gray-500">Wallet ID: ...{selectedWallet.cardNumber?.slice(-4) || '8829'}</p>
                                </div>
                            </div>
                            <span className="material-icons-round text-gray-400 group-hover:text-primary transition-colors">expand_more</span>
                        </button>
                    </div>
                </div>

                {/* Date & Note */}
                <div className="mb-8 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-900 mb-2 block">Transaction Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons-round text-gray-500">calendar_today</span>
                            </div>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-primary focus:ring-primary" 
                            />
                        </div>
                    </div>
                    <div>
                         <label className="text-sm font-bold text-gray-900 mb-2 block">Note (Optional)</label>
                         <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What's this for?" 
                            className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-primary" 
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-surface-light border-t border-gray-100">
                <button 
                    onClick={handleSave}
                    className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-200/50 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span className="material-icons-round">check_circle</span>
                    Save Transaction
                </button>
            </div>
        </div>
    </div>
  );
};