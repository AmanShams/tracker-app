import dayjs from 'dayjs';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes: string;
  date: string;
  time: string;
  createdAt: number;
}

export const parseExpenseInput = (text: string): Expense | null => {
  if (!text || text.trim().length === 0) return null;

  const parts = text.trim().split(/\s+/);
  let name = 'Unknown';
  let amountStr = '';
  let category = 'Other';
  let notes = '';

  // Edge case: "500 food"
  if (!isNaN(Number(parts[0]))) {
    amountStr = parts[0];
    category = parts[1] || 'Other';
    notes = parts.slice(2).join(' ');
  } else {
    name = parts[0];
    amountStr = parts[1];
    category = parts[2] || 'Other';
    notes = parts.slice(3).join(' ');
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return null; // Ignore and do not save if amount is invalid
  }

  const now = dayjs();

  return {
    id: Math.random().toString(36).substring(2, 9),
    name,
    amount,
    category,
    notes,
    date: now.format('MMM DD, YYYY'),
    time: now.format('h:mm a'),
    createdAt: now.valueOf(),
  };
};
