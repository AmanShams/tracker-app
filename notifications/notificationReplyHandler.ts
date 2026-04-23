import { parseExpenseInput } from '../utils/parseExpenseInput';
import { saveExpense } from '../storage/saveExpense';
import { Platform } from 'react-native';

export const handleExpenseReply = async (event: any) => {
  try {
    let type, detail;

    if (Platform.OS === 'web') {
      // Mocked event structure for web testing
      type = event.type;
      detail = event.detail;
    } else {
      const { EventType } = require('@notifee/react-native');
      type = event.type;
      detail = event.detail;
      
      // Only process if it's a press or action reply
      if (!(type === EventType.PRESS || (detail?.input && type === EventType.ACTION_PRESS && detail.pressAction?.id === 'reply'))) {
        return;
      }
    }

    const input = detail?.input;
    const categoryId = detail?.notification?.data?.categoryId as string | undefined;

    if (input) {
      const parsedExpense = parseExpenseInput(input);
      if (parsedExpense) {
        if (categoryId) parsedExpense.categoryId = categoryId;
        await saveExpense(parsedExpense);


        // Feedback / Confirmation
        if (Platform.OS === 'web') {
           // Success handled in Profile.tsx
        } else {
           const notifee = require('@notifee/react-native').default;
           await notifee.displayNotification({
             title: 'Expense Saved',
             body: `${parsedExpense.name}: Rs ${parsedExpense.amount.toLocaleString()} added to Uncategorized.`,
             android: {
               channelId: 'expense-reminders',
               pressAction: { id: 'default' },
             },
           });
        }
      } else {
        // Error Feedback
        if (Platform.OS !== 'web') {
           const notifee = require('@notifee/react-native').default;
           await notifee.displayNotification({
             title: 'Error: Invalid Input',
             body: `Could not find a valid amount in "${input}". Please try again.`,
             android: {
               channelId: 'expense-reminders',
               pressAction: { id: 'default' },
             },
           });

        }
      }
    }


  } catch (e) {
    console.warn('handleExpenseReply failed:', e);
  }
};
