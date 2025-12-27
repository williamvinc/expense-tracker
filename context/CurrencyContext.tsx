import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    currency: string;
    setCurrency: (currency: string) => void;
    formatMoney: (amount: number) => string;
    AVAILABLE_CURRENCIES: { code: string; symbol: string; locale: string }[];
    isCurrencySet: boolean;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
    const [isCurrencySet, setIsCurrencySet] = useState(false);

    useEffect(() => {
        loadCurrency();
    }, []);

    const loadCurrency = async () => {
        try {
            const saved = await AsyncStorage.getItem('virtual_wallet_currency');
             if (saved && (saved === 'USD' || saved === 'IDR' || saved === 'SGD')) {
                setCurrencyState(saved as CurrencyCode);
                setIsCurrencySet(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const setCurrency = (c: string) => {
        setCurrencyState(c as CurrencyCode);
        setIsCurrencySet(true);
        AsyncStorage.setItem('virtual_wallet_currency', c);
    };

    const formatMoney = (amount: number) => {
        const config = CURRENCIES[currency];
        // Note: Intl.NumberFormat support in React Native on Android depends on JSC/Hermes version.
        // Modern Hermes supports it well.
        try {
            return new Intl.NumberFormat(config.locale, {
                style: 'currency',
                currency: config.code,
                minimumFractionDigits: currency === 'IDR' ? 0 : 2,
                maximumFractionDigits: currency === 'IDR' ? 0 : 2,
            }).format(amount);
        } catch (e) {
            // Fallback for older engines
             return `${config.symbol} ${amount.toFixed(currency === 'IDR' ? 0 : 2)}`;
        }
    };

    const AVAILABLE_CURRENCIES = Object.values(CURRENCIES);

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatMoney,
            AVAILABLE_CURRENCIES,
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
