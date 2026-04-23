import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../store/transactionStore';
import { Expense } from '../utils/parseExpenseInput';

const STORAGE_KEY = 'transactions_data';
const BALANCE_KEY = 'balance_data';

// Helper to map typed category to valid app category details
export const getCategoryDetails = (cat?: string, catId?: string) => {
  // If we have a specific category ID, use that
  if (catId) {
     return { name: 'Linked Category', icon: 'link-outline', color: '#6366F1', id: catId };
  }

  if (!cat || cat.toLowerCase() === 'uncategorized' || cat.toLowerCase() === 'from notifications') {
    return { name: 'From Notifications', icon: 'notifications-outline', color: '#6366F1' }; // Indigo color
  }

  const categoryStr = cat.toLowerCase();

  if (categoryStr.includes('food') || categoryStr.includes('eat') || categoryStr.includes('lunch')) {
    return { name: 'Food & Dining', icon: 'fast-food-outline', color: '#F59E0B' };
  }

  if (categoryStr.includes('bill') || categoryStr.includes('utilit')) {
    return { name: 'Bills', icon: 'receipt-outline', color: '#3B82F6' };
  }
  if (cat.includes('transport') || cat.includes('fuel') || cat.includes('uber')) {
    return { name: 'Transport', icon: 'bus-outline', color: '#F59E0B' };
  }
  if (cat.includes('health') || cat.includes('med') || cat.includes('gym')) {
    return { name: 'Health', icon: 'medical-outline', color: '#10B981' };
  }
  if (cat.includes('shop') || cat.includes('buy')) {
    return { name: 'Shopping', icon: 'cart-outline', color: '#EC4899' };
  }
  if (cat.includes('charit')) {
    return { name: 'Charity', icon: 'heart-outline', color: '#EF4444' };
  }
  if (cat.includes('hygiene')) {
    return { name: 'Monthly Hygiene', icon: 'water-outline', color: '#EC4899' };
  }
  // Default fallback
  return { name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#9CA3AF' };
};

export const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const existingTransactionsStr = await AsyncStorage.getItem(STORAGE_KEY);
    const existingBalanceStr = await AsyncStorage.getItem(BALANCE_KEY);
    
    const transactions: Transaction[] = existingTransactionsStr ? JSON.parse(existingTransactionsStr) : [];
    const balance = existingBalanceStr ? Number(existingBalanceStr) : 0;
    
    const catDetails = getCategoryDetails(expense.category, expense.categoryId);
    
    // Convert Expense to Transaction
    const newTransaction: Transaction = {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      categoryName: catDetails.name,
      categoryIcon: catDetails.icon,
      categoryColor: catDetails.color,
      type: 'expense',
      date: expense.date,
      time: expense.time,
      notes: expense.notes,
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    const updatedBalance = balance - expense.amount;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    await AsyncStorage.setItem(BALANCE_KEY, updatedBalance.toString());
  } catch (error) {
    console.error('Error saving expense to storage:', error);
  }
};
