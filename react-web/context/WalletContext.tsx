import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wallet } from '../types';

interface WalletContextType {
  wallets: Wallet[];
  selectedWalletId: string;
  selectedWallet: Wallet;
  selectWallet: (id: string) => void;
  addWallet: (wallet: Wallet) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
}

const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'main',
    name: 'Primary Wallet',
    type: 'Primary',
    currency: 'USD',
    themeColor: 'bg-gray-900 dark:bg-black',
    icon: 'account_balance_wallet',
    cardNumber: '4288'
  }
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      const saved = localStorage.getItem('virtual_wallets');
      return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
    } catch {
      return DEFAULT_WALLETS;
    }
  });

  const [selectedWalletId, setSelectedWalletId] = useState<string>(() => {
     return localStorage.getItem('virtual_selected_wallet_id') || 'main';
  });

  useEffect(() => {
    localStorage.setItem('virtual_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('virtual_selected_wallet_id', selectedWalletId);
  }, [selectedWalletId]);

  const selectWallet = (id: string) => {
    if (wallets.find(w => w.id === id)) {
      setSelectedWalletId(id);
    }
  };

  const addWallet = (wallet: Wallet) => {
    setWallets(prev => [...prev, wallet]);
    setSelectedWalletId(wallet.id); // Auto select new wallet
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWallet = (id: string) => {
    if (wallets.length <= 1) return; // Prevent deleting last wallet
    
    const newWallets = wallets.filter(w => w.id !== id);
    setWallets(newWallets);
    
    if (selectedWalletId === id) {
      setSelectedWalletId(newWallets[0].id);
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  return (
    <WalletContext.Provider value={{ 
      wallets, 
      selectedWalletId, 
      selectedWallet, 
      selectWallet, 
      addWallet, 
      updateWallet, 
      deleteWallet 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};