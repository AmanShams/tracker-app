import { Platform } from 'react-native';

export const scheduleExpenseNotification = async (time: { hour: number; minute: number }) => {
  if (Platform.OS === 'web') return;

  try {
    const notifee = require('@notifee/react-native').default;
    const { TriggerType, RepeatFrequency, AndroidImportance } = require('@notifee/react-native');

    // Create a channel (Android requirement)
    const channelId = await notifee.createChannel({
      id: 'expense-reminders',
      name: 'Expense Reminders',
      importance: AndroidImportance.HIGH,
    });

    // Schedule local notification
    const date = new Date(Date.now());
    date.setHours(time.hour);
    date.setMinutes(time.minute);
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
        title: 'Add Expense',
        body: 'Type: name amount category notes',
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          actions: [
            {
              title: 'Send',
              pressAction: {
                id: 'reply',
              },
              input: {
                placeholder: 'Ali 500 food lunch...',
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
