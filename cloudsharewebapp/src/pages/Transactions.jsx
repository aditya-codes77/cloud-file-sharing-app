import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const Transaction = () => {
    const { user } = useUser();
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all'); // all, upload, download, delete, subscription

    useEffect(() => {
        // Load transactions from localStorage
        const loadTransactions = () => {
            const userId = user?.id || 'default';
            const stored = localStorage.getItem('transactions_' + userId);
            if (stored) {
                const parsed = JSON.parse(stored);
                setTransactions(parsed.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } else {
                setTransactions([]);
            }
        };
        
        loadTransactions();
        
        // Listen for transaction updates
        const handleStorageChange = () => {
            loadTransactions();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('transactionAdded', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('transactionAdded', handleStorageChange);
        };
    }, [user]);

    const filteredTransactions = transactions.filter(t => 
        filter === 'all' ? true : t.type === filter
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'upload':
                return (
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            case 'download':
                return (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            case 'delete':
                return (
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500">
                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            case 'subscription':
                return (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            upload: 'bg-purple-100 text-purple-800',
            download: 'bg-blue-100 text-blue-800',
            delete: 'bg-red-100 text-red-800',
            subscription: 'bg-green-100 text-green-800'
        };
        
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-4 min-h-screen overflow-hidden" style={{backgroundColor: '#f5efff'}}>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-normal mb-6">
                    Transaction History
                </h1>

                {/* Filter Buttons */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === 'all'
                                    ? 'bg-purple-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('upload')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === 'upload'
                                    ? 'bg-purple-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Uploads
                        </button>
                        <button
                            onClick={() => setFilter('download')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === 'download'
                                    ? 'bg-purple-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Downloads
                        </button>
                        <button
                            onClick={() => setFilter('delete')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === 'delete'
                                    ? 'bg-purple-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Deletes
                        </button>
                        <button
                            onClick={() => setFilter('subscription')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === 'subscription'
                                    ? 'bg-purple-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Subscriptions
                        </button>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300 mx-auto mb-3">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p className="text-gray-500">No transactions found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        {getTypeIcon(transaction.type)}

                                        {/* Transaction Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {transaction.description}
                                                </p>
                                                {getTypeBadge(transaction.type)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{formatDate(transaction.date)}</span>
                                                <span>•</span>
                                                <span className="capitalize">{transaction.status}</span>
                                            </div>
                                        </div>

                                        {/* Credits/Amount */}
                                        <div className="text-right">
                                            {transaction.amount && (
                                                <p className="text-sm font-semibold text-green-600 mb-1">
                                                    ₹{transaction.amount}
                                                </p>
                                            )}
                                            {transaction.credits && (
                                                <p className={`text-sm font-medium ${
                                                    transaction.credits > 0 ? 'text-green-600' : 'text-gray-600'
                                                }`}>
                                                    {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500 flex-shrink-0">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Transaction History</p>
                            <p className="text-sm text-blue-700">
                                All your file uploads, downloads, and subscription purchases are recorded here. 
                                Credits are deducted based on file size and activity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transaction;
