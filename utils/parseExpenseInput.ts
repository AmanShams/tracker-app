Fimport dayjs from 'dayjs';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  categoryId?: string;
  notes: string;
  date: string;
  time: string;
  createdAt: number;
}

export const parseExpenseInput = (text: string): Expense | null => {
  if (!text || text.trim().length === 0) return null;

  const parts = text.trim().split(/\s+/);

  // Requirement: Only two parameters (Name and Amount)
  // Format: "Lunch 500"

  if (parts.length < 2) return null;

  // Robust Parsing: Try to find a number anywhere if the direct ends fail
  const amountPart = parts.find(p => !isNaN(Number(p)));
  const amountIdx = parts.findIndex(p => p === amountPart);

  if (amountPart && amountIdx !== -1) {
    amountStr = amountPart;
    // Everything else is the name
    name = parts.filter((_, i) => i !== amountIdx).join(' ');
  } else {
    // Last resort: Regex to find the first number in the entire text
    const match = text.match(/(\d+(\.\d+)?)/);
    if (match) {
      amountStr = match[0];
      name = text.replace(amountStr, '').trim();
    } else {
      return null;
    }
  }


  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  const now = dayjs();

  return {
    id: Math.random().toString(36).substring(2, 9),
    name: name || 'Untitled',
    amount,
    category: 'From Notifications', // Fixed category as requested
    notes: '',
    date: now.format('MMM DD, YYYY'),
    time: now.format('h:mm a'),
    createdAt: now.valueOf(),
  };
};

