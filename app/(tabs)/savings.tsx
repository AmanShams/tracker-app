import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { typography } from '@/constants/typography';
import { ConfirmModal } from '../../components/confirm-modal';
import { MainHeader } from '../../components/main-header';
import { useBudgets } from '../../store/budgetStore';
import { useThemeStore } from '../../store/themeStore';
import { useTransactions } from '../../store/transactionStore';

export default function SavingsScreen() {
  const router = useRouter();
  const { budgets, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { isDark, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const totalAllocated = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets]);
  const totalRemaining = totalAllocated - totalSpent;

  // Formatting helpers
  const splitAmount = (amt: number) => {
    const s = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const [whole, dec] = s.split('.');
    return { whole, dec };
  };

  const rem = splitAmount(totalRemaining);
  const spent = splitAmount(totalSpent);

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 1. Header (FIXED) */}
      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader
              actions={[{ icon: 'settings-outline' }]}
            />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Budgets</Text>
              <TouchableOpacity
                // style={[s.addBtnHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]}
                activeOpacity={0.7}
                onPress={() => router.push('/set-budget')}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* 2. Scrolling Content */}
      <ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Summary Statistics */}
        <View style={s.summaryContainerSmall}>
          <View style={s.statBoxCompact}>
            <Text style={s.statLabelSmall}>Remaining</Text>
            <View style={s.statValueLine}>
              <Text style={[s.statInt, { color: colors.text }]}>{rem.whole}</Text>
              <Text style={[s.statDec, { color: colors.textTertiary }]}>{rem.dec}</Text>
            </View>
          </View>
          <View style={[s.vDivider, { backgroundColor: colors.separator }]} />
          <View style={s.statBoxCompact}>
            <Text style={s.statLabelSmall}>Total Spent</Text>
            <View style={s.statValueLine}>
              <Text style={[s.statInt, { color: colors.text }]}>{spent.whole}</Text>
              <Text style={[s.statDec, { color: colors.textTertiary }]}>{spent.dec}</Text>
            </View>
          </View>
        </View>

        {/* Budget List Body (Categories Style) */}
        <View style={s.listBodyCompact}>
          {budgets.map((item, i) => {
            const remainingPercent = Math.max(0, ((item.amount - item.spent) / item.amount) * 100);
            return (
              <View key={item.id}>
                <View style={s.listRow}>
                  {/* Vertical Progress indicator */}
                  <View style={s.vProgressContainer}>
                    <View style={[s.vProgressTrack, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                      <View
                        style={[
                          s.vProgressFill,
                          {
                            height: `${remainingPercent}%`,
                            backgroundColor: item.color
                          }
                        ]}
                      />
                    </View>
                  </View>

                  <View style={[s.iconWrapperCompact, { backgroundColor: colors.surface, borderColor: isDark ? '#1C1C1E' : '#f8f8f8' }]}>
                    <View style={[s.iconBoxCompact, { backgroundColor: item.color + '12', borderColor: isDark ? item.color + '40' : item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={15} color={item.color} />
                    </View>
                  </View>

                  <View style={s.textColContainer}>
                    <Text style={[typography.txTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[typography.txSubtitle, { marginTop: 1, color: colors.textSecondary }]} numberOfLines={1}>
                      Spent Rs {item.spent.toLocaleString()} of {item.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={s.actionRowCompact}>
                    <TouchableOpacity 
                      activeOpacity={0.7} 
                      style={s.actionBtnCompact}
                      onPress={() => router.push({
                        pathname: '/set-budget',
                        params: { editId: item.id }
                      })}
                    >
                      <Ionicons name="pencil-outline" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={s.actionBtnCompact} onPress={() => handleDeleteTrigger(item.id, item.name)}>
                      <Ionicons name="trash-outline" size={16} color={colors.red} />
                    </TouchableOpacity>
                  </View>
                </View>
                {i < budgets.length - 1 && <View style={[s.separatorAligned, { backgroundColor: colors.separator }]} />}
              </View>
            );
          })}

          {budgets.length === 0 && (
            <View style={s.emptyCenter}>
              <Ionicons name="wallet-outline" size={36} color={colors.textTertiary} />
              <Text style={[s.emptyTextSmall, { color: colors.textTertiary }]}>No active budgets</Text>
            </View>
          )}
        </View>

        <ConfirmModal
          visible={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteBudget(deleteId)}
          title="Delete Budget"
          message={`Remove "${deleteName}"? Linked transactions will be unlinked.`}
        />

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 20 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  // Summary Row (Identical to Home Balance style)
  summaryContainerSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, marginTop: 5 },
  vDivider: { width: 1, height: 50, marginHorizontal: 20 },
  statBoxCompact: { flex: 1 },
  statLabelSmall: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93', letterSpacing: -0.8, marginBottom: -5 },
  statValueLine: { flexDirection: 'row', alignItems: 'baseline' },
  statInt: { fontFamily: 'Inter_700Bold', fontSize: 44, fontWeight: '700', letterSpacing: -2, lineHeight: 52 },
  statDec: { fontFamily: 'Inter_400Regular', fontSize: 22, letterSpacing: -0.3, lineHeight: 52, marginLeft: 1 },

  // List (Categories Style)
  listBodyCompact: { paddingHorizontal: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  vProgressContainer: { width: 3, height: 36, marginRight: 12 },
  vProgressTrack: { flex: 1, borderRadius: 1.5, overflow: 'hidden', justifyContent: 'flex-end' },
  vProgressFill: { width: '100%', borderRadius: 1.5 },

  iconWrapperCompact: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, padding: 1, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  iconBoxCompact: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.3, justifyContent: 'center', alignItems: 'center' },
  textColContainer: { flex: 1, marginRight: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 4 },
  actionBtnCompact: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  separatorAligned: { height: StyleSheet.hairlineWidth, marginLeft: 3 + 12 + 44 + 12 }, // Aligned to vBar + margins + icon

  emptyCenter: { alignItems: 'center', paddingTop: 60 },
  emptyTextSmall: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 8 },
});
