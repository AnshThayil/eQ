/**
 * Checkbox component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=33-857
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { CheckboxSelectedIcon, CheckboxUnselectedIcon } from '../icons';
import { ThemedText } from './ThemedText';

export interface CheckboxOption {
  /**
   * Unique value for this option
   */
  value: string;
  
  /**
   * Display label for this option
   */
  label: string;
}

export interface CheckboxProps {
  /**
   * Array of options to display
   */
  options: CheckboxOption[];
  
  /**
   * Currently selected values (array)
   */
  values?: string[];
  
  /**
   * Callback when selection changes
   */
  onValuesChange?: (values: string[]) => void;
  
  /**
   * Whether the checkbox group is disabled
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

export function Checkbox({
  options,
  values,
  onValuesChange,
  disabled = false,
  direction = 'vertical',
  style,
}: CheckboxProps) {
  const [internalValues, setInternalValues] = useState<string[]>(values || []);
  
  // Use controlled values if provided, otherwise use internal state
  const selectedValues = values !== undefined ? values : internalValues;
  
  const handlePress = (optionValue: string) => {
    if (disabled) return;
    
    // Toggle the value in the array
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    // Update internal state if uncontrolled
    if (values === undefined) {
      setInternalValues(newValues);
    }
    
    // Notify parent
    onValuesChange?.(newValues);
  };
  
  return (
    <View style={[styles.container, direction === 'horizontal' && styles.containerHorizontal, style]}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        
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
            accessibilityRole="checkbox"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected, disabled }}
            accessibilityHint={`Tap to ${isSelected ? 'uncheck' : 'check'} ${option.label}`}
          >
            <View style={styles.checkboxSquare}>
              {isSelected ? (
                <CheckboxSelectedIcon />
              ) : (
                <CheckboxUnselectedIcon />
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
  checkboxSquare: {
    width: Theme.iconSize.md,
    height: Theme.iconSize.md,
    justifyContent: 'center',
    alignItems: 'center',
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
