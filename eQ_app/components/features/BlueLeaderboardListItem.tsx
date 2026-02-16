/**
 * BlueLeaderboardListItem component - Displays a non-top-3 leaderboard entry
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=309-5120
 * 
 * Shows leaderboard entry information for positions 4 and beyond:
 * - Position number (circular badge with neutral color)
 * - User name
 * - Points scored
 * - Optional highlight background for current user
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface BlueLeaderboardListItemProps {
  /**
   * Position/rank in the leaderboard (e.g., 4, 5, 6)
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
   * Whether this is the current user's position (applies highlight)
   * @default false
   */
  isCurrentUser?: boolean;
  
  /**
   * Background color for the position badge
   * @default Theme.colors.neutral[100]
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

export function BlueLeaderboardListItem({
  position,
  name,
  points,
  isCurrentUser = false,
  badgeColor = Theme.colors.neutral[100],
  badgeTextColor = Theme.semantic.text.primary,
  onPress,
  style,
}: BlueLeaderboardListItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  const badgeTextStyle = { fontFamily: 'Rubik-Medium' as const };
  
  return (
    <Container 
      style={[
        styles.container,
        isCurrentUser && styles.highlightedContainer,
        style,
      ]}
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
    paddingVertical: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  highlightedContainer: {
    backgroundColor: Theme.colors.secondary[100],
    marginHorizontal: -20,
    paddingHorizontal: 20,
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
