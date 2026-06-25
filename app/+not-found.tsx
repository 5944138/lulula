import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>No existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver a LA SEÑAL</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#050508' },
  title: { fontSize: 20, fontFamily: 'Courier', color: '#fff' },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14, fontFamily: 'Courier', color: '#25D366' },
});
