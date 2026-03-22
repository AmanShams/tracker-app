import React, { createContext, useContext, useState } from 'react';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  createdAt: string;
}

interface SavingsContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateAmount: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'New Laptop',
      targetAmount: 2500,
      currentAmount: 1200,
      icon: 'laptop-outline',
      color: '#3B82F6',
      createdAt: 'Mar 15, 2026',
    },
    {
      id: '2',
      name: 'Home Renovation',
      targetAmount: 15000,
      currentAmount: 4500,
      icon: 'home-outline',
      color: '#10B981',
      createdAt: 'Mar 10, 2026',
    },
  ]);

  const addGoal = (newGoal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setGoals((prev) => [goal, ...prev]);
  };

  const updateAmount = (id: string, amount: number) => {
    setGoals((prev) => 
      prev.map((g) => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <SavingsContext.Provider value={{ goals, addGoal, updateAmount, deleteGoal }}>
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
}
