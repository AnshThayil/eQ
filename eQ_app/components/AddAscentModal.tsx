/**
 * AddAscentModal component - Modal for logging a route ascent
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=136-1926
 * 
 * Displays a modal form for logging:
 * - Route level and color
 * - Difficulty selection (dropdown)
 * - Flash/No Flash option (radio buttons)
 * - Comments (text input)
 * - Submit/Cancel actions
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View,
    ViewStyle,
} from 'react-native';
import { Button } from './Button';
import { CaretDownIcon, HoldIcon } from './icons';
import { InputField } from './InputField';
import { RadioButton, RadioOption } from './RadioButton';
import { ThemedText } from './ThemedText';

export interface AddAscentModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Route level (e.g., "L3")
   */
  level: string;

  /**
   * Route color for the hold icon
   */
  colour: string;

  /**
   * Callback when modal is closed/cancelled
   */
  onCancel: () => void;

  /**
   * Callback when ascent is submitted
   * @param data - The ascent data collected from the form
   */
  onSubmit: (data: {
    difficulty: string;
    isFlash: boolean;
    comments: string;
  }) => void;

  /**
   * Available difficulty options
   * @default ['Easy', 'Medium', 'Hard']
   */
  difficultyOptions?: string[];

  /**
   * Additional style overrides for the modal content
   */
  style?: ViewStyle;
}

export function AddAscentModal({
  visible,
  level,
  colour,
  onCancel,
  onSubmit,
  difficultyOptions = ['Easy', 'Medium', 'Hard'],
  style,
}: AddAscentModalProps) {
  const [difficulty, setDifficulty] = useState(difficultyOptions[0]);
  const [isFlash, setIsFlash] = useState(true);
  const [comments, setComments] = useState('');

  const flashOptions: RadioOption[] = [
    { value: 'flash', label: 'Flash' },
    { value: 'noFlash', label: 'No Flash' },
  ];

  const handleSubmit = () => {
    onSubmit({
      difficulty,
      isFlash,
      comments,
    });
    // Reset form
    setDifficulty(difficultyOptions[0]);
    setIsFlash(true);
    setComments('');
  };

  const handleCancel = () => {
    // Reset form
    setDifficulty(difficultyOptions[0]);
    setIsFlash(true);
    setComments('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={[styles.modalContent, style]} onPress={(e) => e.stopPropagation()}>
          {/* Route Level Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <HoldIcon size={24} color={colour} />
            </View>
            <ThemedText variant="body2" style={styles.levelText}>
              {level}
            </ThemedText>
          </View>

          {/* Difficulty Dropdown */}
          <InputField
            type="dropdown"
            label="Difficulty"
            value={difficulty}
            options={difficultyOptions}
            onSelectOption={setDifficulty}
            rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral.black} />}
            fullWidth
          />

          {/* Flash Radio Buttons */}
          <RadioButton
            options={flashOptions}
            value={isFlash ? 'flash' : 'noFlash'}
            onValueChange={(value) => setIsFlash(value === 'flash')}
            direction="horizontal"
          />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <ThemedText variant="subtext2" style={styles.commentsLabel}>
              Comments
            </ThemedText>
            <View style={styles.commentsInputContainer}>
              <TextInput
                style={styles.commentsInput}
                value={comments}
                onChangeText={setComments}
                placeholder="Enter"
                placeholderTextColor={Theme.colors.neutral[700]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                blurOnSubmit
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              text="Cancel"
              onPress={handleCancel}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              text="Submit"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modalContent: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    width: '100%',
    maxWidth: 400,
    gap: 20,
    ...Theme.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    color: Theme.semantic.text.primary,
  },
  commentsSection: {
    gap: Theme.spacing.xs,
  },
  commentsLabel: {
    color: Theme.semantic.text.primary,
  },
  commentsInputContainer: {
    borderWidth: 1,
    borderColor: Theme.colors.neutral[500],
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
  },
  commentsInput: {
    fontFamily: 'Rubik-Light',
    fontSize: Theme.typography.body1.fontSize,
    lineHeight: Theme.typography.body1.lineHeight,
    color: Theme.semantic.text.primary,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    width: 150,
  },
});
