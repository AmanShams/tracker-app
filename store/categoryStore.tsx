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
    { id: '1', name: 'Salary', icon: 'cash-outline', color: '#10B981', type: 'income', createdAt: "Apr 19, '26" },
    { id: '2', name: 'Freelance', icon: 'laptop-outline', color: '#4c8ef8', type: 'income', createdAt: "Apr 19, '26" },
    { id: '3', name: 'Transport', icon: 'bus-outline', color: '#faa615', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '4', name: 'Rent', icon: 'home-outline', color: '#6366F1', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '5', name: 'Monthly Hygiene', icon: 'water-outline', color: '#976aff', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '6', name: 'Charity', icon: 'heart-outline', color: '#c665fe', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '7', name: 'Food & Dining', icon: 'fast-food-outline', color: '#faa615', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '8', name: 'Shopping', icon: 'cart-outline', color: '#7be0ad', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '9', name: 'Health', icon: 'medical-outline', color: '#ffd60a', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '10', name: 'Education', icon: 'school-outline', color: '#15d8fa', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '11', name: 'Entertainment', icon: 'game-controller-outline', color: '#c665fe', type: 'expense', createdAt: "Apr 19, '26" },
    { id: '12', name: 'Bills', icon: 'receipt-outline', color: '#4c8ef8', type: 'expense', createdAt: "Apr 19, '26" },
    { id: 'notification-fixed', name: 'From Notifications', icon: 'notifications-outline', color: '#6366F1', type: 'expense', createdAt: "Apr 19, '26" },
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
    if (id === 'notification-fixed') return; // Cannot delete this category
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
