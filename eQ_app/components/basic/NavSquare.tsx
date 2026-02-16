/**
 * NavSquare component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=389-1285
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export interface NavSquareProps {
  /**
   * Text label to display below the icon
   */
  text: string;
  
  /**
   * Icon component to display at the top
   */
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  
  /**
   * Background color in hex format (e.g., '#8582ac')
   */
  backgroundColor: string;
  
  /**
   * Function to call when the nav square is pressed
   */
  onPress: () => void;
  
  /**
   * Optional size override (component is square, so this sets both width and height)
   * @default 168
   */
  size?: number;
  
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

export function NavSquare({
  text,
  Icon,
  backgroundColor,
  onPress,
  size = 168,
  style,
  accessibilityLabel,
  accessibilityHint,
}: NavSquareProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor,
          width: size,
          height: size,
        },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon size={40} color={Theme.colors.neutral[900]} />
        </View>
        <ThemedText
          variant="button"
          style={styles.text}
        >
          {text}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Theme.colors.neutral[900],
  },
});
