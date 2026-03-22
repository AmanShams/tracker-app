import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
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
import { useBudgets, Budget } from '../store/budgetStore';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  darkText: '#111111',
  mutedText: '#8E8E93',
  border: '#E5E5EA',
  primary: '#000000',
};

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: 'income' | 'expense', category?: string, budgetId?: string }>();
  
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const { budgets, updateBudgetSpent } = useBudgets();

  const [isBudgetLinked, setIsBudgetLinked] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase());

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

  const isSpentForm = params.type === 'expense' || isReadOnlyMode;
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
    <SafeAreaView style={s.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <FormHeader title={title} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Name */}
        <View style={s.field}>
          <Text style={s.label}>Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Spending details" placeholderTextColor={C.mutedText} />
        </View>

        {/* Amount */}
        <View style={s.field}>
          <Text style={s.label}>Amount</Text>
          <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} placeholder="Rs 0.00" placeholderTextColor={C.mutedText} keyboardType="numeric" autoFocus={isReadOnlyMode} />
        </View>

        {/* Category Selection */}
        <View style={s.field}>
          <Text style={s.label}>Category {isReadOnlyMode && ' (Fixed)'}</Text>
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
                  style={[s.catChip, isActive && { backgroundColor: cat.color + '15', borderColor: cat.color }, isReadOnlyMode && s.readOnlyChip]}
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

        {/* Link to Budget Section (Conditional) */}
        {showLinkSection ? (
          <View style={[s.linkSection, isReadOnlyMode && s.readOnlySection]}>
             <View style={s.linkHeader}>
                <View style={s.linkTextCol}>
                   <Text style={s.linkTitle}>Link to Budget {isReadOnlyMode && ' (Enabled)'}</Text>
                   <Text style={s.linkSubtitle}>Deduct from allocated budget</Text>
                </View>
                <Switch 
                  value={isBudgetLinked} 
                  onValueChange={setIsBudgetLinked}
                  disabled={isReadOnlyMode}
                  trackColor={{ false: '#ECECEF', true: '#111' }}
                  thumbColor={'#FFFFFF'}
                />
             </View>

             {isBudgetLinked && availableBudgets.length > 0 && (
               <View style={s.budgetPicker}>
                  <Text style={s.miniLabel}>Linked Budget {isReadOnlyMode && ' (Locked)'}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.budgetChips}>
                     {availableBudgets.map(b => {
                       const isActive = selectedBudgetId === b.id;
                       if (isReadOnlyMode && !isActive) return null; // Show only selected one in readOnly
                       return (
                         <TouchableOpacity 
                           key={b.id} 
                           disabled={isReadOnlyMode}
                           onPress={() => setSelectedBudgetId(b.id)}
                           style={[s.budgetChip, isActive && s.budgetChipActive, isReadOnlyMode && s.readOnlyChip]}
                         >
                           <View style={[s.budIcon, { backgroundColor: b.color }]}>
                              <Ionicons name={b.icon as any} size={10} color="#FFF" />
                           </View>
                           <Text style={[s.budChipText, isActive && s.budChipTextActive]}>{b.name}</Text>
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
          <View style={[s.field, { flex: 1, marginRight: SPACE.sm }]}>
            <Text style={s.label}>Date</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholderTextColor={C.mutedText} />
          </View>
          <View style={[s.field, { flex: 1, marginLeft: SPACE.sm }]}>
            <Text style={s.label}>Time</Text>
            <TextInput style={s.input} value={time} onChangeText={setTime} placeholderTextColor={C.mutedText} />
          </View>
        </View>

        {/* Notes */}
        <View style={s.field}>
          <Text style={s.label}>Other Notes</Text>
          <TextInput style={s.textArea} value={notes} onChangeText={setNotes} placeholder="Additional details..." placeholderTextColor={C.mutedText} multiline />
        </View>

      </ScrollView>

      {/* Save Button */}
      <View style={s.bottomContainer}>
        <TouchableOpacity activeOpacity={0.8} style={[s.saveBtn, (!name || !amount || !selectedCategory) && { opacity: 0.5 }]} onPress={handleSave} disabled={!name || !amount || !selectedCategory}>
          <Text style={s.saveBtnText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.surface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  field: { marginBottom: 15, borderBottomWidth: 1.2, borderBottomColor: '#F2F2F7', paddingBottom: 6 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#999', marginBottom: 6 },
  input: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#111', paddingVertical: 10, letterSpacing: -0.2 },
  amountInput: { fontFamily: 'Inter_700Bold', fontSize: 32, color: '#111', paddingVertical: 14, letterSpacing: -1 },
  textArea: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#111', minHeight: 60, paddingVertical: 8 },
  
  categoryScroll: { paddingVertical: 8, gap: 10 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: 'transparent' },
  readOnlyChip: { opacity: 0.9, backgroundColor: '#FFFFFF', borderColor: '#F2F2F7' },
  catIcon: { width: 22, height: 22, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  catText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#666' },

  linkSection: { backgroundColor: '#F9F9FB', borderRadius: 20, padding: 18, marginVertical: 10, borderWidth: 1, borderColor: '#EDEEF2' },
  readOnlySection: { opacity: 1, borderColor: '#F2F2F7', backgroundColor: '#F8F8FA' },
  linkHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkTextCol: { flex: 1, paddingRight: 10 },
  linkTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#111' },
  linkSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#999', marginTop: 2 },
  
  budgetPicker: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  miniLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#999', textTransform: 'uppercase', marginBottom: 10 },
  budgetChips: { gap: 8 },
  budgetChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  budgetChipActive: { borderColor: '#111', backgroundColor: '#F2F2F7' },
  budIcon: { width: 18, height: 18, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  budChipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#666' },
  budChipTextActive: { color: '#000', fontFamily: 'Inter_600SemiBold' },
  
  row: { flexDirection: 'row', marginBottom: 8 },
  bottomContainer: { position: 'absolute', bottom: Platform.OS === 'android' ? 20 : 30, left: 20, right: 20 },
  saveBtn: { backgroundColor: '#000', borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' },
});
