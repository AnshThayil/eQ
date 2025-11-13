/**
 * AscentLog component - Toggle button for marking climbing ascents
 * Shows ascent icon when not completed, check icon when completed
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AscentCompletedIcon, AscentUncompletedIcon } from './icons';

export interface AscentLogProps {
  /**
   * Whether the ascent is marked as completed
   */
  completed: boolean;
  
  /**
   * Callback when the component is pressed
   */
  onPress: () => void;
  
  /**
   * Size of the icon
   * @default 24
   */
  size?: number;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint for screen readers
   */
  accessibilityHint?: string;
}

export function AscentLog({
  completed,
  onPress,
  size = 24,
  accessibilityLabel,
  accessibilityHint,
}: AscentLogProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (completed ? 'Ascent completed' : 'Ascent not completed')}
      accessibilityState={{ checked: completed }}
      accessibilityHint={accessibilityHint || `Tap to mark ascent as ${completed ? 'not completed' : 'completed'}`}
    >
      {completed ? (
        <AscentCompletedIcon size={size} />
      ) : (
        <AscentUncompletedIcon size={size} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
