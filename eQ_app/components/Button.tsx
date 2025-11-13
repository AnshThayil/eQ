/**
 * Button component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=136-398
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  /**
   * Button text content
   */
  text: string;
  
  /**
   * Function to call when button is pressed
   */
  onPress: () => void;
  
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the button should take full width of its container
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

export function Button({
  text,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
    >
      <View
        style={[
          styles.buttonInner,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <ThemedText
          variant="button"
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.secondaryText,
          ]}
        >
          {text}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start', // Self-sizing: wrap content by default
  },
  fullWidth: {
    alignSelf: 'stretch', // Override to fill container width
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: Theme.colors.neutral.white,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  text: {
    // Typography variant 'button' already applies the correct font
  },
  primaryText: {
    color: Theme.semantic.text.inverse,
  },
  secondaryText: {
    color: Theme.colors.primary[500],
  },
  iconContainer: {
    width: Theme.iconSize.xs,
    height: Theme.iconSize.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
