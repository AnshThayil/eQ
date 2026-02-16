/**
 * Example usage of the NavSquare component
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavSquare } from '../../basic/NavSquare';
import { ThemedText } from '../../basic/ThemedText';
import {
  EventsIcon,
  LeaderboardSelectedIcon,
  ProfileSelectedIcon,
  RoutesSelectedIcon,
  MapIcon,
  SaveIcon,
} from '../../icons';

export function NavSquareExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Nav Squares
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Navigation Options
        </ThemedText>
        <View style={styles.grid}>
          <NavSquare
            text="Routes"
            Icon={RoutesSelectedIcon}
            backgroundColor={Theme.colors.secondary[300]}
            onPress={() => console.log('Routes pressed')}
          />
          <NavSquare
            text="Events"
            Icon={EventsIcon}
            backgroundColor={Theme.colors.primary[300]}
            onPress={() => console.log('Events pressed')}
          />
        </View>
        <View style={styles.grid}>
          <NavSquare
            text="Leaderboard"
            Icon={LeaderboardSelectedIcon}
            backgroundColor={Theme.colors.warning[300]}
            onPress={() => console.log('Leaderboard pressed')}
          />
          <NavSquare
            text="Profile"
            Icon={ProfileSelectedIcon}
            backgroundColor={Theme.colors.success[300]}
            onPress={() => console.log('Profile pressed')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Feature Options
        </ThemedText>
        <View style={styles.grid}>
          <NavSquare
            text="Map View"
            Icon={MapIcon}
            backgroundColor={Theme.colors.secondary[100]}
            onPress={() => console.log('Map pressed')}
          />
          <NavSquare
            text="Save"
            Icon={SaveIcon}
            backgroundColor={Theme.colors.primary[100]}
            onPress={() => console.log('Save pressed')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Custom Size
        </ThemedText>
        <View style={styles.grid}>
          <NavSquare
            text="Small"
            Icon={RoutesSelectedIcon}
            backgroundColor={Theme.colors.neutral[300]}
            onPress={() => console.log('Small pressed')}
            size={120}
          />
          <NavSquare
            text="Large"
            Icon={EventsIcon}
            backgroundColor={Theme.colors.secondary[500]}
            onPress={() => console.log('Large pressed')}
            size={200}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.md,
  },
  heading: {
    marginBottom: Theme.spacing.sm,
  },
  section: {
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Theme.colors.neutral[700],
  },
  grid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    flexWrap: 'wrap',
  },
});
