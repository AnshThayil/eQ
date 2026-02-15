/**
 * Example usage of the AscentLog component
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AscentLog } from '../../features/AscentLog';
import { ThemedText } from '../../basic/ThemedText';

export function AscentLogExample() {
  const [completed1, setCompleted1] = useState(false);
  const [completed2, setCompleted2] = useState(true);
  const [completed3, setCompleted3] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Ascent Log
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Mark Your Ascents
        </ThemedText>
        <View style={styles.row}>
          <View style={styles.ascentItem}>
            <AscentLog
              completed={completed1}
              onPress={() => setCompleted1(!completed1)}
            />
            <ThemedText variant="body1">Route 1</ThemedText>
          </View>

          <View style={styles.ascentItem}>
            <AscentLog
              completed={completed2}
              onPress={() => setCompleted2(!completed2)}
            />
            <ThemedText variant="body1">Route 2 (Completed)</ThemedText>
          </View>

          <View style={styles.ascentItem}>
            <AscentLog
              completed={completed3}
              onPress={() => setCompleted3(!completed3)}
            />
            <ThemedText variant="body1">Route 3</ThemedText>
          </View>
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
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  ascentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
});
