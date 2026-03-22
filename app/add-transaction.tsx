import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FormHeader } from '../components/form-header';

import { Category, useCategories } from '../store/categoryStore';
import { useTransactions } from '../store/transactionStore';
import { useBudgets, Budget } from '../store/budgetStore';
import { useThemeStore } from '../store/themeStore';

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: 'income' | 'expense', category?: string, budgetId?: string }>();
  
  const { categories } = useCategories();
  const { addTransaction, balance } = useTransactions();
  const { budgets, updateBudgetSpent } = useBudgets();
  const { isDark, colors } = useThemeStore();

  const [isBudgetLinked, setIsBudgetLinked] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase());

  const numAmount = parseFloat(amount || '0');
  const isSpent = (params.type === 'expense') || (selectedCategory?.type === 'expense');
  const isOverBalance = isSpent && !isNaN(numAmount) && amount !== '' && numAmount > balance;

  // 1. Initial State from Params (ReadOnly Logic)
  const isReadOnlyMode = !!params.budgetId;

  useEffect(() => {
    if (params.budgetId) {
       const budget = budgets.find(b => b.id === params.budgetId);
       if (budget) {
         setIsBudgetLinked(true);
         setSelectedBudgetId(budget.id);
         const cat = categories.find(c => c.name === budget.linkedCategoryName);
         if (cat) setSelectedCategory(cat);
       }
    } else if (params.category) {
       const cat = categories.find(c => c.name === params.category);
       if (cat) setSelectedCategory(cat);
    }
  }, [params.budgetId, params.category, categories, budgets]);

  // 2. Filter Category & Budgets
  const filteredCategories = useMemo(() => {
    if (!params.type && !isReadOnlyMode) return categories;
    if (isReadOnlyMode && selectedCategory) return [selectedCategory];
    const type = params.type || 'expense';
    return categories.filter(cat => cat.type === type);
  }, [categories, params.type, isReadOnlyMode, selectedCategory]);

  const availableBudgets = useMemo(() => {
    if (!selectedCategory) return [];
    return budgets.filter(b => b.linkedCategoryName === selectedCategory.name);
  }, [selectedCategory, budgets]);

  const isSpentForm = (params.type === 'expense' || isReadOnlyMode) || (selectedCategory?.type === 'expense');
  const showLinkSection = isSpentForm && selectedCategory && availableBudgets.length > 0;

  // 3. Auto-select budget logic
  useEffect(() => {
    if (isBudgetLinked && availableBudgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(availableBudgets[0].id);
    }
  }, [isBudgetLinked, availableBudgets, selectedBudgetId]);

  const handleSave = () => {
    if (!name || !amount || !selectedCategory) return;
    const numAmount = parseFloat(amount);
    
    addTransaction({
      name,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      amount: numAmount,
      type: selectedCategory.type,
      date,
      time,
      notes,
      budgetId: isBudgetLinked ? selectedBudgetId || undefined : undefined,
    });

    if (isBudgetLinked && selectedBudgetId) {
      updateBudgetSpent(selectedBudgetId, numAmount);
    }
    router.back();
  };

  const title = isReadOnlyMode ? 'Record Spending' : (params.type === 'income' ? 'Add Income' : 'Add Expense');

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <FormHeader title={title} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Name */}
        <View style={[s.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
          <Text style={[s.label, { color: colors.textSecondary }]}>Name</Text>
          <TextInput 
            style={[s.input, { color: colors.text }]} 
            value={name} 
            onChangeText={setName} 
            placeholder="Spending details" 
            placeholderTextColor={colors.textSecondary} 
          />
        </View>

        {/* Amount */}
          <View style={[s.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Amount</Text>
          <TextInput 
            style={[s.amountInput, { color: colors.text }]} 
            value={amount} 
            onChangeText={setAmount} 
            placeholder="Rs 0.00" 
            placeholderTextColor={colors.textSecondary} 
            keyboardType="numeric" 
            autoFocus={isReadOnlyMode} 
          />
          {isOverBalance && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="warning-outline" size={14} color={colors.red} style={{ marginRight: 4 }} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.red }}>Exceeds total balance (Rs {balance.toLocaleString()})</Text>
            </View>
          )}
        </View>

        {/* Category Selection */}
        <View style={[s.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
          <Text style={[s.label, { color: colors.textSecondary }]}>Category {isReadOnlyMode && ' (Fixed)'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryScroll}>
            {filteredCategories.map((cat) => {
              const isActive = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  disabled={isReadOnlyMode}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setIsBudgetLinked(false); 
                    setSelectedBudgetId(null);
                  }}
                  style={[s.catChip, { backgroundColor: isDark ? colors.bg : '#F2F2F7' }, isActive && { backgroundColor: cat.color + '15', borderColor: cat.color }, isReadOnlyMode && s.readOnlyChip]}
                >
                  <View style={[s.catIcon, { backgroundColor: cat.color }]}>
                    <Ionicons name={cat.icon as any} size={12} color="#FFF" />
                  </View>
                  <Text style={[s.catText, { color: colors.textSecondary }, isActive && { color: cat.color, fontFamily: 'Inter_600SemiBold' }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Link to Budget Section (Conditional) */}
        {showLinkSection ? (
          <View style={[s.linkSection, { backgroundColor: isDark ? '#1C1C1E' : '#F9F9FB', borderColor: isDark ? '#2C2C2E' : '#EDEEF2' }, isReadOnlyMode && s.readOnlySection, isReadOnlyMode && { backgroundColor: isDark ? '#1C1C1E' : '#F8F8FA' }]}>
             <View style={s.linkHeader}>
                <View style={s.linkTextCol}>
                   <Text style={[s.linkTitle, { color: colors.text }]}>Link to Budget {isReadOnlyMode && ' (Enabled)'}</Text>
                   <Text style={[s.linkSubtitle, { color: colors.textSecondary }]}>Deduct from allocated budget</Text>
                </View>
                <Switch 
                  value={isBudgetLinked} 
                  onValueChange={setIsBudgetLinked}
                  disabled={isReadOnlyMode}
                  trackColor={{ false: isDark ? '#2C2C2E' : '#ECECEF', true: colors.accent }}
                  thumbColor={'#FFFFFF'}
                />
             </View>

             {isBudgetLinked && availableBudgets.length > 0 && (
               <View style={[s.budgetPicker, { borderTopColor: colors.separator }]}>
                  <Text style={[s.miniLabel, { color: colors.textSecondary }]}>Linked Budget {isReadOnlyMode && ' (Locked)'}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.budgetChips}>
                     {availableBudgets.map(b => {
                       const isActive = selectedBudgetId === b.id;
                       if (isReadOnlyMode && !isActive) return null; // Show only selected one in readOnly
                       return (
                         <TouchableOpacity 
                           key={b.id} 
                           disabled={isReadOnlyMode}
                           onPress={() => setSelectedBudgetId(b.id)}
                           style={[s.budgetChip, { backgroundColor: isDark ? '#111' : '#FFF', borderColor: colors.separator }, isActive && { borderColor: colors.text, backgroundColor: colors.bg }, isReadOnlyMode && s.readOnlyChip]}
                         >
                           <View style={[s.budIcon, { backgroundColor: b.color }]}>
                              <Ionicons name={b.icon as any} size={10} color="#FFF" />
                           </View>
                           <Text style={[s.budChipText, { color: colors.textSecondary }, isActive && { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>{b.name}</Text>
                         </TouchableOpacity>
                       );
                     })}
                  </ScrollView>
               </View>
             )}
          </View>
        ) : null}

        {/* Date & Time Row */}
        <View style={s.row}>
          <View style={[s.field, { flex: 1, marginRight: SPACE.sm, borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Date</Text>
            <TextInput style={[s.input, { color: colors.text }]} value={date} onChangeText={setDate} placeholderTextColor={colors.textSecondary} />
          </View>
          <View style={[s.field, { flex: 1, marginLeft: SPACE.sm, borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Time</Text>
            <TextInput style={[s.input, { color: colors.text }]} value={time} onChangeText={setTime} placeholderTextColor={colors.textSecondary} />
          </View>
        </View>

        {/* Notes */}
        <View style={[s.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
          <Text style={[s.label, { color: colors.textSecondary }]}>Other Notes</Text>
          <TextInput 
            style={[s.textArea, { color: colors.text }]} 
            value={notes} 
            onChangeText={setNotes} 
            placeholder="Additional details..." 
            placeholderTextColor={colors.textSecondary} 
            multiline 
          />
        </View>

      </ScrollView>

      {/* Save Button */}
      <View style={s.bottomContainer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[
            s.saveBtn, 
            { backgroundColor: colors.primary }, 
            (!name || !amount || !selectedCategory || isOverBalance) && { opacity: 0.5 }
          ]} 
          onPress={handleSave} 
          disabled={!name || !amount || !selectedCategory || isOverBalance}
        >
          <Text style={[s.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 0 },
  field: { marginBottom: 8, borderBottomWidth: 1.2, paddingBottom: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 4 },
  input: { fontFamily: 'Inter_600SemiBold', fontSize: 16, paddingVertical: 8, letterSpacing: -0.2 },
  amountInput: { fontFamily: 'Inter_700Bold', fontSize: 32, paddingVertical: 10, letterSpacing: -1 },
  textArea: { fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 60, paddingVertical: 8 },
  
  categoryScroll: { paddingVertical: 4, gap: 6 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  readOnlyChip: { opacity: 0.9 },
  catIcon: { width: 22, height: 22, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  catText: { fontFamily: 'Inter_400Regular', fontSize: 14 },

  linkSection: { borderRadius: 16, padding: 12, marginVertical: 6, borderWidth: 1 },
  readOnlySection: { opacity: 1 },
  linkHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkTextCol: { flex: 1, paddingRight: 10 },
  linkTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  linkSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  
  budgetPicker: { marginTop: 10, borderTopWidth: 1, paddingTop: 10 },
  miniLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 },
  budgetChips: { gap: 6 },
  budgetChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  budIcon: { width: 18, height: 18, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  budChipText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  
  row: { flexDirection: 'row', marginBottom: 8 },
  bottomContainer: { position: 'absolute', bottom: Platform.OS === 'android' ? 20 : 30, left: 20, right: 20 },
  saveBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
