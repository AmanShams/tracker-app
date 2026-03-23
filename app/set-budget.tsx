import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { FormHeader } from '../components/form-header';
import { useBudgets } from '../store/budgetStore';
import { Category, useCategories } from '../store/categoryStore';
import { useTransactions } from '../store/transactionStore';
import { useThemeStore } from '../store/themeStore';

export default function SetBudgetScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { addBudget, updateBudget, budgets } = useBudgets();
  const { categories } = useCategories();
  const { balance } = useTransactions();
  const { isDark, colors } = useThemeStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const numAmount = parseFloat(amount || '0');
  const isOverBalance = !isNaN(numAmount) && amount !== '' && numAmount > (editId ? 999999 : balance);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (editId) {
      const budget = budgets.find(b => b.id === editId);
      if (budget) {
        setName(budget.name);
        setAmount(budget.amount.toString());
        const cat = categories.find(c => c.name === budget.linkedCategoryName);
        if (cat) setSelectedCategory(cat);
      }
    }
  }, [editId, budgets, categories]);

  const handleSave = () => {
    if (!name || !amount || !selectedCategory) return;
    const numAmountValue = parseFloat(amount);
    
    if (editId) {
      const oldB = budgets.find(b => b.id === editId);
      updateBudget({
        id: editId,
        spent: oldB?.spent || 0,
        name: name || selectedCategory.name,
        amount: numAmountValue,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        bgColor: selectedCategory.color + '15',
        linkedCategoryName: selectedCategory.name
      });
    } else {
      // Check if balance is sufficient
      if (balance < numAmountValue) {
        Alert.alert(
          "Insufficient Balance", 
          `Your total balance (Rs ${balance.toLocaleString()}) is less than the requested budget amount.`,
          [{ text: "OK" }]
        );
        return;
      }

      addBudget({
        name: name || selectedCategory.name,
        amount: numAmountValue,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        bgColor: selectedCategory.color + '15',
        linkedCategoryName: selectedCategory.name
      });
    }
    router.back();
  };

  const title = editId ? 'Edit Budget' : 'Create Budget';
  const btnLabel = editId ? 'Update Budget' : 'Activate Budget';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <FormHeader title={title} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Minimal Underline Input for Budget Title */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Budget Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Monthly Food"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Minimal Underline Input for Amount */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Allocation Amount</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="Rs 0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={[styles.balanceInfo, { color: colors.textSecondary }]}>Available: Rs {balance.toLocaleString()}</Text>
              {isOverBalance && (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning-outline" size={14} color={colors.red} style={{ marginRight: 4 }} />
                  <Text style={[styles.warningText, { color: colors.red }]}>Exceeds total balance</Text>
                </View>
              )}
            </View>

            {/* Category selection */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Link to Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {expenseCategories.map((cat) => {
                  const isActive = selectedCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat);
                        if (!name) setName(cat.name + ' Budget');
                      }}
                      style={[styles.catChip, { backgroundColor: isDark ? colors.bg : '#F2F2F7' }, isActive && { backgroundColor: cat.color + '15', borderColor: cat.color }]}
                    >
                      <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                        <Ionicons name={cat.icon as any} size={12} color="#FFF" />
                      </View>
                      <Text style={[styles.catText, { color: colors.textSecondary }, isActive && { color: cat.color, fontFamily: 'Inter_600SemiBold' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn, 
                { backgroundColor: colors.primary }, 
                (!name || !amount || !selectedCategory || isOverBalance) && { opacity: 0.5 }
              ]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!name || !amount || !selectedCategory || isOverBalance}
            >
              <Text style={[styles.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>{btnLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 60 },
  form: { gap: 8 },
  field: { width: '100%', marginBottom: 12, borderBottomWidth: 1, paddingBottom: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 4 },
  input: { fontSize: 16, fontFamily: 'Inter_600SemiBold', paddingVertical: 8, letterSpacing: -0.2 },
  amountInput: { fontSize: 32, fontFamily: 'Inter_700Bold', paddingVertical: 10, letterSpacing: -1 },
  balanceInfo: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  warningContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  warningText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  
  categoryScroll: { paddingVertical: 4, gap: 10 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  catIcon: { width: 20, height: 20, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  catText: { fontFamily: 'Inter_400Regular', fontSize: 14 },

  saveBtn: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
