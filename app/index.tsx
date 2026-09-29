import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Text, Button } from '@/components/ui';
import tr from '@/i18n/tr';

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text variant="display" align="center" color={colors.primary}>
          {tr.app.name}
        </Text>
        <Text variant="body" align="center" color={colors.muted} style={{ marginTop: spacing.sm }}>
          {tr.app.welcome}
        </Text>

        {__DEV__ ? (
          <View style={{ marginTop: spacing.xxl }}>
            <Button
              label="🎨 Bileşen Galerisi"
              variant="secondary"
              onPress={() => router.push('/__dev/components')}
              accessibilityLabel="Geliştirici bileşen galerisi"
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
