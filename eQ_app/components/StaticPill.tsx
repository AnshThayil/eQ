/**
 * StaticPill component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=136-428
 * 
 * A non-clickable label component with optional icon
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export type PillSize = 'large' | 'small';

export interface StaticPillProps {
  /**
   * Label text to display
   */
  text: string;
  
  /**
   * Size variant of the pill
   * @default 'large'
   */
  size?: PillSize;
  
  /**
   * Optional icon to display on the right side
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the pill should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function StaticPill({
  text,
  size = 'large',
  icon,
  fullWidth = false,
  style,
}: StaticPillProps) {
  const isLarge = size === 'large';
  
  return (
    <View
      style={[
        styles.pill,
        isLarge ? styles.largePill : styles.smallPill,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <ThemedText
        variant={isLarge ? 'body1' : 'subtext1'}
        style={styles.text}
      >
        {text}
      </ThemedText>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.pill,
    gap: Theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch', // Override to fill container width
  },
  largePill: {
    height: 32,
    paddingHorizontal: Theme.spacing.sm + Theme.spacing.xs,
  },
  smallPill: {
    height: 24,
    paddingHorizontal: Theme.spacing.sm,
  },
  text: {
    color: Theme.semantic.text.primary,
  },
  iconContainer: {
    width: Theme.iconSize.sm,
    height: Theme.iconSize.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
