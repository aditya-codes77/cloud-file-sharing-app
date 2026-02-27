// Utility to add transactions to localStorage
export const addTransaction = (type, description, credits = 0, amount = null, userId = 'default') => {
    const transaction = {
        id: Date.now().toString(),
        type, // 'upload', 'download', 'delete', 'subscription'
        description,
        date: new Date().toISOString(),
        status: 'completed',
        credits,
        ...(amount && { amount })
    };

    // Get existing transactions for this user
    const stored = localStorage.getItem('transactions_' + userId);
    const transactions = stored ? JSON.parse(stored) : [];

    // Add new transaction
    transactions.unshift(transaction);

    // Keep only last 100 transactions
    if (transactions.length > 100) {
        transactions.splice(100);
    }

    // Save back to localStorage
    localStorage.setItem('transactions_' + userId, JSON.stringify(transactions));

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('transactionAdded'));
};
