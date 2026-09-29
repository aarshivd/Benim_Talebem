import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Text, Screen, Button } from '@/components/ui';

export default function SettingsPlaceholderScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.xl }}>Yakında</Text>

        {__DEV__ && (
          <View style={{ gap: spacing.md, width: '100%', maxWidth: 300 }}>
            <Button
              label="🎨 Bileşen Galerisi"
              variant="secondary"
              onPress={() => router.push('/__dev/components')}
            />
            <Button
              label="🗄️ DB Testleri"
              variant="secondary"
              onPress={() => router.push('/__dev/db')}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
