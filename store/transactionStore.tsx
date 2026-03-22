import React, { createContext, useContext, useState, useEffect } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  type: TransactionType;
  date: string;
  time: string;
  notes?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  balance: number;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0); // Set to 0 for a clean start

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setTransactions(prev => [tx, ...prev]);
    
    // Update balance
    if (tx.type === 'income') {
      setBalance(prev => prev + tx.amount);
    } else {
      setBalance(prev => prev - tx.amount);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, balance, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
