import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../basic/ThemedText';
import { StatsCard } from '../../features/StatsCard';
import { HoldIcon } from '../../icons';

function GradeIcon() {
  return <View style={styles.gradeIcon} />;
}

export function StatsCardExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="body2" style={styles.title}>
        StatsCard Example
      </ThemedText>

      <View style={styles.row}>
        <StatsCard heading="Total Climbs" value="106" />
        <StatsCard heading="Highest grade" value="L7" icon={<GradeIcon />} />
      </View>

      <StatsCard
        heading="Strongest climbing style"
        value="Slab"
        icon={<HoldIcon size={24} color={Theme.colors.secondary[500]} />}
        size="wide"
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  gradeIcon: {
    backgroundColor: Theme.colors.secondary[500],
    borderRadius: Theme.borderRadius.full,
    height: 24,
    width: 24,
  },
});