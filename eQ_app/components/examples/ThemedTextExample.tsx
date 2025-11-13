/**
 * Example component demonstrating usage of ThemedText with all typography variants
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export function ThemedTextExample() {
  return (
    <View style={styles.container}>

      <ThemedText variant="heading2" >
        Typography Examples
      </ThemedText>
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          All Typography Variants
        </ThemedText>
        <ThemedText variant="heading1">Heading 1</ThemedText>
        <ThemedText variant="heading2">Heading 2</ThemedText>
        <ThemedText variant="body1">Body 1 - Light weight</ThemedText>
        <ThemedText variant="body2">Body 2 - Medium weight</ThemedText>
        <ThemedText variant="body3">Body 3 - Small text</ThemedText>
        <ThemedText variant="button">BUTTON TEXT</ThemedText>
        <ThemedText variant="subtext1">Subtext 1 - Caption</ThemedText>
        <ThemedText variant="subtext2">Subtext 2 - Small bold</ThemedText>
      </View>

      <ThemedText variant="body2" style={styles.sectionTitle}>
        Styled Examples
      </ThemedText>

      <ThemedText variant="heading1" style={styles.primary}>
        Heading 1 - Montserrat SemiBold
      </ThemedText>
      
      <ThemedText variant="heading2" style={styles.secondary}>
        Heading 2 - Montserrat SemiBold
      </ThemedText>
      
      <ThemedText variant="body1" style={styles.text}>
        Body 1 - Rubik Light: This is regular body text for paragraphs and content.
      </ThemedText>
      
      <ThemedText variant="body2" style={styles.textSecondary}>
        Body 2 - Rubik Medium: This is medium weight body text for emphasis.
      </ThemedText>
      
      <ThemedText variant="body3" style={styles.textLight}>
        Body 3 - Rubik Light: Smaller body text
      </ThemedText>
      
      <ThemedText variant="button" style={styles.primary}>
        BUTTON TEXT
      </ThemedText>
      
      <ThemedText variant="subtext1" style={styles.textSecondary}>
        Subtext 1 - Rubik Light: Caption or helper text
      </ThemedText>
      
      <ThemedText variant="subtext2" style={styles.textDark}>
        Subtext 2 - Rubik Medium: Small emphasized text
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md + Theme.spacing.xs,
    gap: Theme.spacing.md,
  },
  section: {
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.neutral[700],
  },
  primary: {
    color: Theme.colors.primary[500],
  },
  secondary: {
    color: Theme.colors.secondary[500],
  },
  text: {
    color: Theme.colors.neutral.black,
  },
  textSecondary: {
    color: Theme.colors.neutral[700],
  },
  textLight: {
    color: Theme.colors.neutral[500],
  },
  textDark: {
    color: Theme.colors.neutral[900],
  },
});
