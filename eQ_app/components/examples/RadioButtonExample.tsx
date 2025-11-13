/**
 * Example usage of the RadioButton component
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton } from '../RadioButton';
import { ThemedText } from '../ThemedText';

export function RadioButtonExample() {
  const [value1, setValue1] = useState<string>('option1');
  const [value2, setValue2] = useState<string>('medium');

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Radio Buttons
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Vertical Layout
        </ThemedText>
        <RadioButton
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value={value1}
          onValueChange={setValue1}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Horizontal Layout
        </ThemedText>
        <RadioButton
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
          value={value2}
          onValueChange={setValue2}
          direction="horizontal"
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Disabled State
        </ThemedText>
        <RadioButton
          options={[
            { value: 'option1', label: 'Disabled Option 1' },
            { value: 'option2', label: 'Disabled Option 2' },
          ]}
          value="option1"
          disabled
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
  },
  heading: {
    marginBottom: Theme.spacing.sm,
  },
  section: {
    gap: Theme.spacing.sm + Theme.spacing.xs,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
  },
});
