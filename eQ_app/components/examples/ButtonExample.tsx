/**
 * Example usage of the Button component
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../Button';
import { ThemedText } from '../ThemedText';

export function ButtonExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Buttons
      </ThemedText>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Primary Buttons
        </ThemedText>
        <Button
          text="Primary Button"
          onPress={() => console.log('Primary pressed')}
          variant="primary"
        />
        <Button
          text="Disabled"
          onPress={() => {}}
          variant="primary"
          disabled
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Secondary Buttons
        </ThemedText>
        <Button
          text="Secondary Button"
          onPress={() => console.log('Secondary pressed')}
          variant="secondary"
        />
        <Button
          text="Disabled"
          onPress={() => {}}
          variant="secondary"
          disabled
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Full Width
        </ThemedText>
        <Button
          text="Full Width Primary"
          onPress={() => {}}
          variant="primary"
          fullWidth
        />
        <Button
          text="Full Width Secondary"
          onPress={() => {}}
          variant="secondary"
          fullWidth
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
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
  },
});
