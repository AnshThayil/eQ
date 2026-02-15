/**
 * RouteListItem component - Displays a single route item
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=307-2998
 * With zone display: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=288-1411
 * 
 * Shows route information including:
 * - Route color icon (hold)
 * - Level and difficulty
 * - Zone (optional, shown when sorted)
 * - Climbing style
 * - Number of sends
 * - Save button
 * - Ascent log button
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { AscentLog } from './AscentLog';
import { HoldIcon } from '../icons';
import { SaveClimb } from './SaveClimb';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface RouteListItemProps {
  /**
   * Color of the route (for the hold icon)
   */
  colour: string;
  
  /**
   * Level of the route (e.g., "L3")
   */
  level: string;
  
  /**
   * Difficulty label (e.g., "Hard", "Easy")
   */
  difficulty: string;
  
  /**
   * Climbing style (e.g., "Technical", "Dynamic")
   */
  climbingStyle: string;
  
  /**
   * Zone identifier (e.g., "Z1", "Z2")
   * Optional - only shown when showZone is true
   */
  zone?: string;
  
  /**
   * Whether to show the zone information
   * When true, displays zone and climbing style on a separate line
   */
  showZone?: boolean;
  
  /**
   * Number of sends for this route
   */
  numberOfSends: number;
  
  /**
   * Whether the current user has sent this route
   */
  isSent: boolean;
  
  /**
   * Whether the current user has saved this route
   */
  isSaved: boolean;
  
  /**
   * Callback when ascent log button is pressed
   */
  onAscentPress?: () => void;
  
  /**
   * Callback when save button is pressed
   */
  onSavePress?: () => void;
  
  /**
   * Callback when the route item is pressed (for navigation)
   */
  onPress?: () => void;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function RouteListItem({
  colour,
  level,
  difficulty,
  climbingStyle,
  zone,
  showZone = false,
  numberOfSends,
  isSent,
  isSaved,
  onAscentPress,
  onSavePress,
  onPress,
  style: styleProp,
}: RouteListItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.container, styleProp]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Route Info Section */}
      <View style={styles.routeInfo}>
        {/* Hold Icon */}
        <View style={styles.iconContainer}>
          <HoldIcon size={24} color={colour} />
        </View>
        
        {/* Route Details */}
        <View style={[
          styles.routeDetails,
          showZone && zone && styles.routeDetailsWithZone
        ]}>
          {/* Level and Difficulty */}
          <View style={styles.routeLevel}>
            <ThemedText variant="body2" style={styles.levelText}>
              {level}
            </ThemedText>
            <StaticPill text={difficulty} size="small" />
          </View>
          
          {/* Zone and Style */}
          {showZone && zone ? (
            <View style={styles.zoneRow}>
              <ThemedText variant="subtext2" style={styles.zoneText}>
                {zone}
              </ThemedText>
              <View style={styles.dotSeparator} />
              <ThemedText variant="subtext2" style={styles.styleValue}>
                {climbingStyle}
              </ThemedText>
            </View>
          ) : (
            <ThemedText variant="subtext2" style={styles.styleValue}>
              {climbingStyle}
            </ThemedText>
          )}
        </View>
      </View>
      
      {/* Route Actions Section */}
      <View style={styles.routeActions}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <SaveClimb
            saved={isSaved}
            onPress={() => onSavePress?.()}
            size={24}
            accessibilityLabel={`${isSaved ? 'Unsave' : 'Save'} route ${level}`}
          />
          <AscentLog
            completed={isSent}
            onPress={() => onAscentPress?.()}
            size={24}
            accessibilityLabel={`Mark route ${level} as ${isSent ? 'not sent' : 'sent'}`}
          />
        </View>
        
        {/* Number of Sends */}
        <ThemedText variant="subtext1" style={styles.sendsText}>
          {numberOfSends} {numberOfSends === 1 ? 'Send' : 'Sends'}
        </ThemedText>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.semantic.border.default,
    backgroundColor: Theme.colors.neutral.white,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  routeDetails: {
    flexDirection: 'column',
    gap: Theme.spacing.sm,
    flex: 1,
    minWidth: 87,
  },
  routeDetailsWithZone: {
    gap: 12,
  },
  routeLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  levelText: {
    color: Theme.semantic.text.primary,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  zoneText: {
    color: Theme.semantic.text.primary,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.neutral[300],
  },
  styleValue: {
    color: Theme.semantic.text.primary,
  },
  routeActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
    minWidth: 45,
    flexShrink: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'flex-end',
  },
  sendsText: {
    color: Theme.semantic.text.primary,
    textAlign: 'right',
  },
});
