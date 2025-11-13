/**
 * ActionPill component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=136-497
 * 
 * A clickable pill component for filters and toggleable actions
 * Toggles between selected and unselected states when pressed
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export type ActionPillSize = 'large' | 'small';

export interface ActionPillProps {
  /**
   * Label text to display
   */
  text: string;
  
  /**
   * Callback when the pill is pressed
   */
  onPress: () => void;
  
  /**
   * Size variant of the pill
   * @default 'large'
   */
  size?: ActionPillSize;
  
  /**
   * Optional icon to display on the right side
   * Should be a React element (e.g., <SortIcon />)
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the pill is currently selected
   * @default false
   */
  isSelected?: boolean;
  
  /**
   * Whether the pill should take full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Additional style overrides
   */
  style?: ViewStyle;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint for screen readers
   */
  accessibilityHint?: string;
}

export function ActionPill({
  text,
  onPress,
  size = 'large',
  icon,
  isSelected = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ActionPillProps) {
  const isLarge = size === 'large';
  
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint={accessibilityHint || `Tap to ${isSelected ? 'deselect' : 'select'} ${text}`}
    >
      <View
        style={[
          styles.pillInner,
          isLarge ? styles.largePill : styles.smallPill,
          isSelected ? styles.selectedPill : styles.unselectedPill,
        ]}
      >
        <ThemedText
          variant={isLarge ? 'body1' : 'subtext1'}
          style={[
            styles.text,
            isSelected ? styles.selectedText : styles.unselectedText,
          ]}
        >
          {text}
        </ThemedText>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start', // Self-sizing: wrap content by default
  },
  fullWidth: {
    alignSelf: 'stretch', // Override to fill container width
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.pill,
    gap: Theme.spacing.xs,
  },
  largePill: {
    height: 32,
    paddingHorizontal: 11, // 12 - 1px for border
  },
  smallPill: {
    height: 24,
    paddingHorizontal: 7, // 8 - 1px for border
  },
  unselectedPill: {
    backgroundColor: Theme.colors.neutral.white,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  selectedPill: {
    backgroundColor: Theme.colors.primary[500],
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  text: {
    // Base text style
  },
  unselectedText: {
    color: Theme.colors.primary[500],
  },
  selectedText: {
    color: Theme.colors.neutral.white,
  },
  iconContainer: {
    width: Theme.iconSize.sm,
    height: Theme.iconSize.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
