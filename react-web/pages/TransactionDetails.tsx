import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCurrency } from '../context/CurrencyContext';

export const TransactionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getTransaction, deleteTransaction, updateTransaction } = useTransactions();
  const { formatMoney } = useCurrency();
  
  const transaction = id ? getTransaction(id) : undefined;

  // State to track deletion process to prevent "Not Found" UI flash
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Local state for editing notes
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Local state for editing amount
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  // Sync local states with transaction when it loads
  useEffect(() => {
    if (transaction) {
      setNoteText(transaction.note || '');
      setAmountInput(transaction.amount.toString());
    }
  }, [transaction]);

  if (!transaction) {
    // If we are in the process of deleting, return null (empty) to avoid "Not Found" screen flash
    if (isDeleting) return null;
    
    return (
        <div className="h-full flex items-center justify-center bg-surface-light">
            <p className="text-gray-500">Transaction not found.</p>
            <button onClick={() => navigate('/', { replace: true })} className="ml-4 text-primary font-bold">Go Home</button>
        </div>
    );
  }

  const handleDeleteClick = () => {
      setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (id) {
        setIsDeleting(true);
        deleteTransaction(id);
        navigate('/', { replace: true });
    }
  };

  const handleSaveNote = () => {
    if (id) {
        updateTransaction(id, { note: noteText });
        setIsEditingNote(false);
    }
  };

  const handleSaveAmount = () => {
    const val = parseFloat(amountInput);
    if (!isNaN(val) && val > 0 && id) {
        updateTransaction(id, { amount: val });
        setIsEditingAmount(false);
    }
  };

  const dateObj = new Date(transaction.date);
  const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="h-full overflow-hidden absolute inset-0 bg-black/40 backdrop-blur-sm z-50">
        <div className="absolute inset-0" onClick={() => navigate(-1)}></div>
        
        <div className="absolute bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-surface-light rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl transform transition-all overflow-hidden h-[92%] flex flex-col animate-slide-up">
            <div className="w-full flex justify-center pt-5 pb-3 bg-surface-light shrink-0">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className="px-6 pb-2 flex items-center justify-between shrink-0 bg-surface-light">
                <div className="w-10"></div> 
                <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors bg-gray-50"
                >
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 bg-surface-light no-scrollbar">
                <div className="flex flex-col items-center py-6">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-8 ring-opacity-50 shadow-sm ${transaction.type === 'income' ? 'bg-yellow-50 ring-yellow-50/50' : 'bg-yellow-100 ring-yellow-50'}`}>
                        <span className={`material-icons-round text-3xl ${transaction.type === 'income' ? 'text-yellow-600' : 'text-yellow-600'}`}>
                            {transaction.icon}
                        </span>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 text-center">{transaction.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{dateString}</p>
                    
                    <div className="mt-4 flex flex-col items-center min-h-[4rem]">
                         {isEditingAmount ? (
                            <div className="flex items-center gap-2 animate-scale-up">
                                <span className="text-2xl font-bold text-gray-400">{transaction.type === 'income' ? '+' : '-'}</span>
                                <input
                                    type="number"
                                    value={amountInput}
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    className="w-40 text-center text-4xl font-bold bg-white border border-primary rounded-xl py-1 focus:ring-0 text-gray-900 shadow-input"
                                    autoFocus
                                    onBlur={handleSaveAmount}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAmount()}
                                />
                                <button 
                                    onClick={handleSaveAmount}
                                    className="w-10 h-10 rounded-full bg-primary text-gray-900 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                                >
                                    <span className="material-icons-round">check</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 relative group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setIsEditingAmount(true)}>
                                <span className={`text-4xl font-bold ${transaction.type === 'income' ? 'text-success-green' : 'text-gray-900'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}{formatMoney(Number(transaction.amount))}
                                </span>
                                <button 
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-gray-900"
                                >
                                    <span className="material-icons-round text-sm">edit</span>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2 px-3 py-1 bg-green-100 rounded-full">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wide">{transaction.status || 'Successful'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[1.5rem] p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Category</span>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="material-icons-round text-gray-500 text-xs">
                                    {transaction.type === 'income' ? 'attach_money' : 'restaurant'}
                                </span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {transaction.category || (transaction.type === 'income' ? 'Income' : 'General')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-px bg-gray-200"></div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Platform</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                                {transaction.platform || 'Etc'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-px bg-gray-200"></div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Source</span>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="material-icons-round text-gray-500 text-xs">credit_card</span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{transaction.paymentMethod || 'Main Wallet'}</span>
                        </div>
                    </div>
                    
                    <div className="h-px bg-gray-200"></div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">Notes</span>
                            {isEditingNote ? (
                                <button onClick={handleSaveNote} className="text-xs text-primary-dark font-bold hover:underline">Save</button>
                            ) : (
                                <button onClick={() => setIsEditingNote(true)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-icons-round text-sm">edit</span>
                                </button>
                            )}
                        </div>
                        {isEditingNote ? (
                             <textarea 
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                rows={3}
                                placeholder="Add a note..."
                             />
                        ) : (
                            <p className="text-sm text-gray-900 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 min-h-[3rem]">
                                {transaction.note || <span className="text-gray-400 italic">No notes added.</span>}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={handleDeleteClick}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-sm font-bold text-expense-red hover:bg-red-100 transition-colors"
                    >
                        <span className="material-icons-round text-lg">delete</span>
                        Delete Transaction
                    </button>
                </div>
            </div>

            <div className="p-6 bg-surface-light shrink-0 pt-2 pb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-full py-4 bg-primary text-gray-900 font-bold text-lg rounded-[1.25rem] shadow-lg shadow-yellow-200/50 hover:shadow-yellow-200/70 transition-all active:scale-[0.98]"
                >
                    Done
                </button>
            </div>
        </div>

        {/* Custom Confirmation Modal */}
        {showDeleteConfirm && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-light rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-scale-up">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <span className="material-icons-round text-3xl text-expense-red">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Transaction?</h3>
                    <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
                        Are you sure you want to remove this transaction? This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3.5 rounded-xl font-bold text-white bg-expense-red hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
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