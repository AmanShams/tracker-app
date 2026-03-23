import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'transactions_data';

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
  budgetId?: string; // LINKED BUDGET
}

interface TransactionContextType {
  transactions: Transaction[];
  balance: number;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
        const storedBalance = await AsyncStorage.getItem('balance_data');
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedBalance) setBalance(Number(storedBalance));
      } catch (e) {
        console.error('Failed to load transactions', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Save to AsyncStorage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      AsyncStorage.setItem('balance_data', balance.toString());
    }
  }, [transactions, balance, isLoaded]);

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

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => {
      const oldTx = prev.find(t => t.id === updatedTx.id);
      if (!oldTx) return prev;
      
      // Update balance
      setBalance(b => {
        let newBalance = b;
        // Undo old
        if (oldTx.type === 'income') newBalance -= oldTx.amount;
        else newBalance += oldTx.amount;
        // Apply new
        if (updatedTx.type === 'income') newBalance += updatedTx.amount;
        else newBalance -= updatedTx.amount;
        return newBalance;
      });
      
      return prev.map(t => t.id === updatedTx.id ? updatedTx : t);
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const oldTx = prev.find(t => t.id === id);
      if (oldTx) {
        setBalance(b => oldTx.type === 'income' ? b - oldTx.amount : b + oldTx.amount);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  return (
    <TransactionContext.Provider value={{ transactions, balance, addTransaction, updateTransaction, deleteTransaction }}>
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
