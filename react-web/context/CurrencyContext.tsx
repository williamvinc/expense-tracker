import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'IDR' | 'SGD';

interface CurrencyConfig {
    code: string;
    symbol: string;
    locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' }
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    formatMoney: (amount: number) => string;
    isCurrencySet: boolean;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
    const [isCurrencySet, setIsCurrencySet] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('virtual_wallet_currency');
        if (saved && (saved === 'USD' || saved === 'IDR' || saved === 'SGD')) {
            setCurrencyState(saved as CurrencyCode);
            setIsCurrencySet(true);
        }
    }, []);

    const setCurrency = (c: CurrencyCode) => {
        setCurrencyState(c);
        setIsCurrencySet(true);
        localStorage.setItem('virtual_wallet_currency', c);
    };

    const formatMoney = (amount: number) => {
        const config = CURRENCIES[currency];
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: currency === 'IDR' ? 0 : 2,
            maximumFractionDigits: currency === 'IDR' ? 0 : 2,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ 
            currency, 
            setCurrency, 
            formatMoney, 
            isCurrencySet,
            symbol: CURRENCIES[currency].symbol 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
    return context;
};