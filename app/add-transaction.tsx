import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FormHeader } from '../components/form-header';

import { Category, useCategories } from '../store/categoryStore';
import { useTransactions } from '../store/transactionStore';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  darkText: '#111111',
  mutedText: '#8E8E93',
  border: '#E5E5EA',
  primary: '#3A3A3D', // For Save button
};

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };

export default function AddTransactionScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: 'income' | 'expense' }>();
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const [isDebtEnabled, setIsDebtEnabled] = useState(false);

  // Filter categories based on transaction type if provided
  const filteredCategories = useMemo(() => {
    if (!type) return categories;
    return categories.filter(cat => cat.type === type);
  }, [categories, type]);

  // Set page title based on type parameter
  const title = type === 'income' ? 'Add Income' : type === 'expense' ? 'Add Expense' : 'Add Transaction';

  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  });

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name || !amount || !selectedCategory) return;

    addTransaction({
      name,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      amount: parseFloat(amount),
      type: selectedCategory.type,
      date,
      time,
      notes,
    });

    router.back();
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header - Changed based on type */}
      <FormHeader title={title} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Name */}
        <View style={s.field}>
          <Text style={s.label}>Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="My Transaction" placeholderTextColor={C.mutedText} />
        </View>

        {/* Amount */}
        <View style={s.field}>
          <Text style={s.label}>Amount</Text>
          <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} placeholder="Rs 0.00" placeholderTextColor={C.mutedText} keyboardType="numeric" />
        </View>

        {/* Category */}
        <View style={s.field}>
          <Text style={s.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryScroll}>
            {filteredCategories.map((cat) => {
              const isActive = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  style={[s.catChip, isActive && { backgroundColor: cat.color + '15', borderColor: cat.color }]}
                >
                  <View style={[s.catIcon, { backgroundColor: cat.color }]}>
                    <Ionicons name={cat.icon as any} size={12} color="#FFF" />
                  </View>
                  <Text style={[s.catText, isActive && { color: cat.color, fontFamily: 'Inter_600SemiBold' }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date & Time Row */}
        <View style={s.row}>
          <View style={[s.field, { flex: 1, marginRight: SPACE.sm }]}>
            <Text style={s.label}>Date</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholderTextColor={C.mutedText} />
          </View>
          <View style={[s.field, { flex: 1, marginLeft: SPACE.sm }]}>
            <Text style={s.label}>Time</Text>
            <TextInput style={s.input} value={time} onChangeText={setTime} placeholderTextColor={C.mutedText} />
          </View>
        </View>

        {/* Wallet Selection */}
        {/* <View style={s.walletSection}>
          <Text style={s.sectionTitle}>Wallet</Text>
          <View style={s.walletCard}>
            <View style={s.walletCardContent}>
              <Ionicons name="card-outline" size={20} color="#FFF" style={s.walletIcon} />
              <View>
                <Text style={s.walletTitle}>Personal</Text>
                <Text style={s.walletAmount}>Rs 83,457.00</Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Other Notes */}
        <View style={s.field}>
          <Text style={s.label}>Other Notes</Text>
          <TextInput
            style={s.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Insert your additional notes here"
            placeholderTextColor={C.mutedText}
            multiline
          />
        </View>

        {/* Additional Options */}
        <View style={s.additionalSection}>
          <Text style={s.sectionTitle}>Additional Options</Text>
          <View style={s.toggleRow}>
            <View style={s.toggleTextCol}>
              <Text style={s.toggleTitle}>Link to a Debt</Text>
              <Text style={s.toggleSubtitle}>Record transaction as a payment or borrowing</Text>
            </View>
            <Switch
              value={isDebtEnabled}
              onValueChange={setIsDebtEnabled}
              trackColor={{ false: '#E8E8ED', true: '#111' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

      </ScrollView>

      {/* Save Button */}
      <View style={s.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[s.saveBtn, (!name || !amount || !selectedCategory) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!name || !amount || !selectedCategory}
        >
          <Text style={s.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg, // Restored to home page background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // space for save button
  },

  // Header styles removed in favor of FormHeader component
  backBtn: {
    // ... preserved if needed elsewhere
  },

  // ── Layout ──
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  field: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 2,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#999999',
    marginBottom: 4,
  },
  input: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#111111',
    paddingVertical: 8,
    letterSpacing: -0.2,
  },
  categoryScroll: {
    paddingVertical: 8,
    gap: 12,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  catText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
  amountInput: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#111111',
    paddingVertical: 12,
    letterSpacing: -0.5,
  },
  textArea: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#111111',
    minHeight: 60,
    paddingVertical: 8,
  },

  // ── Sections ──
  sectionTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  walletSection: {
    marginBottom: 12,
    marginTop: 4,
  },
  walletCard: {
    backgroundColor: '#5A4ED8', // Rich vivid purple
    borderRadius: 16,
    padding: 16,
    width: 150,
  },
  walletCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    marginRight: SPACE.sm,
  },
  walletTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  walletAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  additionalSection: {
    marginBottom: 32,
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#111111',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  toggleSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },

  // ── Save Button ──
  bottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 20 : 30,
    left: 20,
    right: 20,
  },
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
