/**
 * RadioButton component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=29-343
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export interface RadioOption {
  /**
   * Unique value for this option
   */
  value: string;
  
  /**
   * Display label for this option
   */
  label: string;
}

export interface RadioButtonProps {
  /**
   * Array of options to display
   */
  options: RadioOption[];
  
  /**
   * Currently selected value
   */
  value?: string;
  
  /**
   * Callback when selection changes
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Whether the radio group is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Layout direction for the options
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * Additional style overrides for the container
   */
  style?: ViewStyle;
}

export function RadioButton({
  options,
  value,
  onValueChange,
  disabled = false,
  direction = 'vertical',
  style,
}: RadioButtonProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);
  
  // Use controlled value if provided, otherwise use internal state
  const selectedValue = value !== undefined ? value : internalValue;
  
  const handlePress = (optionValue: string) => {
    if (disabled) return;
    
    // Update internal state if uncontrolled
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    
    // Notify parent
    onValueChange?.(optionValue);
  };
  
  return (
    <View style={[styles.container, direction === 'horizontal' && styles.containerHorizontal, style]}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.option,
              pressed && !disabled && styles.pressed,
              disabled && styles.disabled,
            ]}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected, disabled }}
            accessibilityHint={`Tap to select ${option.label}`}
          >
            <View style={styles.radioCircle}>
              {isSelected ? (
                // Selected state - outer stroke + inner filled circle
                <View style={styles.selectedContainer}>
                  <View style={styles.unselectedCircle} />
                  <View style={styles.selectedInner} />
                </View>
              ) : (
                // Unselected state - just the outline
                <View style={styles.unselectedCircle} />
              )}
            </View>
            
            {option.label && (
              <ThemedText variant="body1" style={styles.label}>
                {option.label}
              </ThemedText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  containerHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm, // 8px from design
    paddingVertical: Theme.spacing.xs,
  },
  radioCircle: {
    width: Theme.iconSize.md,
    height: Theme.iconSize.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedCircle: {
    width: Theme.iconSize.md,
    height: Theme.iconSize.md,
    borderRadius: Theme.iconSize.md / 2,
    borderWidth: 1,
    borderColor: Theme.colors.secondary[500],
    backgroundColor: 'transparent',
  },
  selectedContainer: {
    width: Theme.iconSize.md,
    height: Theme.iconSize.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInner: {
    position: 'absolute',
    width: Theme.iconSize.sm,
    height: Theme.iconSize.sm,
    borderRadius: Theme.iconSize.sm / 2,
    backgroundColor: Theme.colors.secondary[500],
  },
  label: {
    color: Theme.semantic.text.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
