/**
 * Example usage of RouteListItem component
 */

import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteListItem } from '../RouteListItem';
import { ThemedText } from '../ThemedText';

export function RouteListItemExample() {
  const [sentRoutes, setSentRoutes] = useState<Set<string>>(new Set(['route2']));

  const routes = [
    {
      id: 'route1',
      colour: Colors.primary[500],
      level: 'L1',
      difficulty: 'Easy',
      climbingStyle: 'Slab',
      numberOfSends: 15,
    },
    {
      id: 'route2',
      colour: Colors.warning[500],
      level: 'L3',
      difficulty: 'Hard',
      climbingStyle: 'Technical',
      numberOfSends: 8,
    },
    {
      id: 'route3',
      colour: Colors.secondary[500],
      level: 'L5',
      difficulty: 'V. Hard',
      climbingStyle: 'Overhang',
      numberOfSends: 3,
    },
    {
      id: 'route4',
      colour: Colors.success[500],
      level: 'L2',
      difficulty: 'Moderate',
      climbingStyle: 'Crimpy',
      numberOfSends: 12,
    },
    {
      id: 'route5',
      colour: '#FD8032',
      level: 'L4',
      difficulty: 'Hard',
      climbingStyle: 'Dynamic',
      numberOfSends: 5,
    },
  ];

  const handleAscentPress = (routeId: string) => {
    setSentRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="heading2" style={styles.title}>
          RouteListItem Examples
        </ThemedText>
        <ThemedText variant="body1" style={styles.description}>
          A list of climbing routes with different difficulties and styles.
          Tap the ascent log button to mark routes as sent.
        </ThemedText>
      </View>

      <View style={styles.routeList}>
        {routes.map((route) => (
          <RouteListItem
            key={route.id}
            colour={route.colour}
            level={route.level}
            difficulty={route.difficulty}
            climbingStyle={route.climbingStyle}
            numberOfSends={route.numberOfSends}
            isSent={sentRoutes.has(route.id)}
            onAscentPress={() => handleAscentPress(route.id)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Single Item Example
        </ThemedText>
        <View style={styles.singleItem}>
          <RouteListItem
            colour="#9B59B6"
            level="L6"
            difficulty="Extreme"
            climbingStyle="Roof"
            numberOfSends={1}
            isSent={false}
            onAscentPress={() => console.log('Ascent pressed')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    gap: 8,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    color: '#606060',
  },
  routeList: {
    borderTopWidth: 1,
    borderTopColor: '#c6c6c6',
  },
  section: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  singleItem: {
    borderTopWidth: 1,
    borderTopColor: '#c6c6c6',
  },
});
