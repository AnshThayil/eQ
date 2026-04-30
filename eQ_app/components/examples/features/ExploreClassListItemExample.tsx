import { Theme } from '@/constants';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExploreClassListItem } from '../../features/ExploreClassListItem';
import { ThemedText } from '../../basic/ThemedText';

export function ExploreClassListItemExample() {
  const [selectedDuration, setSelectedDuration] = useState('1 month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownOptions = ['1 week', '1 month', '3 months', '6 months', '1 year'];

  const handleSelectOption = (option: string) => {
    setSelectedDuration(option);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText variant="heading2" style={styles.sectionTitle}>
            With Dropdown Pill
          </ThemedText>
          <View style={styles.listContainer}>
            <ExploreClassListItem
              title="Climbfit"
              dropdownPillLabel={selectedDuration}
              sessionsText="10 sessions"
              priceText="Rs. 6,000"
              onActionPress={() => {}}
              onDropdownPillPress={() => setIsDropdownOpen(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="heading2" style={styles.sectionTitle}>
            Without Dropdown Pill
          </ThemedText>
          <View style={styles.listContainer}>
            <ExploreClassListItem
              title="Boulder Basics"
              sessionsText="10 sessions"
              priceText="Rs. 5,000"
              onActionPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  content: {
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  section: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    color: Theme.semantic.text.primary,
    paddingHorizontal: 20,
  },
  listContainer: {
    backgroundColor: Theme.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Theme.semantic.border.default,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    maxHeight: 400,
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