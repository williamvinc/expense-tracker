import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';

export const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const { selectedWallet } = useWallet();
  const { symbol, formatMoney, currency } = useCurrency();
  const { addTransaction, getTransactionsByWallet } = useTransactions();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate Balance for validation
  const currentBalance = getTransactionsByWallet(selectedWallet.id).reduce((acc, curr) => {
      const val = Number(curr.amount);
      return curr.type === 'income' ? acc + val : acc - val;
  }, 0);

  // Formatting logic (reused)
  const formatAmount = (value: string) => {
    const isIDR = currency === 'IDR';
    const thousandsSep = isIDR ? '.' : ',';
    const decimalSep = isIDR ? ',' : '.';
    let clean = value.replace(isIDR ? /[^0-9,]/g : /[^0-9.]/g, '');
    const parts = clean.split(decimalSep);
    if (parts.length > 2) clean = parts[0] + decimalSep + parts.slice(1).join('');
    let [integer, decimal] = clean.split(decimalSep);
    if (integer) integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    if (decimal !== undefined) return `${integer}${decimalSep}${decimal}`;
    return integer;
  };

  const parseAmount = (value: string) => {
    if (!value) return 0;
    const isIDR = currency === 'IDR';
    if (isIDR) return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    return parseFloat(value.replace(/,/g, ''));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(formatAmount(e.target.value));
  };

  const handleSend = () => {
      const val = parseAmount(amount);
      if (!val || val <= 0) return;
      
      if (val > currentBalance) {
          alert("Insufficient funds!");
          return;
      }

      setIsLoading(true);
      setTimeout(() => {
          const tx: Transaction = {
              id: Date.now().toString(),
              name: recipient || 'Unknown Recipient',
              date: new Date().toISOString(),
              amount: val,
              type: 'expense',
              icon: 'arrow_upward',
              color: 'bg-indigo-100 text-indigo-600',
              category: 'Transfer',
              status: 'Successful',
              paymentMethod: selectedWallet.name,
              walletId: selectedWallet.id,
              note: note || 'Money Transfer'
          };
          
          addTransaction(tx);
          setIsLoading(false);
          navigate('/wallet');
      }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate('/wallet')}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card-dark rounded-full shadow-soft text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <span className="material-icons-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold dark:text-white">Send Money</h1>
        <button className="w-12 h-12 opacity-0 cursor-default"></button>
      </header>

      <div className="px-6 mt-4">
        {/* Source Wallet Card Mini */}
        <div className={`rounded-3xl p-6 text-white shadow-card overflow-hidden relative group mb-8 border border-white/10 ${selectedWallet.themeColor || 'bg-gray-900'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-xs text-white/70 mb-1">Sending from {selectedWallet.name}</p>
                    <h3 className="text-2xl font-bold">{formatMoney(currentBalance)}</h3>
                    <p className="text-xs text-white/70 mt-1 font-mono tracking-widest">...{selectedWallet.cardNumber?.slice(-4) || '8829'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <span className="material-icons-outlined text-white">{selectedWallet.icon}</span>
                </div>
            </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            {/* Recipient Input */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Recipient</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-icons-outlined text-gray-400">account_balance_wallet</span>
                    </div>
                    <input 
                        className="w-full bg-white dark:bg-card-dark border-none rounded-2xl py-4 pl-12 pr-12 shadow-input text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 text-base font-medium transition-all" 
                        placeholder="Recipient Wallet ID or Username" 
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                    />
                    <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-dark hover:text-yellow-600 transition" type="button">
                        <span className="material-icons-outlined">qr_code_scanner</span>
                    </button>
                </div>
                
                {/* Quick Recipients */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    <button className="flex flex-col items-center space-y-1 min-w-[60px]" type="button" onClick={() => setRecipient('')}>
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-transparent hover:border-primary transition">
                            <span className="material-icons-round text-xl">add</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">New</span>
                    </button>
                    
                    {[
                        { id: 'W-8291', img: 'https://i.pravatar.cc/150?u=1' },
                        { id: 'W-1102', img: 'https://i.pravatar.cc/150?u=2' },
                        { id: 'W-5582', img: 'https://i.pravatar.cc/150?u=3' },
                    ].map((user) => (
                        <button key={user.id} className="flex flex-col items-center space-y-1 min-w-[60px]" type="button" onClick={() => setRecipient(user.id)}>
                            <div className="relative">
                                <img alt="User" className="w-12 h-12 rounded-full border-2 border-transparent hover:border-primary transition object-cover" src={user.img} />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <span className="material-icons-round text-[12px] text-blue-500">verified_user</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{user.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Amount</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-900 dark:text-white font-bold text-lg">{symbol}</span>
                    </div>
                    <input 
                        className="w-full bg-white dark:bg-card-dark border-none rounded-2xl py-6 pl-10 pr-20 shadow-input text-gray-900 dark:text-white placeholder-gray-300 focus:ring-2 focus:ring-primary/50 text-3xl font-bold tracking-tight transition-all" 
                        placeholder="0.00" 
                        type="text" 
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{currency}</span>
                    </div>
                </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Note <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                    <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                        <span className="material-icons-outlined text-gray-400">edit_note</span>
                    </div>
                    <textarea 
                        className="w-full bg-white dark:bg-card-dark border-none rounded-2xl py-3 pl-12 pr-4 shadow-input text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 text-base resize-none transition-all" 
                        placeholder="What's this for?" 
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 pb-8">
                <button 
                    className="w-full bg-primary hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-3xl shadow-lg shadow-yellow-200/50 dark:shadow-none transition-transform transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={isLoading || !amount || parseFloat(amount) <= 0 || !recipient}
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span>Send Money</span>
                            <span className="material-icons-round">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};