/**
 * Example usage of the Checkbox component
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox } from '../Checkbox';
import { ThemedText } from '../ThemedText';

export function CheckboxExample() {
  const [values1, setValues1] = useState<string[]>([]);
  const [values2, setValues2] = useState<string[]>(['option2']);

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Checkboxes
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Vertical Layout
        </ThemedText>
        <Checkbox
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          values={values1}
          onValuesChange={setValues1}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Horizontal Layout
        </ThemedText>
        <Checkbox
          options={[
            { value: 'option1', label: 'One' },
            { value: 'option2', label: 'Two' },
            { value: 'option3', label: 'Three' },
          ]}
          values={values2}
          onValuesChange={setValues2}
          direction="horizontal"
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Disabled State
        </ThemedText>
        <Checkbox
          options={[
            { value: 'option1', label: 'Disabled Option 1' },
            { value: 'option2', label: 'Disabled Option 2' },
          ]}
          values={['option1']}
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
