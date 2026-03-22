import React, { createContext, useContext, useState } from 'react';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  createdAt: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (category: Category) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Salary', icon: 'cash-outline', color: '#10B981', type: 'income', createdAt: "Mar 16, '26" },
    { id: '2', name: 'Freelance', icon: 'laptop-outline', color: '#3B82F6', type: 'income', createdAt: "Mar 16, '26" },
    { id: '3', name: 'Food', icon: 'fast-food-outline', color: '#EF4444', type: 'expense', createdAt: "Mar 16, '26" },
    { id: '4', name: 'Transport', icon: 'bus-outline', color: '#F59E0B', type: 'expense', createdAt: "Mar 16, '26" },
    { id: '5', name: 'Rent', icon: 'home-outline', color: '#6366F1', type: 'expense', createdAt: "Mar 16, '26" },
    { id: '6', name: 'Shopping', icon: 'cart-outline', color: '#EC4899', type: 'expense', createdAt: "Mar 16, '26" },
  ]);

  const addCategory = (newCat: Omit<Category, 'id' | 'createdAt'>) => {
    const d = new Date();
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", '" + d.getFullYear().toString().slice(-2);
    
    const category: Category = {
      ...newCat,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: formattedDate,
    };
    setCategories(prev => [category, ...prev]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, updateCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
