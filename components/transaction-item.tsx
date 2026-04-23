import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../constants/typography';
import { useThemeStore } from '../store/themeStore';
import { Transaction } from '../store/transactionStore';

interface TransactionItemProps {
  item: Transaction;
  last?: boolean;
  budgetName?: string;
}

export function TransactionItem({ item, last, budgetName }: TransactionItemProps) {
  const isIncome = item.type === 'income';
  const { isDark, colors } = useThemeStore();
  const router = useRouter();
  
  const isFromNotification = item.categoryName === 'From Notifications';
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => router.push({
        pathname: '/add-transaction',
        params: { editId: item.id }
      })}
    >
      <View style={s.txRow}>
        <View style={[s.txIconOuter, { backgroundColor: colors.surface, borderColor: isDark ? '#1C1C1E' : '#f8f8f8' }]}>
          <View style={[s.txIconBox, { 
            backgroundColor: isFromNotification ? '#FACC1520' : (item.categoryColor.length > 7 ? item.categoryColor.slice(0, 7) : item.categoryColor) + '12', 
            borderColor: isFromNotification ? '#FACC1540' : (isDark 
              ? (item.categoryColor.length > 7 ? item.categoryColor.slice(0, 7) : item.categoryColor) + '30' 
              : (item.categoryColor.length > 7 ? item.categoryColor.slice(0, 7) : item.categoryColor) + '20')
          }]}>
            <Ionicons name={item.categoryIcon as any} size={15} color={isFromNotification ? '#F59E0B' : item.categoryColor} />
          </View>

        </View>
        <View style={s.txText}>
          <Text style={[typography.txTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={s.subRow}>
            {isFromNotification && <Ionicons name="alert-circle" size={12} color="#F59E0B" style={{ marginRight: -2 }} />}
            <Text style={[typography.txSubtitle, { color: colors.textSecondary, fontFamily: isFromNotification ? 'Inter_600SemiBold' : 'Inter_400Regular' }]} numberOfLines={1}>
              {isFromNotification ? 'Uncategorized' : item.categoryName} · {item.time}
            </Text>

            {budgetName && (
              <View style={[s.budgetBadge, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                <Ionicons name="wallet-outline" size={10} color={colors.textSecondary} />
                <Text style={[s.budgetText, { color: colors.textSecondary }]}>{budgetName}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={s.txAmountCol}>
           <Text style={[isIncome ? typography.amountPositive : typography.amountNegative, { color: (isFromNotification || !isIncome) ? colors.red : colors.green }]}>
            {isIncome ? '+' : '−'}Rs {(Number(item.amount) || 0).toLocaleString()}
          </Text>
        </View>
      </View>
      {!last && <View style={[s.txSeparator, { backgroundColor: colors.separator }]} />}
    </TouchableOpacity>
  );
}



const s = StyleSheet.create({
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  txIconOuter: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, padding: 1, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  txIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1.3, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  txText: { flex: 1, marginRight: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  budgetBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  budgetText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  txAmountCol: { alignItems: 'flex-end' },
  txSeparator: { height: StyleSheet.hairlineWidth, marginLeft: 40 + 10 },
});


