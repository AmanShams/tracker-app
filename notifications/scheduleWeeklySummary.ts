import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { Platform } from 'react-native';

const STORAGE_KEY = 'transactions_data';

export const scheduleWeeklySummary = async () => {
  if (Platform.OS === 'web') return;

  try {
    const notifee = require('@notifee/react-native').default;
    const { TriggerType, RepeatFrequency, AndroidImportance } = require('@notifee/react-native');

    const channelId = await notifee.createChannel({
      id: 'weekly-summaries',
      name: 'Weekly Summaries',
      importance: AndroidImportance.HIGH,
    });

    // Create a trigger that runs every Sunday at 9:00 AM
    const date = new Date();
    date.setDate(date.getDate() + (7 - date.getDay()) % 7); // Next Sunday
    date.setHours(9, 0, 0, 0);

    // If it's already Sunday past 9 AM, schedule for next Sunday
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 7);
    }

    const trigger: any = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.WEEKLY,
    };

    await notifee.createTriggerNotification(
      {
        title: 'Weekly Summary',
        body: 'Your weekly financial report is ready. Tap to view your progress.',
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
        },
      },
      trigger,
    );
  } catch (e) {
    console.warn('scheduleWeeklySummary failed:', e);
  }
};

export const generateWeeklySummaryMessage = async () => {
  try {
    const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedTransactions) return 'No spending recorded this week. Start tracking to see your summary!';

    const transactions = JSON.parse(storedTransactions);
    const now = dayjs();
    const startOfThisWeek = now.startOf('week');
    const startOfLastWeek = startOfThisWeek.subtract(1, 'week');

    let thisWeekSpent = 0;
    let lastWeekSpent = 0;

    transactions.forEach((tx: any) => {
      const txDate = dayjs(tx.date, ['YYYY-MM-DD', 'MMM D, YYYY', 'MMM DD, YYYY']);
      if (!txDate.isValid() || tx.type !== 'expense') return;

      if (txDate.isAfter(startOfThisWeek)) {
        thisWeekSpent += Number(tx.amount) || 0;
      } else if (txDate.isAfter(startOfLastWeek) && txDate.isBefore(startOfThisWeek)) {
        lastWeekSpent += Number(tx.amount) || 0;
      }
    });

    if (thisWeekSpent === 0 && lastWeekSpent === 0) {
      return 'No spending recorded this week. Keep up the good work!';
    }

    let comparisonMsg = '';
    if (lastWeekSpent > 0) {
      const diff = ((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 100;
      if (diff < 0) {
        comparisonMsg = ` That is ${Math.abs(diff).toFixed(0)}% less than last week. Great job.`;
      } else if (diff > 0) {
        comparisonMsg = ` That is ${diff.toFixed(0)}% more than last week. Try to save more next week.`;
      } else {
        comparisonMsg = ` You spent exactly the same as last week.`;
      }
    }

    return `Weekly Summary: You spent Rs ${thisWeekSpent.toLocaleString()} this week.${comparisonMsg}`;
  } catch (e) {
    return 'Weekly Summary: You spent Rs 0 this week.';
  }
};
