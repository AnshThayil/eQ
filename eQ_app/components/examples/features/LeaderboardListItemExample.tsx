/**
 * Example usage of the LeaderboardListItem component
 * Demonstrates the top 3 positions with card shadow
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LeaderboardListItem } from '../../features/LeaderboardListItem';
import { ThemedText } from '../../basic/ThemedText';
import { Theme } from '@/constants';

export function LeaderboardListItemExample() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Top 3 Positions
        </ThemedText>
        <View style={styles.listContainer}>
          <LeaderboardListItem
            position={1}
            name="Ansh Thayil"
            points={3900}
            badgeColor={Theme.colors.warning[500]}
          />
          <View style={styles.spacer} />
          <LeaderboardListItem
            position={2}
            name="Emma Wilson"
            points={3750}
            badgeColor={Theme.colors.warning[500]}
          />
          <View style={styles.spacer} />
          <LeaderboardListItem
            position={3}
            name="James Taylor"
            points={3200}
            badgeColor={Theme.colors.warning[500]}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Custom Badge Colors
        </ThemedText>
        <View style={styles.listContainer}>
          <LeaderboardListItem
            position={1}
            name="Gold Winner"
            points={5000}
            badgeColor="#FFD700"
            badgeTextColor="#000000"
          />
          <View style={styles.spacer} />
          <LeaderboardListItem
            position={2}
            name="Silver Winner"
            points={4500}
            badgeColor="#C0C0C0"
            badgeTextColor="#000000"
          />
          <View style={styles.spacer} />
          <LeaderboardListItem
            position={3}
            name="Bronze Winner"
            points={4000}
            badgeColor="#CD7F32"
            badgeTextColor="#FFFFFF"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  section: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.semantic.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  listContainer: {
    gap: Theme.spacing.md,
  },
  spacer: {
    height: Theme.spacing.sm,
  },
});
