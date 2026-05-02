import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../basic/ThemedText';
import { ActivityItem } from '../../features/ActivityItem';

const activities = [
  {
    id: 'activity-1',
    climberName: 'Maya Chen',
    ascentType: 'send' as const,
    dateClimbed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    boulderGrade: 'L4',
    difficulty: 'Medium',
    climbingStyle: 'Power',
    zone: 'Z3',
    personalGrade: 'Hard',
    routeColor: Colors.primary[500],
  },
  {
    id: 'activity-2',
    climberName: 'Arjun Rao',
    ascentType: 'flash' as const,
    dateClimbed: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    boulderGrade: 'L2',
    difficulty: 'Easy',
    climbingStyle: 'Slab',
    zone: 'Z1',
    personalGrade: 'Medium',
    routeColor: Colors.success[500],
  },
  {
    id: 'activity-3',
    climberName: 'Sara Kim',
    ascentType: 'send' as const,
    dateClimbed: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    boulderGrade: 'L5',
    difficulty: 'Hard',
    climbingStyle: 'Technical',
    zone: 'Z2',
    routeColor: Colors.warning[500],
  },
];

export function ActivityItemExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="body2" style={styles.title}>
        ActivityItem Example
      </ThemedText>

      <View style={styles.list}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} {...activity} />
        ))}
      </View>
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
  list: {
    gap: Theme.spacing.md,
  },
});