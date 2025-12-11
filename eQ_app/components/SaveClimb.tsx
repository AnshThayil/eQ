/**
 * SaveClimb component - Toggle button for saving/unsaving climbing routes
 * Shows save icon with white fill and pink border when not saved
 * Shows save icon with pink fill and white border when saved
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SaveIcon, SaveIconSelected } from './icons';

export interface SaveClimbProps {
  /**
   * Whether the route is saved
   */
  saved: boolean;
  
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

export function SaveClimb({
  saved,
  onPress,
  size = 24,
  accessibilityLabel,
  accessibilityHint,
}: SaveClimbProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (saved ? 'Route saved' : 'Route not saved')}
      accessibilityState={{ checked: saved }}
      accessibilityHint={accessibilityHint || `Tap to ${saved ? 'unsave' : 'save'} route`}
    >
      {saved ? (
        <SaveIconSelected size={size} />
      ) : (
        <SaveIcon size={size} />
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
