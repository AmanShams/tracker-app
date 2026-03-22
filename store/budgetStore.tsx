import React, { createContext, useContext, useState } from 'react';

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
  updateBudgetSpent: (id: string, amount: number) => void;
  deleteBudget: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Groceries Pot',
      amount: 5000,
      spent: 1200,
      icon: 'cart-outline',
      color: '#0EA5E9',
      bgColor: '#E8F5FA',
      linkedCategoryName: 'Food',
    },
    {
      id: '2',
      name: 'Fuel Budget',
      amount: 3000,
      spent: 800,
      icon: 'car-outline',
      color: '#F59E0B',
      bgColor: '#FFF4E5',
      linkedCategoryName: 'Transport',
    }
  ]);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substr(2, 9),
      spent: 0,
    };
    setBudgets(prev => [budget, ...prev]);
  };

  const updateBudgetSpent = (id: string, amount: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent: b.spent + amount } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudgetSpent, deleteBudget }}>
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
