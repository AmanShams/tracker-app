import React, { createContext, useContext, useState } from 'react';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  icon: any; // Ionicons name
  color: string;
  bgColor: string;
}

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substr(2, 9),
      spent: 0,
    };
    setBudgets(prev => [budget, ...prev]);
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget }}>
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
