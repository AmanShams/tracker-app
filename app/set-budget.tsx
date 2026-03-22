import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  const { addBudget } = useBudgets();
  const { categories } = useCategories();
  const { balance } = useTransactions();
  const { isDark, colors } = useThemeStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSave = () => {
    if (!name || !amount || !selectedCategory) return;
    const numAmount = parseFloat(amount);
    
    // Check if balance is sufficient
    if (balance < numAmount) {
      Alert.alert(
        "Insufficient Balance", 
        `Your total balance (Rs ${balance.toLocaleString()}) is less than the requested budget amount.`,
        [{ text: "OK" }]
      );
      return;
    }

    addBudget({
      name: name || selectedCategory.name,
      amount: numAmount,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      bgColor: selectedCategory.color + '15',
      linkedCategoryName: selectedCategory.name
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <FormHeader title="Create Budget" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Minimal Underline Input for Budget Title */}
            <View style={[styles.field, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Budget Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Monthly Food"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Minimal Underline Input for Amount */}
            <View style={[styles.field, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Allocation Amount</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Rs 0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={[styles.balanceInfo, { color: colors.textSecondary }]}>Available: Rs {balance.toLocaleString()}</Text>
            </View>

            {/* Category selection */}
            <View style={[styles.field, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Link to Category</Text>
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
              style={[styles.saveBtn, { backgroundColor: colors.primary }, (!name || !amount || !selectedCategory) && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!name || !amount || !selectedCategory}
            >
              <Text style={[styles.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>Activate Budget</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 30 },
  form: { gap: 12 },
  field: { width: '100%', marginBottom: 12, borderBottomWidth: 1, paddingBottom: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 8 },
  input: { fontSize: 16, fontFamily: 'Inter_600SemiBold', paddingVertical: 10, letterSpacing: -0.2 },
  balanceInfo: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  
  categoryScroll: { paddingVertical: 8, gap: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  catIcon: { width: 20, height: 20, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  catText: { fontFamily: 'Inter_400Regular', fontSize: 14 },

  saveBtn: { height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
