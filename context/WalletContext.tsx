import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from '@/constants/types';

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
    themeColor: 'bg-gray-900', // Note: Tailwind classes might need mapping or custom handling in RN
    icon: 'account-balance-wallet', // Material icon name
    cardNumber: '4288'
  }
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('main');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const [savedWallets, savedSelectedId] = await Promise.all([
        AsyncStorage.getItem('virtual_wallets'),
        AsyncStorage.getItem('virtual_selected_wallet_id')
      ]);

      if (savedWallets) {
        setWallets(JSON.parse(savedWallets));
      }
      if (savedSelectedId) {
        setSelectedWalletId(savedSelectedId);
      }
    } catch (e) {
      console.error('Failed to load wallet data', e);
    }
  };

  const saveWallets = async (newWallets: Wallet[]) => {
      try {
          await AsyncStorage.setItem('virtual_wallets', JSON.stringify(newWallets));
      } catch (e) {
          console.error('Failed to save wallets', e);
      }
  };

  const selectWallet = (id: string) => {
    if (wallets.find(w => w.id === id)) {
      setSelectedWalletId(id);
      AsyncStorage.setItem('virtual_selected_wallet_id', id);
    }
  };

  const addWallet = (wallet: Wallet) => {
    const newWallets = [...wallets, wallet];
    setWallets(newWallets);
    saveWallets(newWallets);
    selectWallet(wallet.id);
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    const newWallets = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWallets(newWallets);
    saveWallets(newWallets);
  };

  const deleteWallet = (id: string) => {
    if (wallets.length <= 1) return;
    
    const newWallets = wallets.filter(w => w.id !== id);
    setWallets(newWallets);
    saveWallets(newWallets);
    
    if (selectedWalletId === id) {
      selectWallet(newWallets[0].id);
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
