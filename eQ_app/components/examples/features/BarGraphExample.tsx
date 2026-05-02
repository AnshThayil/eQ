import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../basic/ThemedText';
import { BarGraph } from '../../features/BarGraph';

const valuesByLevel = {
  L1: 3,
  L2: 7,
  L3: 12,
  L4: 18,
  L5: 15,
  L6: 10,
  L7: 6,
};

export function BarGraphExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="body2" style={styles.title}>
        BarGraph Example
      </ThemedText>

      <BarGraph
        valuesByLevel={valuesByLevel}
        heading="Number of Climbs by Level"
        color={Theme.colors.success[300]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.md,
  },
  title: {
    color: Theme.semantic.text.primary,
  },
});