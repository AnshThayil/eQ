/**
 * Example usage of the BlueLeaderboardListItem component
 * Demonstrates positions 4+ with optional highlight for current user
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BlueLeaderboardListItem } from '../../features/BlueLeaderboardListItem';
import { ThemedText } from '../../basic/ThemedText';
import { Theme } from '@/constants';

export function BlueLeaderboardListItemExample() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Non-Top-3 Positions
        </ThemedText>
        <View style={styles.listContainer}>
          <BlueLeaderboardListItem
            position={4}
            name="Jonna Lee"
            points={3000}
          />
          <BlueLeaderboardListItem
            position={5}
            name="Michael Chen"
            points={2800}
          />
          <BlueLeaderboardListItem
            position={6}
            name="Sophia Garcia"
            points={2600}
          />
          <BlueLeaderboardListItem
            position={7}
            name="Ayaan Kapoor"
            points={2590}
            isCurrentUser={true}
          />
          <BlueLeaderboardListItem
            position={8}
            name="Liam Smith"
            points={2480}
          />
          <BlueLeaderboardListItem
            position={9}
            name="James Johnson"
            points={2400}
          />
          <BlueLeaderboardListItem
            position={10}
            name="Emma Davis"
            points={2250}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          With Current User Highlight
        </ThemedText>
        <View style={styles.listContainer}>
          <BlueLeaderboardListItem
            position={15}
            name="Regular User 1"
            points={1800}
          />
          <BlueLeaderboardListItem
            position={16}
            name="You"
            points={1750}
            isCurrentUser={true}
          />
          <BlueLeaderboardListItem
            position={17}
            name="Regular User 2"
            points={1700}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Without Highlight
        </ThemedText>
        <View style={styles.listContainer}>
          <BlueLeaderboardListItem
            position={20}
            name="Alice Johnson"
            points={1500}
          />
          <BlueLeaderboardListItem
            position={21}
            name="Bob Williams"
            points={1450}
          />
          <BlueLeaderboardListItem
            position={22}
            name="Carol Martinez"
            points={1400}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
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
    gap: 0, // No gap since items are next to each other
  },
});
