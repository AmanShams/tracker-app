import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { typography } from '../constants/typography';
import { useBudgets } from '../store/budgetStore';
import { useThemeStore } from '../store/themeStore';
import { useIsFocused } from '@react-navigation/native';
import { Transaction } from '../store/transactionStore';
import { TransactionItem } from './transaction-item';

const FILTERS = ['All', 'Expense', 'Income'];

interface TransactionListProps {
  transactions: Transaction[];
  showFilter?: boolean;
  limit?: number;
}

const AnimatedListItem = ({ children, index, isFocused }: { children: React.ReactNode, index: number, isFocused: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setIsReady(true);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 400, // snappier animation
        delay: index * 200, // long sequential stagger
        useNativeDriver: true,
      }).start();
    } else {
      setIsReady(false);
    }
  }, [index, isFocused]); 

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={{ opacity: isReady ? opacity : 0, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export function TransactionList({ transactions, showFilter = true, limit }: TransactionListProps) {
  const { colors } = useThemeStore();
  const { budgets } = useBudgets();
  const isFocused = useIsFocused();
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

  let globalIndex = 0;

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
        {sortedDates.map((date) => {
          const headerIndex = globalIndex++;
          return (
            <View key={date} style={s.dateGroup}>
              <AnimatedListItem index={headerIndex} isFocused={isFocused}>
                <View style={s.dateHeader}>
                  <Text style={[s.dateHeaderText, { color: colors.textSecondary }]}>{getRelativeDate(date)}</Text>
                  <View style={[s.headerLine, { backgroundColor: colors.separator }]} />
                </View>
              </AnimatedListItem>
              {grouped[date].map((item, i) => {
                const itemIndex = globalIndex++;
                return (
                  <AnimatedListItem key={item.id} index={itemIndex} isFocused={isFocused}>
                    <TransactionItem
                      item={item}
                      last={i === grouped[date].length - 1}
                      budgetName={item.budgetId ? budgets.find(b => b.id === item.budgetId)?.name : undefined}
                    />
                  </AnimatedListItem>
                );
              })}
            </View>
          );
        })}

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
