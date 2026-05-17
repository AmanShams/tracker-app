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
import { useTransactions, Transaction } from '../store/transactionStore';
import { useThemeStore } from '../store/themeStore';

const NativeAlert = Platform.OS === 'web' ? { alert: (t: string, m: string) => alert(`${t}: ${m}`) } as any : Alert;

export default function ImportJsonScreen() {
  const router = useRouter();
  const { importTransactions } = useTransactions();
  const { isDark, colors } = useThemeStore();
  
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleImport = () => {
    setErrorMsg('');
    if (!jsonInput.trim()) {
      setErrorMsg('Please enter JSON data.');
      return;
    }
    
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an array of transactions.');
      }
      
      const validated: Omit<Transaction, 'id'>[] = parsed.map((item, idx) => {
        if (!item.name || typeof item.amount !== 'number') {
          throw new Error(`Item at index ${idx} is missing a "name" (string) or "amount" (number).`);
        }
        return {
          name: item.name,
          amount: item.amount,
          categoryName: item.categoryName || 'Imported',
          categoryIcon: item.categoryIcon || 'list-outline',
          categoryColor: item.categoryColor || '#9CA3AF',
          type: item.type === 'income' ? 'income' : 'expense',
          date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: item.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
          notes: item.notes || '',
        };
      });

      importTransactions(validated);
      NativeAlert.alert('Success', `Imported ${validated.length} transactions successfully.`);
      router.back();
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid JSON format.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <FormHeader title="Import JSON" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Paste JSON Array Below</Text>
            <Text style={[styles.hint, { color: colors.textTertiary }]}>
              {`Example format:\n[\n  { "name": "Salary", "amount": 5000, "type": "income", "categoryName": "Work" },\n  { "name": "Lunch", "amount": 250, "type": "expense" }\n]`}
            </Text>

            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.text, 
                  backgroundColor: colors.surface, 
                  borderColor: isDark ? '#3A3A3C' : '#E8E8ED' 
                }
              ]}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={'[\n  ...\n]'}
              placeholderTextColor={colors.textTertiary}
              value={jsonInput}
              onChangeText={(text) => { setJsonInput(text); setErrorMsg(''); }}
            />
            
            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.red }]}>{errorMsg}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.saveBtn, 
                { backgroundColor: colors.primary }, 
                !jsonInput.trim() && { opacity: 0.5 }
              ]}
              activeOpacity={0.8}
              onPress={handleImport}
              disabled={!jsonInput.trim()}
            >
              <Text style={[styles.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>Import Transactions</Text>
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
  form: { gap: 12 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 8, lineHeight: 18 },
  input: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    fontSize: 14, 
    minHeight: 250, 
    maxHeight: 400,
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 16,
    textAlignVertical: 'top'
  },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 13, marginTop: 4 },
  saveBtn: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
