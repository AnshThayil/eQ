/**
 * AscentsListItem component - Displays a single ascent item
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=290-2690
 * 
 * Shows ascent information including:
 * - Position/rank number
 * - Climber name
 * - Flash indicator (optional)
 * - Date sent
 * - Rating/difficulty
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { FlashIcon } from '../icons';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface AscentsListItemProps {
  /**
   * Name of the climber
   */
  name: string;
  
  /**
   * Date the route was sent (formatted as MM/DD/YYYY)
   */
  date: string;
  
  /**
   * Rating/difficulty label (e.g., "Easy", "Hard")
   */
  rating: string;
  
  /**
   * Whether the ascent was flashed (sent on first try)
   * @default false
   */
  flash?: boolean;
  
  /**
   * Position/rank number for this ascent
   * Optional - if not provided, no rank pill is shown
   */
  position?: number;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function AscentsListItem({
  name,
  date,
  rating,
  flash = false,
  position,
  style: styleProp,
}: AscentsListItemProps) {
  return (
    <View style={[styles.container, styleProp]}>
      {/* Left Section: Position and User Info */}
      <View style={styles.leftSection}>
        {/* Position Pill */}
        {position !== undefined && (
          <View style={styles.positionPill}>
            <ThemedText variant="subtext1" style={styles.positionText}>
              {position}
            </ThemedText>
          </View>
        )}
        
        {/* User Details */}
        <View style={styles.userDetails}>
          {/* Name and Flash */}
          <View style={styles.nameRow}>
            <ThemedText variant="body1" style={styles.nameText}>
              {name}
            </ThemedText>
            {flash && (
              <FlashIcon size={16} color="#57830A" />
            )}
          </View>
          
          {/* Date */}
          <View style={styles.dateRow}>
            <ThemedText variant="subtext2" style={styles.dateLabel}>
              Sent on:
            </ThemedText>
            <ThemedText variant="subtext1" style={styles.dateValue}>
              {date}
            </ThemedText>
          </View>
        </View>
      </View>
      
      {/* Right Section: Rating Pill */}
      <StaticPill text={rating} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 0,
    backgroundColor: Theme.colors.neutral.white,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  positionPill: {
    backgroundColor: Theme.colors.secondary[100],
    height: 24,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  positionText: {
    color: Theme.semantic.text.primary,
    fontWeight: '500',
  },
  userDetails: {
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    color: Theme.semantic.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    color: Theme.semantic.text.secondary,
    fontWeight: '500',
  },
  dateValue: {
    color: Theme.semantic.text.secondary,
  },
});
