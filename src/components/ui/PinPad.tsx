import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';

interface PinPadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function PinPad({ onKeyPress, onDelete, disabled = false }: PinPadProps) {
  const { colors } = useTheme();

  const renderKey = (key: string) => {
    return (
      <Pressable
        key={key}
        style={({ pressed }) => [
          styles.key,
          { backgroundColor: pressed ? colors.border : 'transparent' },
        ]}
        onPress={() => onKeyPress(key)}
        disabled={disabled}
      >
        <Text variant="display" color={colors.ink}>
          {key}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {['1', '2', '3'].map(renderKey)}
      </View>
      <View style={styles.row}>
        {['4', '5', '6'].map(renderKey)}
      </View>
      <View style={styles.row}>
        {['7', '8', '9'].map(renderKey)}
      </View>
      <View style={styles.row}>
        <View style={styles.key} />
        {renderKey('0')}
        <Pressable
          style={({ pressed }) => [
            styles.key,
            { backgroundColor: pressed ? colors.border : 'transparent' },
          ]}
          onPress={onDelete}
          disabled={disabled}
          accessibilityLabel="Sil"
        >
          <Text variant="heading" color={colors.muted}>
            ⌫
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const keySize = Math.min(width * 0.2, 80);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    width: keySize,
    height: keySize,
    borderRadius: keySize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
