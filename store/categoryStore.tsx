import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'categories_data';

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
  isLoaded: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
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
  { id: '13', name: 'Family & Gifts', icon: 'people-outline', color: '#F43F5E', type: 'expense', createdAt: "Apr 19, '26" },
  { id: '14', name: 'Home', icon: 'home-outline', color: '#F59E0B', type: 'expense', createdAt: "Apr 19, '26" },
  { id: '15', name: 'Transfers & Repayments', icon: 'swap-horizontal-outline', color: '#0D9488', type: 'expense', createdAt: "Apr 19, '26" },
  { id: '16', name: 'My Self Specific', icon: 'sparkles-outline', color: '#EC4899', type: 'expense', createdAt: "Apr 19, '26" },
  { id: '17', name: 'Electronics & Gadgets', icon: 'headset-outline', color: '#6B7280', type: 'expense', createdAt: "Apr 19, '26" },
  { id: '18', name: 'Miscellaneous', icon: 'help-circle-outline', color: '#9CA3AF', type: 'expense', createdAt: "Apr 19, '26" },
  { id: 'notification-fixed', name: 'From Notifications', icon: 'notifications-outline', color: '#6366F1', type: 'expense', createdAt: "Apr 19, '26" },
];

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load categories from AsyncStorage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedCategories) {
          const parsed = JSON.parse(storedCategories);
          // Merge to ensure new categories exist
          const merged = [...parsed];
          DEFAULT_CATEGORIES.forEach(def => {
            if (!merged.some(c => c.name === def.name || c.id === def.id)) {
              merged.push(def);
            }
          });
          setCategories(merged);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCategories();
  }, []);

  // Save categories to AsyncStorage
  useEffect(() => {
    if (isLoaded) {
      const saveCategories = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        } catch (error) {
          console.error('Failed to save categories:', error);
        }
      };
      saveCategories();
    }
  }, [categories, isLoaded]);

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
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, updateCategory, isLoaded }}>
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
