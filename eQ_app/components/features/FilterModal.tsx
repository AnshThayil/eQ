/**
 * FilterModal component for filtering boulders by grade and style
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=136-2288
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/constants';
import { ThemedText } from '../basic/ThemedText';
import { CloseIcon } from '../icons';
import { Checkbox, CheckboxOption } from '../basic/Checkbox';
import { Button } from '../basic/Button';

export interface FilterModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Currently selected grade levels (e.g., ['L1', 'L3'])
   */
  selectedGrades?: string[];

  /**
   * Currently selected climbing styles (e.g., ['Technical', 'Power'])
   */
  selectedStyles?: string[];

  /**
   * Callback when filters are applied/changed
   */
  onApplyFilters: (grades: string[], styles: string[]) => void;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;
}

// Grade levels options
const GRADE_OPTIONS: CheckboxOption[] = [
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'L4', label: 'L4' },
  { value: 'L5', label: 'L5' },
  { value: 'L6', label: 'L6' },
  { value: 'L7', label: 'L7' },
  { value: 'L8', label: 'L8' },
];

// Climbing style options
const STYLE_OPTIONS: CheckboxOption[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'power', label: 'Power' },
  { value: 'slab', label: 'Slab' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'electric', label: 'Electric' },
];

export function FilterModal({
  visible,
  selectedGrades = [],
  selectedStyles = [],
  onApplyFilters,
  onClose,
}: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const [localGrades, setLocalGrades] = React.useState<string[]>(selectedGrades);
  const [localStyles, setLocalStyles] = React.useState<string[]>(selectedStyles);

  // Update local state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setLocalGrades(selectedGrades);
      setLocalStyles(selectedStyles);
    }
  }, [visible, selectedGrades, selectedStyles]);

  const handleClose = () => {
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(localGrades, localStyles);
    handleClose();
  };

  const handleClearAll = () => {
    setLocalGrades([]);
    setLocalStyles([]);
    onApplyFilters([], []);
    handleClose();
  };

  const handleBackdropPress = () => {
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable 
        style={styles.backdrop} 
        onPress={handleBackdropPress}
        accessibilityLabel="Close filters"
      >
        <View style={[
          styles.modalContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText variant="heading2" style={styles.title}>
                Filters
              </ThemedText>
              <TouchableOpacity
                onPress={handleClose}
                accessibilityLabel="Close filters"
                accessibilityHint="Closes the filters panel"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon size={24} color={Theme.colors.neutral.black} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Levels Section */}
              <View style={styles.section}>
                <ThemedText variant="body2" style={styles.sectionTitle}>
                  Levels
                </ThemedText>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    options={GRADE_OPTIONS}
                    values={localGrades}
                    onValuesChange={setLocalGrades}
                  />
                </View>
              </View>

              {/* Style Section */}
              <View style={styles.section}>
                <ThemedText variant="body2" style={styles.sectionTitle}>
                  Style
                </ThemedText>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    options={STYLE_OPTIONS}
                    values={localStyles}
                    onValuesChange={setLocalStyles}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                text="Apply"
                variant="primary"
                onPress={handleApply}
                fullWidth
              />
              <Button
                text="Clear All"
                variant="secondary"
                onPress={handleClearAll}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create<{
  backdrop: ViewStyle;
  modalContainer: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  scrollContent: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  checkboxContainer: ViewStyle;
  buttonContainer: ViewStyle;
}>({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Theme.colors.neutral.white,
    height: '100%',
    width: 204,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    color: Theme.colors.neutral.black,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Theme.colors.neutral.black,
    marginBottom: 16,
    fontWeight: '500',
  },
  checkboxContainer: {
    gap: 12,
  },
  buttonContainer: {
    gap: 16,
    paddingTop: 16,
  },
});
