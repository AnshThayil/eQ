import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../basic/ThemedText';
import { PieChart } from '../../features/PieChart';

const segments = [
  { label: 'Slab', value: 35, color: Theme.colors.primary[500] },
  { label: 'Crimpy', value: 20, color: Theme.colors.warning[500] },
  { label: 'Electric', value: 25, color: Theme.colors.error[300] },
  { label: 'Overhang', value: 15, color: Theme.colors.success[700] },
  { label: 'Dynamic', value: 5, color: Theme.colors.secondary[500] },
];

export function PieChartExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="body2" style={styles.title}>
        PieChart Example
      </ThemedText>

      <PieChart heading="Climbing style distribution" segments={segments} />
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