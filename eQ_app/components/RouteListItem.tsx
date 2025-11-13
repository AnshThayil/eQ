/**
 * RouteListItem component - Displays a single route item
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=13-161
 * 
 * Shows route information including:
 * - Route color icon (hold)
 * - Level and difficulty
 * - Climbing style
 * - Number of sends
 * - Ascent log button
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AscentLog } from './AscentLog';
import { HoldIcon } from './icons';
import { StaticPill } from './StaticPill';
import { ThemedText } from './ThemedText';

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
   * Number of sends for this route
   */
  numberOfSends: number;
  
  /**
   * Whether the current user has sent this route
   */
  isSent: boolean;
  
  /**
   * Callback when ascent log button is pressed
   */
  onAscentPress?: () => void;
  
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
  numberOfSends,
  isSent,
  onAscentPress,
  style: styleProp,
}: RouteListItemProps) {
  return (
    <View style={[styles.container, styleProp]}>
      {/* Route Info Section */}
      <View style={styles.routeInfo}>
        {/* Hold Icon */}
        <View style={styles.iconContainer}>
          <HoldIcon size={24} color={colour} />
        </View>
        
        {/* Route Details */}
        <View style={styles.routeDetails}>
          {/* Level and Difficulty */}
          <View style={styles.routeLevel}>
            <ThemedText variant="body2" style={styles.levelText}>
              {level}
            </ThemedText>
            <StaticPill text={difficulty} size="small" />
          </View>
          
          {/* Style */}
          <View style={styles.routeStyle}>
            <ThemedText variant="subtext2" style={styles.styleLabel}>
              Style:
            </ThemedText>
            <ThemedText variant="subtext1" style={styles.styleValue}>
              {climbingStyle}
            </ThemedText>
          </View>
        </View>
      </View>
      
      {/* Route Actions Section */}
      <View style={styles.routeActions}>
        {/* Ascent Log Button */}
        <AscentLog
          completed={isSent}
          onPress={() => onAscentPress?.()}
          size={24}
          accessibilityLabel={`Mark route ${level} as ${isSent ? 'not sent' : 'sent'}`}
        />
        
        {/* Number of Sends */}
        <ThemedText variant="subtext1" style={styles.sendsText}>
          {numberOfSends} {numberOfSends === 1 ? 'Send' : 'Sends'}
        </ThemedText>
      </View>
    </View>
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
  routeLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  levelText: {
    color: Theme.semantic.text.primary,
  },
  routeStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 16,
  },
  styleLabel: {
    color: Theme.semantic.text.primary,
    width: 34,
  },
  styleValue: {
    color: Theme.semantic.text.primary,
    flex: 1,
  },
  routeActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 45,
    flexShrink: 0,
  },
  sendsText: {
    color: Theme.semantic.text.primary,
    textAlign: 'right',
  },
});
