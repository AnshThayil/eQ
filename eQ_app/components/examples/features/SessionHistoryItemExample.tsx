/**
 * Example usage of SessionHistoryItem component
 */

import { Colors } from '@/constants/Colors';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SessionHistoryItem } from '../../features/SessionHistoryItem';
import { ThemedText } from '../../basic/ThemedText';
import type { SessionRouteItem } from '../../features/SessionHistoryItem';

const SESSION_1_ROUTES: SessionRouteItem[] = [
  {
    id: 1,
    colour: Colors.secondary[300],
    level: 'L3',
    difficulty: 'Easy',
    zone: 'Z1',
    climbingStyle: 'Coordination',
    isFlash: true,
    isLiked: true,
    perceivedDifficulty: 'Easy',
  },
  {
    id: 2,
    colour: '#FD8032',
    level: 'L4',
    difficulty: 'Hard',
    zone: 'Z3',
    climbingStyle: 'Technical',
    isFlash: false,
    isLiked: false,
    perceivedDifficulty: 'Moderate',
  },
  {
    id: 3,
    colour: Colors.primary[500],
    level: 'L3',
    difficulty: 'Hard',
    zone: 'Z2',
    climbingStyle: 'Technical',
    isFlash: false,
    isLiked: false,
    perceivedDifficulty: 'Hard',
  },
  {
    id: 4,
    colour: Colors.secondary[500],
    level: 'L5',
    difficulty: 'Moderate',
    zone: 'Z1',
    climbingStyle: 'Slab',
    isFlash: true,
    isLiked: false,
    perceivedDifficulty: 'Easy',
  },
  {
    id: 5,
    colour: Colors.success[700],
    level: 'L7',
    difficulty: 'Moderate',
    zone: 'Z4',
    climbingStyle: 'Power',
    isFlash: false,
    isLiked: true,
    perceivedDifficulty: 'Moderate',
  },
];

const SESSION_2_ROUTES: SessionRouteItem[] = [
  {
    id: 6,
    colour: Colors.warning[500],
    level: 'L2',
    difficulty: 'Easy',
    zone: 'Z1',
    climbingStyle: 'Slab',
    isFlash: true,
    isLiked: false,
    perceivedDifficulty: 'Easy',
  },
  {
    id: 7,
    colour: Colors.primary[300],
    level: 'L4',
    difficulty: 'Moderate',
    zone: 'Z2',
    climbingStyle: 'Coordination',
    isFlash: false,
    isLiked: true,
    perceivedDifficulty: 'Moderate',
  },
  {
    id: 8,
    colour: Colors.success[500],
    level: 'L5',
    difficulty: 'Hard',
    zone: 'Z3',
    climbingStyle: 'Power',
    isFlash: false,
    isLiked: false,
    perceivedDifficulty: 'Very Hard',
  },
];

export function SessionHistoryItemExample() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText variant="heading2" style={styles.heading}>
        Session History
      </ThemedText>

      <View style={styles.exampleGroup}>
        <ThemedText variant="subtext1" style={styles.label}>
          Expanded by default
        </ThemedText>
        <SessionHistoryItem
          date="April 1st, 2026"
          dayOfWeek="Wednesday"
          routesClimbed={8}
          flashes={3}
          routes={SESSION_1_ROUTES}
          defaultExpanded
        />
      </View>

      <View style={styles.exampleGroup}>
        <ThemedText variant="subtext1" style={styles.label}>
          Collapsed by default
        </ThemedText>
        <SessionHistoryItem
          date="March 28th, 2026"
          dayOfWeek="Saturday"
          routesClimbed={5}
          flashes={1}
          routes={SESSION_2_ROUTES}
        />
      </View>

      <View style={styles.exampleGroup}>
        <ThemedText variant="subtext1" style={styles.label}>
          Session with no routes
        </ThemedText>
        <SessionHistoryItem
          date="March 20th, 2026"
          dayOfWeek="Friday"
          routesClimbed={0}
          flashes={0}
          routes={[]}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  heading: {
    marginBottom: 8,
  },
  exampleGroup: {
    gap: 8,
  },
  label: {
    color: '#606060',
  },
});
