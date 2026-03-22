import { typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FormHeaderProps {
  title: string;
}

export function FormHeader({ title }: FormHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      {/* Top Branding Row */}
      <View style={styles.brandingRow}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>MANs Tracker</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.closeBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[typography.headingLarge, { fontSize: 25 }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    // backgroundColor: '#FFFFFF',
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
    fontStyle: 'italic',
    color: '#111111',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },
  titleRow: {
    marginTop: 5,
  },
});
