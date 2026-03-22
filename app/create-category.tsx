import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
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
import { useCategories, CategoryType } from '../store/categoryStore';

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#06B6D4'
];

const PRESET_ICONS = [
  'cash-outline', 'laptop-outline', 'fast-food-outline', 'bus-outline', 
  'home-outline', 'cart-outline', 'heart-outline', 'gift-outline',
  'school-outline', 'medical-outline', 'fitness-outline', 'game-controller-outline'
];

export default function CreateCategoryScreen() {
  const router = useRouter();
  const { addCategory } = useCategories();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleSave = () => {
    if (!name) return;
    addCategory({
      name,
      icon: selectedIcon,
      color: selectedColor,
      type,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <FormHeader title="create-category" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Type Selector */}
            <View style={styles.typeToggleRow}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]} 
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]} 
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>Income</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Health"
                placeholderTextColor="#C7C7CC"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Icon</Text>
              <View style={styles.grid}>
                {PRESET_ICONS.map((icon) => (
                  <TouchableOpacity 
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconBtn,
                      selectedIcon === icon && { backgroundColor: '#F2F2F7' }
                    ]}
                  >
                    <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? '#000' : '#8E8E93'} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCircleSelected
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Create Category</Text>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  form: {
    gap: 24,
  },
  typeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  typeBtnTextActive: {
    color: '#000000',
    fontFamily: 'Inter_600SemiBold',
  },
  field: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 4,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
