/**
 * LeaderboardListItem component - Displays a single leaderboard entry
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=309-5121
 * 
 * Shows leaderboard entry information including:
 * - Position number (circular badge)
 * - User name
 * - Points scored
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface LeaderboardListItemProps {
  /**
   * Position/rank in the leaderboard (e.g., 1, 2, 3)
   */
  position: number;
  
  /**
   * Name of the user
   */
  name: string;
  
  /**
   * Points scored by the user
   */
  points: number;
  
  /**
   * Background color for the position badge
   * @default Theme.colors.warning[500]
   */
  badgeColor?: string;
  
  /**
   * Text color for the position badge
   * @default Theme.semantic.text.primary
   */
  badgeTextColor?: string;
  
  /**
   * Callback when the item is pressed
   */
  onPress?: () => void;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function LeaderboardListItem({
  position,
  name,
  points,
  badgeColor = Theme.colors.warning[500],
  badgeTextColor = Theme.semantic.text.primary,
  onPress,
  style,
}: LeaderboardListItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  const badgeTextStyle = { fontFamily: 'Rubik-Medium' as const };
  
  return (
    <Container 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Position Badge */}
      <StaticPill
        text={position.toString()}
        size="small"
        shape="circle"
        color={badgeColor}
        textColor={badgeTextColor}
        textStyle={badgeTextStyle}
      />
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <ThemedText variant="body1" style={styles.name}>
          {name}
        </ThemedText>
        <ThemedText variant="subtext2" style={styles.points}>
          {points} points
        </ThemedText>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.sm,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  name: {
    color: Theme.semantic.text.primary,
    flex: 1,
  },
  points: {
    color: Theme.semantic.text.secondary,
    flexShrink: 0,
  },
});
