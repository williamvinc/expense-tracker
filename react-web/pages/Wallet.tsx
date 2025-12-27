import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';
import { useUser } from '../context/UserContext';
import { useWallet } from '../context/WalletContext';
import { Wallet as WalletType } from '../types';

// ==========================================
// 🎨 COLOR CONFIGURATION
// You can customize the available wallet colors here.
// ==========================================
const WALLET_COLORS = [
    { id: 'black', class: 'bg-gray-900', label: 'Black' },
    { id: 'slate', class: 'bg-slate-700', label: 'Slate' },
    { id: 'navy', class: 'bg-[#132440]', label: 'Navy' },
    { id: 'deep-purple', class: 'bg-[#210F37]', label: 'Deep Purple' },
    { id: 'bright-orange', class: 'bg-[#FF6500]', label: 'Bright Orange' },
    { id: 'gold', class: 'bg-[#FEC260]', label: 'Gold' },
];

const WALLET_ICONS = [
    'account_balance_wallet', 'savings', 'credit_card', 'payments',
    'work', 'domain', 'home', 'directions_car',
    'shopping_cart', 'flight', 'currency_bitcoin', 'trending_up',
    'diamond', 'volunteer_activism', 'school', 'pets',
    'child_care', 'sports_esports', 'restaurant', 'cake'
];

const SUGGESTED_TYPES = ['Primary', 'Savings', 'Work', 'Travel', 'Crypto', 'Investment', 'Joint', 'Emergency'];

