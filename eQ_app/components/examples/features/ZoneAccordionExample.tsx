/**
 * Example usage of ZoneAccordion component
 */

import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteListItem } from '../../features/RouteListItem';
import { ThemedText } from '../../basic/ThemedText';
import { ZoneAccordion } from '../../features/ZoneAccordion';

export function ZoneAccordionExample() {
  const [openZones, setOpenZones] = useState<Set<string>>(new Set(['zone1']));
  const [sentRoutes, setSentRoutes] = useState<Set<string>>(new Set(['zone1-route2', 'zone2-route1']));

  const zones = [
    {
      id: 'zone1',
      name: 'Zone 1',
      dateSet: 'Set on 19/10/25',
      routes: [
        {
          id: 'zone1-route1',
          colour: Colors.primary[500],
          level: 'L3',
          difficulty: 'Hard',
          climbingStyle: 'Technical',
          numberOfSends: 8,
        },
        {
          id: 'zone1-route2',
          colour: Colors.warning[500],
          level: 'L2',
          difficulty: 'Easy',
          climbingStyle: 'Power',
          numberOfSends: 12,
        },
        {
          id: 'zone1-route3',
          colour: Colors.secondary[500],
          level: 'L5',
          difficulty: 'Medium',
          climbingStyle: 'Slab',
          numberOfSends: 5,
        },
      ],
    },
    {
      id: 'zone2',
      name: 'Zone 2',
      dateSet: 'Set on 12/10/25',
      routes: [
        {
          id: 'zone2-route1',
          colour: Colors.success[500],
          level: 'L3',
          difficulty: 'Easy',
          climbingStyle: 'Coordination',
          numberOfSends: 14,
        },
        {
          id: 'zone2-route2',
          colour: '#9B59B6',
          level: 'L6',
          difficulty: 'Medium',
          climbingStyle: 'Power',
          numberOfSends: 7,
        },
      ],
    },
    {
      id: 'zone3',
      name: 'Zone 3',
      dateSet: 'Set on 05/10/25',
      routes: [
        {
          id: 'zone3-route1',
          colour: '#FD8032',
          level: 'L4',
          difficulty: 'Hard',
          climbingStyle: 'Dynamic',
          numberOfSends: 6,
        },
        {
          id: 'zone3-route2',
          colour: Colors.error[500],
          level: 'L7',
          difficulty: 'V. Hard',
          climbingStyle: 'Overhang',
          numberOfSends: 2,
        },
        {
          id: 'zone3-route3',
          colour: '#3498DB',
          level: 'L1',
          difficulty: 'Easy',
          climbingStyle: 'Slab',
          numberOfSends: 18,
        },
      ],
    },
  ];

  const toggleZone = (zoneId: string) => {
    setOpenZones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
  };

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
          ZoneAccordion Examples
        </ThemedText>
        <ThemedText variant="body1" style={styles.description}>
          Collapsible zones containing route lists. Tap the zone header to
          expand/collapse, and tap route ascent buttons to mark as sent.
        </ThemedText>
      </View>

      <View style={styles.zoneList}>
        {zones.map((zone) => (
          <ZoneAccordion
            key={zone.id}
            zoneName={zone.name}
            dateSet={zone.dateSet}
            isOpen={openZones.has(zone.id)}
            onToggle={() => toggleZone(zone.id)}
          >
            {zone.routes.map((route) => (
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
          </ZoneAccordion>
        ))}
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
  zoneList: {
    borderTopWidth: 1,
    borderTopColor: '#c6c6c6',
  },
});
