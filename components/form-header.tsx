import { typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface FormHeaderProps {
  title: string;
}

export function FormHeader({ title }: FormHeaderProps) {
  const router = useRouter();
  const { colors, isDark } = useThemeStore();

  return (
    <View style={styles.headerContainer}>
      {/* Top Branding Row */}
      <View style={styles.brandingRow}>
        <View style={styles.logoRow}>
          <Text style={[styles.logoText, { color: colors.text }]}>MANs Tracker</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.closeBtn, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[typography.headingLarge, { fontSize: 25, color: colors.text }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -1,
    fontStyle: 'italic'
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  titleRow: {
    marginTop: 5,
  },
});
