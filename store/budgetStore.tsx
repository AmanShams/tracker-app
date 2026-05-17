import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'budgets_data';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  icon: string; // Ionicons name
  color: string;
  bgColor: string;
  linkedCategoryName: string; // To link with transactions
}

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (budget: Budget) => void;
  updateBudgetSpent: (id: string, amount: number) => void;
  deleteBudget: (id: string) => void;
  isLoaded: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const DEFAULT_BUDGETS: Budget[] = [
  {
    id: '1',
    name: 'Internet Bill',
    amount: 1500,
    spent: 0,
    icon: 'wifi-outline',
    color: '#3B82F6',
    bgColor: '#EBF3FF',
    linkedCategoryName: 'Bills',
  },
  {
    id: '2',
    name: 'Gym',
    amount: 2500,
    spent: 0,
    icon: 'barbell-outline',
    color: '#10B981',
    bgColor: '#ECFDF5',
    linkedCategoryName: 'Health',
  },
  {
    id: '3',
    name: 'Charity',
    amount: 500,
    spent: 0,
    icon: 'heart-outline',
    color: '#c665feff',
    bgColor: '#FEE2E2',
    linkedCategoryName: 'Charity',
  },
  {
    id: '4',
    name: 'Hygiene',
    amount: 1000,
    spent: 0,
    icon: 'water-outline',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    linkedCategoryName: 'Health',
  }
];

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load budgets from AsyncStorage
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const storedBudgets = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }
      } catch (error) {
        console.error('Failed to load budgets:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadBudgets();
  }, []);

  // Save budgets to AsyncStorage
  useEffect(() => {
    if (isLoaded) {
      const saveBudgets = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
        } catch (error) {
          console.error('Failed to save budgets:', error);
        }
      };
      saveBudgets();
    }
  }, [budgets, isLoaded]);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substr(2, 9),
      spent: 0,
    };
    setBudgets(prev => [budget, ...prev]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const updateBudgetSpent = (id: string, amount: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent: b.spent + amount } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, updateBudgetSpent, deleteBudget, isLoaded }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
}
