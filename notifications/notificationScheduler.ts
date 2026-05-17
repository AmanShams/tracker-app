import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Reminder } from '../store/reminderStore';

export const syncNotifications = async (reminders: Reminder[]) => {
  const isExpoGo = Constants.appOwnership === 'expo';
  if (Platform.OS === 'web' || isExpoGo) return;

  try {
    const notifee = require('@notifee/react-native').default;
    const { TriggerType, RepeatFrequency, AndroidImportance } = require('@notifee/react-native');

    // Request permissions (Android 13+)
    await notifee.requestPermission();

    // Create channel for daily reminders
    const channelId = await notifee.createChannel({
      id: 'expense-reminders',
      name: 'Expense Reminders',
      importance: AndroidImportance.HIGH,
    });

    // Create channel for summaries
    const summaryChannelId = await notifee.createChannel({
      id: 'weekly-summaries',
      name: 'Weekly Summaries',
      importance: AndroidImportance.HIGH,
    });

    for (const reminder of reminders) {
      if (!reminder.isEnabled) {
        // Cancel the scheduled notification trigger
        await notifee.cancelNotification(reminder.id);
        continue;
      }

      // Calculate scheduled trigger date
      const date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);

      let repeatFreq = RepeatFrequency.DAILY;

      if (reminder.frequency === 'daily') {
        date.setHours(reminder.hour, reminder.minute, 0, 0);
        if (date.getTime() <= Date.now()) {
          date.setDate(date.getDate() + 1);
        }
        repeatFreq = RepeatFrequency.DAILY;
      } else if (reminder.frequency === 'weekly') {
        const targetDay = (reminder.days && reminder.days.length > 0) ? reminder.days[0] : 0; // Default to Sunday (0)
        const currentDay = date.getDay();
        let daysToAdd = (targetDay - currentDay + 7) % 7;
        
        date.setHours(reminder.hour, reminder.minute, 0, 0);
        if (daysToAdd === 0 && date.getTime() <= Date.now()) {
          daysToAdd = 7;
        }
        date.setDate(date.getDate() + daysToAdd);
        repeatFreq = RepeatFrequency.WEEKLY;
      } else if (reminder.frequency === 'monthly') {
        const targetDate = reminder.dateOfMonth || 1;
        date.setDate(targetDate);
        date.setHours(reminder.hour, reminder.minute, 0, 0);
        if (date.getTime() <= Date.now()) {
          date.setMonth(date.getMonth() + 1);
        }
        repeatFreq = RepeatFrequency.MONTHLY;
      }

      const trigger: any = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      };

      if (reminder.isRecurring) {
        trigger.repeatFrequency = repeatFreq;
      }

      // Configure content depending on type
      let title = 'Quick Add Expense';
      let body = 'Type: Name Amount (e.g. Lunch 500)';
      let targetChannel = channelId;
      let actions = undefined;

      if (reminder.type === 'weekly_summary') {
        title = 'Weekly Summary';
        body = 'Your weekly financial report is ready. Tap to view your progress.';
        targetChannel = summaryChannelId;
      } else if (reminder.type === 'monthly_summary') {
        title = 'Monthly Summary';
        body = 'Your monthly financial report is ready. Tap to view your progress.';
        targetChannel = summaryChannelId;
      } else {
        // Generic daily quick add reminder has action inputs
        actions = [
          {
            title: 'Add',
            pressAction: {
              id: 'reply',
            },
            input: {
              placeholder: 'e.g. Pizza 500',
              allowFreeFormInput: true,
            },
          },
        ];
      }

      await notifee.createTriggerNotification(
        {
          id: reminder.id,
          title,
          body,
          data: {
            categoryId: reminder.categoryId || '',
          },
          android: {
            channelId: targetChannel,
            importance: AndroidImportance.HIGH,
            actions,
          },
        },
        trigger,
      );
    }
  } catch (e) {
    console.warn('syncNotifications failed:', e);
  }
};