export const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTransactionsByWallet } = useTransactions();
  const { formatMoney } = useCurrency();
  const { user } = useUser();
  const { wallets, selectedWallet, selectWallet, addWallet, updateWallet, deleteWallet } = useWallet();

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // New Wallet Form State
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('Primary');
  const [newWalletColor, setNewWalletColor] = useState(WALLET_COLORS[0].class);
  const [newWalletIcon, setNewWalletIcon] = useState('account_balance_wallet');

  // Edit Wallet Form State
  const [editWalletName, setEditWalletName] = useState('');
  const [editWalletType, setEditWalletType] = useState('Primary');
  const [editWalletColor, setEditWalletColor] = useState('');
  const [editWalletIcon, setEditWalletIcon] = useState('account_balance_wallet');

  // Calculate balance for a specific wallet
  const getWalletBalance = (walletId: string) => {
    const txs = getTransactionsByWallet(walletId);
    return txs.reduce((acc, curr) => {
        const val = Number(curr.amount);
        return curr.type === 'income' ? acc + val : acc - val;
    }, 0);
  };

  const canAddWallet = wallets.length < 4;

  // --- Helper to guess icon based on type string ---
  const getIconForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sav')) return 'savings';
    if (t.includes('work') || t.includes('business')) return 'domain';
    if (t.includes('travel') || t.includes('trip') || t.includes('holiday')) return 'flight';
    if (t.includes('invest') || t.includes('stock') || t.includes('market')) return 'trending_up';
    if (t.includes('crypto') || t.includes('bitcoin')) return 'currency_bitcoin';
    if (t.includes('home') || t.includes('house') || t.includes('rent')) return 'home';
    if (t.includes('car') || t.includes('auto') || t.includes('transport')) return 'directions_car';
    if (t.includes('food') || t.includes('grocer')) return 'shopping_cart';
    if (t.includes('joint') || t.includes('family')) return 'group';
    if (t.includes('emergency')) return 'medical_services';
    return 'account_balance_wallet';
  };

  // --- Handlers ---

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) return;
    if (!canAddWallet) {
        alert("Maximum wallet limit reached (4).");
        return;
    }
    
    const newWallet: WalletType = {
        id: Date.now().toString(),
        name: newWalletName,
        type: newWalletType || 'Custom',
        currency: 'USD',
        themeColor: newWalletColor,
        icon: newWalletIcon,
        cardNumber: Math.floor(1000 + Math.random() * 9000).toString()
    };
    
    addWallet(newWallet);
    setShowAddModal(false);
    setNewWalletName('');
    setNewWalletType('Primary');
    setNewWalletColor(WALLET_COLORS[0].class);
    setNewWalletIcon('account_balance_wallet');
  };
  
  const handleOpenEdit = () => {
      setEditWalletName(selectedWallet.name);
      setEditWalletType(selectedWallet.type);
      setEditWalletColor(selectedWallet.themeColor || WALLET_COLORS[0].class);
      setEditWalletIcon(selectedWallet.icon || 'account_balance_wallet');
      setShowMoreMenu(false);
      setShowEditModal(true);
  };

  const handleUpdateWallet = () => {
      if (!editWalletName.trim()) return;

      updateWallet(selectedWallet.id, {
          name: editWalletName,
          type: editWalletType || 'Custom',
          themeColor: editWalletColor,
          icon: editWalletIcon
      });
      setShowEditModal(false);
  };

  const handleDeleteCurrent = () => {
      setShowMoreMenu(false);
      setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
      deleteWallet(selectedWallet.id);
      setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate('/')}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card-dark rounded-full shadow-soft text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <span className="material-icons-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold dark:text-white">My Virtual Wallet</h1>
        {/* Invisible spacer to replace the add button and keep title centered */}
        <div className="w-12 h-12"></div>
      </header>

      <div className="px-6 space-y-8 mt-2">
        {/* Main Wallet Card (Selected) */}
        <div className="animate-scale-up relative">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{selectedWallet.name}</h2>
          <div className={`relative w-full aspect-[1.58/1] ${selectedWallet.themeColor || 'bg-gray-900'} rounded-3xl p-6 text-white shadow-card overflow-hidden group border border-white/10 transition-colors duration-500`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="relative h-full flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-white/70 mb-1">Total Balance</p>
                  <h3 className="text-3xl font-bold">
                    {formatMoney(getWalletBalance(selectedWallet.id))}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <span className="material-icons-outlined text-white">{selectedWallet.icon}</span>
                </div>
              </div>

              <div className="py-2">
                <p className="text-xs text-white/70 mb-1">Wallet ID</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg tracking-widest text-white/90">W-{selectedWallet.cardNumber || '8829'}</span>
                  <button className="text-white/50 hover:text-white transition">
                    <span className="material-icons-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">Account Holder</p>
                  <p className="text-sm font-medium tracking-wide">{user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                    <p className="text-sm font-medium tracking-wide">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/top-up', { state: { backgroundLocation: location } })}
                className="w-14 h-14 rounded-full bg-white dark:bg-card-dark shadow-soft flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <span className="material-icons-outlined">add_card</span>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Top Up</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/send')}
                className="w-14 h-14 rounded-full bg-white dark:bg-card-dark shadow-soft flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <span className="material-icons-outlined">arrow_upward</span>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Send</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/limits', { state: { from: '/wallet' } })}
                className="w-14 h-14 rounded-full bg-white dark:bg-card-dark shadow-soft flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <span className="material-icons-outlined">history</span>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Limits</span>
            </div>
            <div className="flex flex-col items-center gap-2 relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`w-14 h-14 rounded-full shadow-soft flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${showMoreMenu ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-card-dark'}`}
              >
                <span className="material-icons-outlined">more_horiz</span>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">More</span>
              
              {/* More Menu */}
              {showMoreMenu && (
                  <div className="absolute top-16 right-0 w-48 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 animate-fade-in origin-top-right">
                      {/* Edit Option */}
                      <button 
                        onClick={handleOpenEdit}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800"
                      >
                          <span className="material-icons-round text-sm">edit</span>
                          Edit Wallet
                      </button>

                      {/* Delete Option */}
                      <button 
                        disabled={wallets.length <= 1}
                        onClick={handleDeleteCurrent}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                          <span className="material-icons-round text-sm">delete</span>
                          Delete Wallet
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Wallets List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Other Wallets</h2>
             {!canAddWallet && (
                 <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">Limit Reached</span>
             )}
          </div>
          
          <div className="space-y-4">
             {wallets.filter(w => w.id !== selectedWallet.id).length === 0 ? (
                 <div className="bg-gray-50 dark:bg-card-dark rounded-3xl p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 text-sm">No secondary wallets active.</p>
                 </div>
             ) : (
                 wallets.filter(w => w.id !== selectedWallet.id).map(wallet => (
                     <button
                        key={wallet.id}
                        onClick={() => selectWallet(wallet.id)}
                        className="w-full bg-white dark:bg-card-dark rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:scale-[1.02] transition-transform"
                     >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${wallet.themeColor || 'bg-gray-800'} flex items-center justify-center text-white`}>
                                <span className="material-icons-round">{wallet.icon}</span>
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 dark:text-white">{wallet.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{wallet.type}</p>
                            </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{formatMoney(getWalletBalance(wallet.id))}</span>
                     </button>
                 ))
             )}
          </div>

          <button 
            onClick={() => canAddWallet && setShowAddModal(true)}
            disabled={!canAddWallet}
            className={`w-full mt-6 border-2 border-dashed rounded-3xl p-4 flex items-center justify-center gap-2 transition group ${canAddWallet ? 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800' : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
          >
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
              <span className="material-icons-round text-sm">add</span>
            </span>
            <span className="font-medium text-sm">{canAddWallet ? 'Add New Wallet' : 'Wallet Limit Reached'}</span>
          </button>
        </div>
      </div>

      {/* ======================= */}
      {/* 🟢 CREATE WALLET MODAL */}
      {/* ======================= */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}></div>
              <div className="relative bg-surface-light dark:bg-card-dark w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 shadow-2xl animate-slide-up mb-0 sm:mb-8 overflow-y-auto max-h-[90vh]">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Wallet</h2>
                  
                  <div className="space-y-6">
                      {/* Name Input */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Travel Fund"
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                            value={newWalletName}
                            onChange={(e) => setNewWalletName(e.target.value)}
                            autoFocus
                          />
                      </div>
                      
                      {/* Type Selection with Input & Chips */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Type</label>
                          <input 
                              type="text"
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary mb-3"
                              placeholder="e.g. Savings, Crypto, Joint"
                              value={newWalletType}
                              onChange={(e) => setNewWalletType(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                              {SUGGESTED_TYPES.map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        setNewWalletType(type);
                                        setNewWalletIcon(getIconForType(type));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border-2 ${newWalletType === type ? 'border-primary bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-white' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Icon Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Wallet Icon</label>
                          <div className="grid grid-cols-5 gap-3 max-h-32 overflow-y-auto no-scrollbar py-1">
                              {WALLET_ICONS.map((icon) => {
                                  const isSelected = newWalletIcon === icon;
                                  return (
                                      <button
                                          key={icon}
                                          onClick={() => setNewWalletIcon(icon)}
                                          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-gray-900 shadow-md ring-2 ring-primary ring-offset-2 dark:ring-offset-card-dark' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                      >
                                          <span className="material-icons-round text-xl">{icon}</span>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Card Color</label>
                          <div className="grid grid-cols-6 gap-3">
                              {WALLET_COLORS.map((color) => {
                                  const isSelected = newWalletColor === color.class;
                                  return (
                                      <button
                                          key={color.id}
                                          onClick={() => setNewWalletColor(color.class)}
                                          className={`relative aspect-square rounded-full ${color.class} shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${isSelected ? 'ring-4 ring-offset-2 ring-primary dark:ring-offset-card-dark' : ''}`}
                                          aria-label={`Select ${color.label} color`}
                                      >
                                          {isSelected && (
                                              <span className="material-icons-round text-white font-bold text-lg">check</span>
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      <button 
                        onClick={handleCreateWallet}
                        disabled={!newWalletName.trim()}
                        className="w-full bg-primary text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-200/50 hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Create Wallet
                      </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                      <span className="material-icons-round text-sm">close</span>
                  </button>
              </div>
          </div>
      )}

      {/* ======================= */}
      {/* ✏️ EDIT WALLET MODAL */}
      {/* ======================= */}
      {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditModal(false)}></div>
              <div className="relative bg-surface-light dark:bg-card-dark w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 shadow-2xl animate-slide-up mb-0 sm:mb-8 overflow-y-auto max-h-[90vh]">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Wallet</h2>
                  
                  <div className="space-y-6">
                      {/* Name Input */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary"
                            value={editWalletName}
                            onChange={(e) => setEditWalletName(e.target.value)}
                          />
                      </div>
                      
                      {/* Type Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Type</label>
                          <input 
                              type="text"
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary mb-3"
                              placeholder="e.g. Savings, Crypto, Joint"
                              value={editWalletType}
                              onChange={(e) => setEditWalletType(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                              {SUGGESTED_TYPES.map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        setEditWalletType(type);
                                        setEditWalletIcon(getIconForType(type));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border-2 ${editWalletType === type ? 'border-primary bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-white' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Icon Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Wallet Icon</label>
                          <div className="grid grid-cols-5 gap-3 max-h-32 overflow-y-auto no-scrollbar py-1">
                              {WALLET_ICONS.map((icon) => {
                                  const isSelected = editWalletIcon === icon;
                                  return (
                                      <button
                                          key={icon}
                                          onClick={() => setEditWalletIcon(icon)}
                                          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-gray-900 shadow-md ring-2 ring-primary ring-offset-2 dark:ring-offset-card-dark' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                      >
                                          <span className="material-icons-round text-xl">{icon}</span>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Card Color</label>
                          <div className="grid grid-cols-6 gap-3">
                              {WALLET_COLORS.map((color) => {
                                  const isSelected = editWalletColor === color.class;
                                  return (
                                      <button
                                          key={color.id}
                                          onClick={() => setEditWalletColor(color.class)}
                                          className={`relative aspect-square rounded-full ${color.class} shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${isSelected ? 'ring-4 ring-offset-2 ring-primary dark:ring-offset-card-dark' : ''}`}
                                          aria-label={`Select ${color.label} color`}
                                      >
                                          {isSelected && (
                                              <span className="material-icons-round text-white font-bold text-lg">check</span>
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      <button 
                        onClick={handleUpdateWallet}
                        disabled={!editWalletName.trim()}
                        className="w-full bg-primary text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-200/50 hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Save Changes
                      </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                      <span className="material-icons-round text-sm">close</span>
                  </button>
              </div>
          </div>
      )}

      {/* ======================= */}
      {/* 🔴 DELETE CONFIRMATION MODAL */}
      {/* ======================= */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-light dark:bg-card-dark rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-scale-up">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <span className="material-icons-round text-3xl text-expense-red">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Wallet?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{selectedWallet.name}"</span>? 
                        <br/>
                        This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3.5 rounded-xl font-bold text-white bg-expense-red hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
      )}
    </div>
  );
};