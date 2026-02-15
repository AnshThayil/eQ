/**
 * InputField component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=135-453
 * 
 * A versatile input component that can function as either a text input or dropdown trigger.
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ThemedText } from './ThemedText';

export type InputFieldType = 'text' | 'dropdown';

export interface InputFieldProps {
  /**
   * Type of input field - determines behavior
   */
  type: InputFieldType;

  /**
   * Optional label displayed above the input
   */
  label?: string;

  /**
   * Placeholder text shown when input is empty
   * @default 'Placeholder'
   */
  placeholder?: string;

  /**
   * Optional icon displayed on the left side
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon displayed on the right side
   */
  rightIcon?: React.ReactNode;

  /**
   * Current value (for text type)
   */
  value?: string;

  /**
   * Callback when text changes (for text type)
   */
  onChangeText?: (text: string) => void;

  /**
   * Callback when dropdown is pressed (for dropdown type)
   */
  onPress?: () => void;

  /**
   * Options for dropdown (for dropdown type)
   */
  options?: string[];

  /**
   * Callback when dropdown option is selected
   */
  onSelectOption?: (option: string) => void;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the input is in an error state
   * @default false
   */
  error?: boolean;

  /**
   * Additional style overrides for the container
   */
  style?: ViewStyle;

  /**
   * Keyboard type (for text inputs)
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';

  /**
   * Whether the text input is secure (password)
   * @default false
   */
  secureTextEntry?: boolean;

  /**
   * Whether the input should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint for screen readers
   */
  accessibilityHint?: string;
}

export function InputField({
  type,
  label,
  placeholder = 'Placeholder',
  leftIcon,
  rightIcon,
  value,
  onChangeText,
  onPress,
  options,
  onSelectOption,
  disabled = false,
  error = false,
  style,
  keyboardType = 'default',
  secureTextEntry = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownPress = () => {
    if (options && options.length > 0) {
      setShowDropdown(true);
    }
    onPress?.();
  };

  const handleSelectOption = (option: string) => {
    onSelectOption?.(option);
    setShowDropdown(false);
  };

  const renderInputContent = () => {
    if (type === 'text') {
      return (
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.neutral[700]}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          accessibilityHint={accessibilityHint}
        />
      );
    }

    // Dropdown type - show placeholder or value
    return (
      <ThemedText
        variant="body1"
        style={[
          styles.dropdownText,
          !value && styles.placeholderText,
        ]}
      >
        {value || placeholder}
      </ThemedText>
    );
  };

  const inputContent = (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled,
      ]}
    >
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <View style={styles.inputWrapper}>{renderInputContent()}</View>
      {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
    </View>
  );

  return (
    <>
      <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
        {label && (
          <ThemedText variant="subtext2" style={styles.label}>
            {label}
          </ThemedText>
        )}
        {type === 'dropdown' ? (
          <Pressable
            onPress={handleDropdownPress}
            disabled={disabled}
            style={({ pressed }) => [pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label || placeholder}
            accessibilityState={{ disabled, expanded: showDropdown }}
            accessibilityHint={accessibilityHint || 'Tap to open dropdown menu'}
          >
            {inputContent}
          </Pressable>
        ) : (
          inputContent
        )}
      </View>

      {/* Dropdown Modal */}
      {type === 'dropdown' && options && (
        <Modal
          visible={showDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownModal}>
              <FlatList
                data={options}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownOption}
                    onPress={() => handleSelectOption(item)}
                  >
                    <ThemedText variant="body1" style={styles.optionText}>
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.xs,
    width: 280,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    color: Theme.colors.neutral.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[500],
    backgroundColor: Theme.colors.neutral.white,
  },
  inputContainerFocused: {
    borderColor: Theme.colors.secondary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Theme.colors.error[500],
  },
  inputContainerDisabled: {
    backgroundColor: Theme.colors.neutral[100],
    opacity: 0.6,
  },
  iconContainer: {
    width: Theme.iconSize.md,
    height: Theme.iconSize.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    fontFamily: 'Rubik-Light',
    fontSize: Theme.typography.body1.fontSize,
    color: Theme.colors.neutral.black,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  dropdownText: {
    color: Theme.colors.neutral.black,
  },
  placeholderText: {
    color: Theme.colors.neutral[700],
  },
  pressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.sm,
    maxHeight: 300,
    width: '80%',
    maxWidth: 400,
    ...Theme.shadow.md,
  },
  dropdownOption: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  optionText: {
    color: Theme.colors.neutral.black,
  },
});
