import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { typography } from '../constants/typography';
import { useThemeStore } from '../store/themeStore';
import { useTransactions, Transaction } from '../store/transactionStore';
import { useBudgets } from '../store/budgetStore';
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
        {displayList.map((item, i) => (
          <TransactionItem
            key={item.id}
            item={item}
            last={i === displayList.length - 1}
            budgetName={item.budgetId ? budgets.find(b => b.id === item.budgetId)?.name : undefined}
          />
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
});
