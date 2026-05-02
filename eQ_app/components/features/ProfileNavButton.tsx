import { Theme } from '@/constants/Theme';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from '../basic/ThemedText';

export interface ProfileNavButtonProps {
  text: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export function ProfileNavButton({
  text,
  icon,
  onPress,
  style,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: ProfileNavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {icon}
      <ThemedText variant="subtext1" style={styles.label}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
    justifyContent: 'center',
    minWidth: 116,
    padding: Theme.spacing.sm + Theme.spacing.xs,
    shadowColor: Theme.colors.neutral.black,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  label: {
    color: Theme.colors.primary[500],
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});