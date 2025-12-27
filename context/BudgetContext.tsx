import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BudgetMap = Record<string, { limit: number; enabled: boolean }>;

interface BudgetContextType {
    monthlyLimit: number; // Deprecated
    getLimitForWallet: (walletId: string) => number;
    isLimitEnabledForWallet: (walletId: string) => boolean;
    setLimitForWallet: (walletId: string, limit: number) => void;
    toggleLimitForWallet: (walletId: string, enabled: boolean) => void;
    cycleStartDay: number;
    setCycleStartDay: (day: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [budgets, setBudgets] = useState<BudgetMap>({});
    const [cycleStartDay, setCycleStartDayState] = useState<number>(28);

    useEffect(() => {
        loadBudgetData();
    }, []);

    const loadBudgetData = async () => {
        try {
            const [savedBudgets, savedCycle] = await Promise.all([
                AsyncStorage.getItem('wallet_budgets_map'),
                AsyncStorage.getItem('wallet_cycle_start_day')
            ]);

            if (savedBudgets) {
                setBudgets(JSON.parse(savedBudgets));
            } else {
                 // Backward compatibility check could go here if needed
            }

            if (savedCycle) {
                setCycleStartDayState(parseInt(savedCycle, 10));
            }
        } catch (e) {
            console.error('Failed to load budget data', e);
        }
    };

    const saveBudgets = async (newBudgets: BudgetMap) => {
        try {
            await AsyncStorage.setItem('wallet_budgets_map', JSON.stringify(newBudgets));
        } catch (e) {
             console.error('Failed to save budgets', e);
        }
    }

    const setCycleStartDay = (day: number) => {
        setCycleStartDayState(day);
        AsyncStorage.setItem('wallet_cycle_start_day', day.toString());
    };

    const getLimitForWallet = (walletId: string) => {
        return budgets[walletId]?.limit || 0;
    };

    const isLimitEnabledForWallet = (walletId: string) => {
        return budgets[walletId]?.enabled ?? true;
    };

    const setLimitForWallet = (walletId: string, limit: number) => {
        setBudgets(prev => {
            const newBudgets = {
                ...prev,
                [walletId]: { ...(prev[walletId] || { enabled: true }), limit }
            };
            saveBudgets(newBudgets);
            return newBudgets;
        });
    };

    const toggleLimitForWallet = (walletId: string, enabled: boolean) => {
        setBudgets(prev => {
            const newBudgets = {
                ...prev,
                [walletId]: { ...(prev[walletId] || { limit: 0 }), enabled }
            };
            saveBudgets(newBudgets);
            return newBudgets;
        });
    };

    return (
        <BudgetContext.Provider value={{ 
            monthlyLimit: 0, 
            getLimitForWallet,
            isLimitEnabledForWallet,
            setLimitForWallet,
            toggleLimitForWallet,
            cycleStartDay,
            setCycleStartDay
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (!context) throw new Error('useBudget must be used within BudgetProvider');
    return context;
};
