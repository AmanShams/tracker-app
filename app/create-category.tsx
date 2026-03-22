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
import { CategoryType, useCategories } from '../store/categoryStore';
import { useThemeStore } from '../store/themeStore';

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
  const { isDark, colors } = useThemeStore();

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
      createdAt: new Date().toISOString()
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <FormHeader title="Create Category" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Type Selector */}
            <View style={[styles.typeToggleRow, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'expense' && { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'income' && { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>Income</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Health"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Icon Picker */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Icon</Text>
              <View style={styles.grid}>
                {PRESET_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconBtn,
                      selectedIcon === icon && { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                    ]}
                  >
                    <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? colors.text : colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Picker */}
            <View style={[styles.field, { borderBottomColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && { borderWidth: 3, borderColor: colors.bg }
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text style={[styles.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>Create Category</Text>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  form: {
    gap: 6,
  },
  typeToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    marginBottom: 2,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  field: {
    width: '100%',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    paddingVertical: 10,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 4,
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
    gap: 4,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  saveBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
