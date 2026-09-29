import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Screen } from '@/components/ui';

export default function TabPlaceholderScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="heading" color={colors.ink}>Yakında</Text>
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
