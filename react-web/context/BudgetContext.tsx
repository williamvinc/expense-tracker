import React, { createContext, useContext, useState, useEffect } from 'react';

// Map walletId -> { limit: number, enabled: boolean }
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
    const [budgets, setBudgets] = useState<BudgetMap>(() => {
        try {
            const saved = localStorage.getItem('wallet_budgets_map');
            if (saved) return JSON.parse(saved);

            // Migration from old single-value storage
            const oldLimit = localStorage.getItem('wallet_monthly_limit');
            const oldEnabled = localStorage.getItem('wallet_limit_enabled');
            
            if (oldLimit) {
                return {
                    'main': {
                        limit: parseFloat(oldLimit),
                        enabled: oldEnabled ? JSON.parse(oldEnabled) : true
                    }
                };
            }
            return {};
        } catch (e) {
            return {};
        }
    });

    const [cycleStartDay, setCycleStartDayState] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('wallet_cycle_start_day');
            return saved ? parseInt(saved, 10) : 28; // Default to 28 as per request
        } catch {
            return 28;
        }
    });

    useEffect(() => {
        localStorage.setItem('wallet_budgets_map', JSON.stringify(budgets));
    }, [budgets]);

    const setCycleStartDay = (day: number) => {
        setCycleStartDayState(day);
        localStorage.setItem('wallet_cycle_start_day', day.toString());
    };

    const getLimitForWallet = (walletId: string) => {
        return budgets[walletId]?.limit || 0;
    };

    const isLimitEnabledForWallet = (walletId: string) => {
        return budgets[walletId]?.enabled ?? true;
    };

    const setLimitForWallet = (walletId: string, limit: number) => {
        setBudgets(prev => ({
            ...prev,
            [walletId]: { ...(prev[walletId] || { enabled: true }), limit }
        }));
    };

    const toggleLimitForWallet = (walletId: string, enabled: boolean) => {
        setBudgets(prev => ({
            ...prev,
            [walletId]: { ...(prev[walletId] || { limit: 0 }), enabled }
        }));
    };

    return (
        <BudgetContext.Provider value={{ 
            monthlyLimit: 0, // Deprecated
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