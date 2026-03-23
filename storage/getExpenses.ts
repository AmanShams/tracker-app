import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../store/transactionStore';

const STORAGE_KEY = 'transactions_data';

export const getAllExpenses = async (): Promise<Transaction[]> => {
  try {
    const expensesStr = await AsyncStorage.getItem(STORAGE_KEY);
    return expensesStr ? JSON.parse(expensesStr) : [];
  } catch (error) {
    console.error('Error fetching expenses from storage:', error);
    return [];
  }
};
