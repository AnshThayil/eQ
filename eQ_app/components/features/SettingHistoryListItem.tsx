/**
 * SettingHistoryListItem component - A single row in the Setting History list.
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=470-5891
 *
 * Shows date, zones set, and a "View Details" button.
 */

import { Theme } from '@/constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../basic/ThemedText';

export interface SettingHistoryListItemProps {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** List of zone names set on this date */
  zones: string[];
  /** Number of routes set */
  routeCount: number;
  /** Called when "View Details" is tapped */
  onViewDetails: () => void;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year.slice(2)}`;
}

export function SettingHistoryListItem({
  date,
  zones,
  routeCount,
  onViewDetails,
}: SettingHistoryListItemProps) {
  const zonesLabel = zones.length > 0 ? zones.join(', ') : '—';

  return (
    <View style={styles.container}>
      <ThemedText variant="body1">{`Date: ${formatDate(date)}`}</ThemedText>
      <ThemedText variant="body1">{`Zones: ${zonesLabel}`}</ThemedText>
      <ThemedText variant="body1" style={styles.routeCount}>{`Routes: ${routeCount}`}</ThemedText>
      <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7} accessibilityRole="button">
        <ThemedText variant="button" style={styles.viewDetails}>
          View Details
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
    gap: 0,
  },
  routeCount: {
    color: Theme.colors.neutral[600],
  },
  viewDetails: {
    color: Theme.colors.primary[500],
    marginTop: 4,
  },
});
