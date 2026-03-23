import { parseExpenseInput } from '../utils/parseExpenseInput';
import { saveExpense } from '../storage/saveExpense';
import { Platform } from 'react-native';

export const handleExpenseReply = async (event: any) => {
  if (Platform.OS === 'web') return;

  try {
    const { EventType } = require('@notifee/react-native');
    const { type, detail } = event;

    if (type === EventType.PRESS || (detail?.input && type === EventType.ACTION_PRESS && detail.pressAction?.id === 'reply')) {
      const input = detail.input;

      if (input) {
        const parsedExpense = parseExpenseInput(input);
        if (parsedExpense) {
          await saveExpense(parsedExpense);
        }
      }
    }
  } catch (e) {
    console.warn('handleExpenseReply failed:', e);
  }
};
