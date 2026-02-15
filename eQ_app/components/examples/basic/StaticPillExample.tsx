/**
 * Example usage of the StaticPill component
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SortIcon } from '../../icons';
import { StaticPill } from '../../basic/StaticPill';
import { ThemedText } from '../../basic/ThemedText';

export function StaticPillExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Static Pills
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Large Pills
        </ThemedText>
        <View style={styles.row}>
          <StaticPill text="Label" size="large" />
          <StaticPill text="With Icon" size="large" icon={<SortIcon color={Theme.colors.primary[500]} />} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Small Pills
        </ThemedText>
        <View style={styles.row}>
          <StaticPill text="Label" size="small" />
          <StaticPill text="With Icon" size="small" icon={<SortIcon color={Theme.colors.primary[500]} />} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Full Width
        </ThemedText>
        <StaticPill text="Full Width Label" size="large" fullWidth />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Multiple Tags
        </ThemedText>
        <View style={styles.row}>
          <StaticPill text="React" size="small" />
          <StaticPill text="TypeScript" size="small" />
          <StaticPill text="Design System" size="small" />
          <StaticPill text="UI/UX" size="small" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
  },
  heading: {
    marginBottom: Theme.spacing.sm,
  },
  section: {
    gap: Theme.spacing.sm + Theme.spacing.xs,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
});
