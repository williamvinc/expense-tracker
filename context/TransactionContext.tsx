import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/constants/types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  getTransaction: (id: string) => Transaction | undefined;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByWallet: (walletId: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
      try {
          const saved = await AsyncStorage.getItem('wallet_transactions');
          if (saved) {
             let parsed = JSON.parse(saved);
              // MIGRATION: Ensure all existing transactions have a walletId
              const migrated = parsed.map((t: Transaction) => ({
                  ...t,
                  walletId: t.walletId || 'main'
              }));
              setTransactions(migrated);
          }
      } catch (error) {
          console.error('Failed to load transactions:', error);
      }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
      try {
          await AsyncStorage.setItem('wallet_transactions', JSON.stringify(newTransactions));
      } catch (error) {
          console.error('Failed to save transactions:', error);
      }
  };

  const addTransaction = (transaction: Transaction) => {
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  const getTransaction = (id: string) => {
    return transactions.find(t => t.id === id);
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const newTransactions = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };
  
  const getTransactionsByWallet = (walletId: string) => {
      return transactions.filter(t => t.walletId === walletId);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, getTransaction, updateTransaction, deleteTransaction, getTransactionsByWallet }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
