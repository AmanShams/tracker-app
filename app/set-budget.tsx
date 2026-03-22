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
  View
} from 'react-native';
import { FormHeader } from '../components/form-header';
import { useBudgets } from '../store/budgetStore';
import { Category, useCategories } from '../store/categoryStore';

const PRESET_COLORS = [
  { main: '#0EA5E9', bg: '#E8F5FA' }, // Blue
  { main: '#F59E0B', bg: '#FFF4E5' }, // Orange
  { main: '#10B981', bg: '#E8F5ED' }, // Green
  { main: '#7C6EEA', bg: '#F3EFFE' }, // Purple
  { main: '#EF4444', bg: '#FEF2F2' }, // Red
  { main: '#6366F1', bg: '#EEF2FF' }, // Indigo
];

const PRESET_ICONS = ['wifi', 'bus', 'cart', 'game-controller', 'fast-food', 'shirt', 'car', 'home'];

export default function SetBudgetScreen() {
  const router = useRouter();
  const { addBudget } = useBudgets();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSave = () => {
    if (!name || !amount || !selectedCategory) return;
    addBudget({
      name: name || selectedCategory.name,
      amount: parseFloat(amount),
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      bgColor: selectedCategory.color + '15',
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <FormHeader title="set-budget" />

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
                placeholder="e.g. Groceries"
                placeholderTextColor="#C7C7CC"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Minimal Underline Input for Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Target Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Rs 0.00"
                placeholderTextColor="#C7C7CC"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
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
                        if (!name) setName(cat.name);
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
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  form: {
    gap: 12,
  },
  field: {
    width: '100%',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 2,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    paddingVertical: 10,
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
  iconSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtn: {
    backgroundColor: '#000000',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

