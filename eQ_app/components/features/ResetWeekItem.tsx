/**
 * ResetWeekItem - a single zone card in the setter Setting Schedule / queue.
 * Based on Figma design:
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=463-3295
 *
 * Shows the zone name, last-set / next-reset dates, an edit affordance, and
 * (for the "up next" zone) a "Log Routes" action.
 */

import { PlusIcon } from '@/components/icons';
import { StaticPill } from '@/components/basic/StaticPill';
import { ThemedText } from '@/components/basic/ThemedText';
import { Theme } from '@/constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function PencilIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.1171 9.3461C19.1171 9.3461 22.4645 5.9987 20.2329 3.76711C18.0013 1.53552 14.6539 4.88291 14.6539 4.88291L4.61344 14.9233C3.87851 15.6583 3.29826 16.5504 3.12162 17.5746C2.94326 18.6087 2.8839 19.8921 3.49591 20.5041C4.10791 21.1161 5.39128 21.0568 6.42542 20.8783C7.44963 20.7017 8.34171 20.1215 9.07664 19.3865L19.1171 9.3461ZM14.6539 4.88291L19.1171 9.3461"
        stroke={Theme.colors.primary[500]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface ResetWeekItemProps {
  /** Zone (wall) display name, e.g. "Zone 2". */
  zoneName: string;
  /** ISO date (YYYY-MM-DD) the zone was last set, or null. */
  lastSet: string | null;
  /** ISO date (YYYY-MM-DD) of the next reset, or null. */
  nextReset: string | null;
  /** Whether to show the "Log Routes" action (the up-next zone). */
  showLogRoutes?: boolean;
  /** Whether the card is currently being dragged (elevated styling). */
  isActive?: boolean;
  onEdit?: () => void;
  onLogRoutes?: () => void;
  style?: ViewStyle;
}

/** Format an ISO date (YYYY-MM-DD) as DD/MM/YY. Returns "—" when null. */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year.slice(-2)}`;
}

export function ResetWeekItem({
  zoneName,
  lastSet,
  nextReset,
  showLogRoutes = false,
  isActive = false,
  onEdit,
  onLogRoutes,
  style,
}: ResetWeekItemProps) {
  return (
    <View style={[styles.card, isActive && styles.cardActive, style]}>
      <View style={styles.topRow}>
        <StaticPill text={zoneName} size="large" />
        <TouchableOpacity
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${zoneName}`}
          hitSlop={8}
        >
          <PencilIcon />
        </TouchableOpacity>
      </View>

      <ThemedText variant="body1" style={styles.dateText}>
        Last set: {formatDate(lastSet)}
      </ThemedText>
      <ThemedText variant="body1" style={styles.dateText}>
        Next reset: {formatDate(nextReset)}
      </ThemedText>

      {showLogRoutes && (
        <TouchableOpacity
          style={styles.logRoutesButton}
          onPress={onLogRoutes}
          accessibilityRole="button"
          accessibilityLabel={`Log routes for ${zoneName}`}
        >
          <PlusIcon size={12} color={Theme.colors.primary[500]} />
          <ThemedText variant="button" style={styles.logRoutesText}>
            Log Routes
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    // Card shadow from the design (drop-shadow 1px 2px 8px rgba(0,0,0,0.08))
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dateText: {
    color: Theme.colors.neutral[900],
  },
  logRoutesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logRoutesText: {
    color: Theme.colors.primary[500],
  },
});
