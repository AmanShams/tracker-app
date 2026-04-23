import { Platform } from 'react-native';

export const scheduleExpenseNotification = async (reminder: { id: string, hour: number; minute: number, categoryId?: string }) => {
  if (Platform.OS === 'web') return;

  try {
    const notifee = require('@notifee/react-native').default;
    const { TriggerType, RepeatFrequency, AndroidImportance } = require('@notifee/react-native');

    // Request permissions (Android 13+)
    await notifee.requestPermission();

    // Create a channel (Android requirement)
    const channelId = await notifee.createChannel({
      id: 'expense-reminders',
      name: 'Expense Reminders',
      importance: AndroidImportance.HIGH,
    });

    // Schedule local notification
    const date = new Date(Date.now());
    date.setHours(reminder.hour);
    date.setMinutes(reminder.minute);
    date.setSeconds(0);

    // If the time has already passed for today, schedule it for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: reminder.id,
        title: 'Quick Add Expense',
        body: 'Type: Name Amount (e.g. Lunch 500)',
        data: {
          categoryId: reminder.categoryId,
        },
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          actions: [
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
          ],
        },
      },
      trigger,
    );
  } catch (e) {
    console.warn('scheduleExpenseNotification failed:', e);
  }
};
