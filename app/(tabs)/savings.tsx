import { View, Text, StyleSheet } from 'react-native';

export default function SavingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Savings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 20, fontFamily: 'Inter_700Bold' },
});
