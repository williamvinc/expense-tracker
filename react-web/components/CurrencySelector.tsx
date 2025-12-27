import React from 'react';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

const FLAG_URLS: Record<CurrencyCode, string> = {
    USD: 'https://flagcdn.com/w160/us.png',
    IDR: 'https://flagcdn.com/w160/id.png',
    SGD: 'https://flagcdn.com/w160/sg.png'
};

export const CurrencySelector: React.FC = () => {
    const { isCurrencySet, setCurrency } = useCurrency();

    if (isCurrencySet) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
             <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transform transition-all animate-scale-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <span className="material-icons-round text-3xl text-yellow-600">currency_exchange</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Currency</h2>
                    <p className="text-gray-500 text-sm">Choose your preferred currency for the wallet display.</p>
                </div>

                <div className="space-y-3">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <button
                            key={code}
                            onClick={() => setCurrency(code)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-yellow-50 hover:border-yellow-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-2 border-white group-hover:border-yellow-200 transition-colors">
                                    <img 
                                        src={FLAG_URLS[code]} 
                                        alt={`${code} flag`} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">{code}</p>
                                    <p className="text-xs text-gray-400 group-hover:text-yellow-600/70 transition-colors">
                                        {code === 'USD' ? 'United States Dollar' : code === 'IDR' ? 'Indonesian Rupiah' : 'Singapore Dollar'}
                                    </p>
                                </div>
                            </div>
                            <span className="material-icons-round text-gray-300 group-hover:text-yellow-500 transition-colors">chevron_right</span>
                        </button>
                    ))}
                </div>
             </div>
        </div>
    );
}