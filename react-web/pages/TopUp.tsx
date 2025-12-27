import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWallet } from '../context/WalletContext';
import { Transaction } from '../types';

// Default list of icons available for users to choose
const AVAILABLE_ICONS = [
    'account_balance', 'work', 'laptop_mac', 'redeem', 
    'savings', 'currency_exchange', 'credit_card', 'payments', 
    'paid', 'storefront', 'monetization_on', 'wallet'
];

interface SourceOption {
    id: string;
    label: string;
    icon: string;
    type: 'bank' | 'work' | 'other';
    detail?: string;
}

const DEFAULT_SOURCES: SourceOption[] = [
    { id: '2', label: 'Salary', icon: 'work', type: 'work', detail: 'Direct Deposit' },
    { id: '3', label: 'Freelance', icon: 'laptop_mac', type: 'work', detail: 'Project Payout' },
    { id: '4', label: 'Bonus', icon: 'redeem', type: 'other', detail: 'One-time' },
];

export const TopUp: React.FC = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { symbol, currency } = useCurrency();
  const { selectedWallet } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Source Selection State
  const [sources, setSources] = useState<SourceOption[]>(DEFAULT_SOURCES);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(DEFAULT_SOURCES[0].id);
  
  // Create New Source State
  const [isCreating, setIsCreating] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceIcon, setNewSourceIcon] = useState(AVAILABLE_ICONS[0]);

  const selectedSource = sources.find(s => s.id === selectedSourceId) || sources[0];

  // --- Formatting Logic ---
  const formatAmount = (value: string) => {
    const isIDR = currency === 'IDR';
    const thousandsSep = isIDR ? '.' : ',';
    const decimalSep = isIDR ? ',' : '.';
    
    // Strip invalid chars (keep only digits and the allowed decimal separator)
    let clean = value.replace(isIDR ? /[^0-9,]/g : /[^0-9.]/g, '');
    
    // Handle multiple decimal separators (keep first)
    const parts = clean.split(decimalSep);
    if (parts.length > 2) {
        clean = parts[0] + decimalSep + parts.slice(1).join('');
    }
    
    // Split integer and decimal
    let [integer, decimal] = clean.split(decimalSep);
    
    // Format integer part
    if (integer) {
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    }
    
    // Reconstruct
    if (decimal !== undefined) {
        return `${integer}${decimalSep}${decimal}`;
    }
    return integer;
  };

  const parseAmount = (value: string) => {
    if (!value) return 0;
    const isIDR = currency === 'IDR';
    if (isIDR) {
        // IDR: 50.000,00 -> 50000.00
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    }
    // USD: 50,000.00 -> 50000.00
    return parseFloat(value.replace(/,/g, ''));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatAmount(e.target.value);
      setAmount(formatted);
  };

  const handleTopUp = () => {
    const numericAmount = parseAmount(amount);
    if (!numericAmount || numericAmount <= 0) return;

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            name: selectedSource.label,
            date: new Date().toISOString(),
            amount: numericAmount,
            type: 'income',
            icon: selectedSource.icon, // Use the source icon
            color: 'bg-green-100 text-green-600',
            category: 'Income',
            status: 'Successful',
            paymentMethod: selectedSource.label, // Use source name as payment method
            note: `Top up via ${selectedSource.label}`,
            walletId: selectedWallet.id
        };

        addTransaction(newTransaction);
        setIsLoading(false);
        navigate('/wallet');
    }, 1500);
  };

  const handleCreateSource = () => {
      if (!newSourceName.trim()) return;
      
      const newSource: SourceOption = {
          id: Date.now().toString(),
          label: newSourceName,
          icon: newSourceIcon,
          type: 'other',
          detail: 'Custom Source'
      };

      setSources([...sources, newSource]);
      setSelectedSourceId(newSource.id);
      setIsCreating(false);
      setNewSourceName('');
      setNewSourceIcon(AVAILABLE_ICONS[0]);
  };

  // ... (New Source Modal - same as before but keeping it concise here for changes block if possible, but I must return full content)
  // Since I need to return full content, I'll assume the rest of the component logic is identical to previous, just the transaction creation changed.

  if (isCreating) {
      return (
        <div className="h-[100dvh] overflow-hidden absolute inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsCreating(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col h-[85dvh]">
                <div className="px-8 pt-6 pb-2 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Add New Source</h2>
                    <button 
                        onClick={() => setIsCreating(false)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                    <div className="mb-8">
                        <label className="text-sm font-bold text-gray-900 mb-2 block">Source Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="e.g. Upwork, Gift, Side Hustle"
                            value={newSourceName}
                            onChange={(e) => setNewSourceName(e.target.value)}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-lg font-medium focus:border-primary focus:ring-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Choose Icon</label>
                        <div className="grid grid-cols-4 gap-4">
                            {AVAILABLE_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setNewSourceIcon(icon)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${newSourceIcon === icon ? 'bg-primary text-gray-900 shadow-lg shadow-yellow-200/50 ring-2 ring-primary ring-offset-2' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <span className="material-icons-round text-2xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                     <button 
                        onClick={handleCreateSource}
                        disabled={!newSourceName.trim()}
                        className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark text-gray-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-200/50 transition-all"
                    >
                        Create Source
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-[100dvh] overflow-hidden absolute inset-0 z-50">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => navigate(-1)}></div>
        
        <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col h-[92dvh]">
            <div className="w-full flex justify-center pt-4 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-8 pt-6 pb-2 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Top Up Wallet</h2>
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                {/* Amount Input */}
                <div className="flex flex-col items-center justify-center mb-10 mt-2">
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

                {/* Source Selection */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-900">From Source</label>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="text-xs text-primary-dark font-bold hover:underline flex items-center gap-1"
                        >
                            <span className="material-icons-round text-sm">add</span> New
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {sources.map((source) => {
                            const isSelected = selectedSourceId === source.id;
                            return (
                                <button
                                    key={source.id}
                                    onClick={() => setSelectedSourceId(source.id)}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-yellow-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                            <span className="material-icons-round text-[12px] text-gray-900">check</span>
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-primary text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                                        <span className="material-icons-round">{source.icon}</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 truncate">{source.label}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{source.detail}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-surface-light border-t border-gray-100">
                <button 
                    onClick={handleTopUp}
                    disabled={isLoading || !amount || parseFloat(amount.replace(/[^0-9.]/g, '')) <= 0}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-200/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round">add_card</span>
                            <span>Top Up {symbol}{amount ? amount : '0'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};