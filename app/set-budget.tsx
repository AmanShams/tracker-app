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

export default function SetBudgetScreen() {
  const router = useRouter();
  const { addBudget } = useBudgets();
  const { categories } = useCategories();
  const { balance } = useTransactions();

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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <FormHeader title="Create Budget" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Minimal Underline Input for Budget Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Budget Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Monthly Food"
                placeholderTextColor="#C7C7CC"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Minimal Underline Input for Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Allocation Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Rs 0.00"
                placeholderTextColor="#C7C7CC"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={styles.balanceInfo}>Available: Rs {balance.toLocaleString()}</Text>
            </View>

            {/* Category selection */}
            <View style={styles.field}>
              <Text style={styles.label}>Link to Category</Text>
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
                      style={[styles.catChip, isActive && { backgroundColor: cat.color + '15', borderColor: cat.color }]}
                    >
                      <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                        <Ionicons name={cat.icon as any} size={12} color="#FFF" />
                      </View>
                      <Text style={[styles.catText, isActive && { color: cat.color, fontFamily: 'Inter_600SemiBold' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (!name || !amount || !selectedCategory) && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!name || !amount || !selectedCategory}
            >
              <Text style={styles.saveBtnText}>Activate Budget</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 30 },
  form: { gap: 12 },
  field: { width: '100%', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', paddingBottom: 4 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#999', marginBottom: 8 },
  input: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#000', paddingVertical: 10, letterSpacing: -0.2 },
  balanceInfo: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8E8E93', marginTop: 2 },
  
  categoryScroll: { paddingVertical: 8, gap: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: 'transparent' },
  catIcon: { width: 20, height: 20, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  catText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#666' },

  saveBtn: { backgroundColor: '#000000', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
