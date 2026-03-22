import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FormHeaderProps {
  title: string;
}

export function FormHeader({ title }: FormHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => router.back()}
        style={styles.backBtnOuter}
      >
        <View style={styles.backBtnInner}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </View>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title.toLowerCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10,
    marginBottom: 20,
    gap: 16,
  },
  backBtnOuter: {
    padding: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f8f8f8',
    borderRadius: 14,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e6e6e6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#000',
    letterSpacing: -0.5,
  },
});
