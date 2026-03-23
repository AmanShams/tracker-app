import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '../constants/typography';
import { useBudgets } from '../store/budgetStore';
import { useThemeStore } from '../store/themeStore';
import { Transaction } from '../store/transactionStore';
import { TransactionItem } from './transaction-item';

const FILTERS = ['All', 'Expense', 'Income'];

interface TransactionListProps {
  transactions: Transaction[];
  showFilter?: boolean;
  limit?: number;
}

export function TransactionList({ transactions, showFilter = true, limit }: TransactionListProps) {
  const { colors } = useThemeStore();
  const { budgets } = useBudgets();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = transactions.filter(tx => {
    if (activeFilter === 'All') return true;
    return tx.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  // Group by date
  const grouped: { [key: string]: Transaction[] } = {};
  displayList.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getRelativeDate = (dateStr: string) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return dateStr;
  };

  return (
    <View style={s.container}>
      {showFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map((f) => {
            const isActive = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
                style={[
                  s.filterPill,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                  isActive && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
                ]}
              >
                <Text style={[isActive ? typography.filterActive : typography.filterInactive, { color: isActive ? colors.accent : colors.textSecondary }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={s.list}>
        {sortedDates.map((date) => (
          <View key={date} style={s.dateGroup}>
            <View style={s.dateHeader}>
              <Text style={[s.dateHeaderText, { color: colors.textSecondary }]}>{getRelativeDate(date)}</Text>
              <View style={[s.headerLine, { backgroundColor: colors.separator }]} />
            </View>
            {grouped[date].map((item, i) => (
              <TransactionItem
                key={item.id}
                item={item}
                last={i === grouped[date].length - 1}
                budgetName={item.budgetId ? budgets.find(b => b.id === item.budgetId)?.name : undefined}
              />
            ))}
          </View>
        ))}

        {displayList.length === 0 && (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', color: colors.textTertiary, fontSize: 14 }}>No transactions found</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { gap: 8, marginBottom: 16, alignItems: 'center', paddingHorizontal: 0 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  list: {},
  dateGroup: { marginBottom: 0 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  headerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 12,
  },
  dateHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: -0.3,
  },
});
