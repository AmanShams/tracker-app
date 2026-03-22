import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BeltButton } from '../../components/belt-button';
import { CategoryType, useCategories } from '../../store/categoryStore';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');

  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <BeltButton
          label="Add"
          icon={<Ionicons name="add" size={18} color="#FFF" />}
          onPress={() => router.push('/create-category')}
        />
      </View>

      {/* Tabs Filter */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsBackground}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'income' && styles.tabActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <View style={styles.iconOuter}>
              <View style={[styles.iconInner, { backgroundColor: cat.color + '12' }]}>
                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categorySubtitle}>{cat.createdAt}</Text>
            </View>
            <View style={styles.actionGroup}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionBtn}
                onPress={() => {/* Navigate to edit or open modal */ }}
              >
                <Ionicons name="create-outline" size={18} color="#C7C7CC" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionBtn}
                onPress={() => deleteCategory(cat.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#000',
    letterSpacing: -0.5,
  },
  // Replaced by BeltButton styles
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabsBackground: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#000000',
    fontFamily: 'Inter_600SemiBold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  iconOuter: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F3',
    padding: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 14,
  },
  iconInner: {
    flex: 1,
    borderRadius: 15.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontFamily: 'Inter_700Bold', // Matches reference bold text
    fontSize: 16,
    color: '#000',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8E8E93',
    letterSpacing: -0.1,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#999999',
  },
});
