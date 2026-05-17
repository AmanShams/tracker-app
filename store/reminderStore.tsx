import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncNotifications } from '../notifications/notificationScheduler';

const STORAGE_KEY = 'reminders_data_v2';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Reminder {
  id: string;
  title: string;
  hour: number;
  minute: number;
  frequency: Frequency;
  days: number[]; // 0-6
  dateOfMonth?: number; // 1-31
  isEnabled: boolean;
  isRecurring: boolean;
  type: 'generic' | 'weekly_summary' | 'monthly_summary';
  categoryId?: string;
}


interface ReminderContextType {
  reminders: Reminder[];
  updateReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  isLoaded: boolean;
}

const DEFAULT_REMINDERS: Reminder[] = [
  // 4 Generic Reminder Slots
  { id: 'g1', title: 'Reminder', hour: 20, minute: 0, frequency: 'daily', days: [1,2,3,4,5], isEnabled: true, isRecurring: true, type: 'generic' },
  { id: 'g2', title: 'Reminder', hour: 9, minute: 0, frequency: 'weekly', days: [0], isEnabled: false, isRecurring: true, type: 'generic' },
  { id: 'g3', title: 'Reminder', hour: 0, minute: 0, frequency: 'daily', days: [], isEnabled: false, isRecurring: false, type: 'generic' },
  { id: 'g4', title: 'Reminder', hour: 0, minute: 0, frequency: 'daily', days: [], isEnabled: false, isRecurring: false, type: 'generic' },
  // Summary Bars
  { id: 's1', title: 'Weekly Summary', hour: 9, minute: 0, frequency: 'weekly', days: [0], isEnabled: true, isRecurring: true, type: 'weekly_summary' },
  { id: 's2', title: 'Monthly Summary', hour: 10, minute: 0, frequency: 'monthly', dateOfMonth: 1, days: [], isEnabled: true, isRecurring: true, type: 'monthly_summary' },
];

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setReminders(JSON.parse(stored));
        } else {
          setReminders(DEFAULT_REMINDERS);
        }
      } catch (e) {
        setReminders(DEFAULT_REMINDERS);
      } finally {
        setIsLoaded(true);
      }
    };
    loadReminders();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
      syncNotifications(reminders);
    }
  }, [reminders, isLoaded]);

  const updateReminder = (updated: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  return (
    <ReminderContext.Provider value={{ reminders, updateReminder, toggleReminder, isLoaded }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (!context) throw new Error('useReminders must be used within a ReminderProvider');
  return context;
}
