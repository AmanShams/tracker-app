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
      {/* Title Row */}
      <View style={styles.titleRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[typography.headingLarge, { fontSize: 25, color: colors.text }]}>{title}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{ padding: 4 }}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    marginTop: 5,
  },
});
