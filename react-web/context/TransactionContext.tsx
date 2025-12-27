import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '../types';

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
  // Initialize state from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('wallet_transactions');
      let parsed = saved ? JSON.parse(saved) : [];
      
      // MIGRATION: Ensure all existing transactions have a walletId
      // If we are introducing walletId for the first time, assign 'main' to old ones
      const migrated = parsed.map((t: Transaction) => ({
          ...t,
          walletId: t.walletId || 'main'
      }));
      
      return migrated;
    } catch (error) {
      console.error('Failed to load transactions from storage:', error);
      return [];
    }
  });

  // Persist to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem('wallet_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions to storage:', error);
    }
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    // Add new transaction to the beginning of the list
    setTransactions(prev => [transaction, ...prev]);
  };

  const getTransaction = (id: string) => {
    return transactions.find(t => t.id === id);
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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