/**
 * Example usage of SaveClimb component
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SaveClimb } from '../../features/SaveClimb';
import { ThemedText } from '../../basic/ThemedText';
import { Theme } from '@/constants/Theme';

export function SaveClimbExample() {
  const [saved, setSaved] = useState(false);

  const handlePress = () => {
    setSaved(!saved);
    console.log(`Route ${saved ? 'unsaved' : 'saved'}`);
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.title}>
        SaveClimb Component
      </ThemedText>
      
      <View style={styles.exampleRow}>
        <ThemedText variant="body1">
          Interactive Save Button:
        </ThemedText>
        <SaveClimb
          saved={saved}
          onPress={handlePress}
        />
      </View>
      
      <ThemedText variant="subtext1" style={styles.status}>
        Status: {saved ? 'Saved (Pink with white border)' : 'Not Saved (White with pink border)'}
      </ThemedText>
      
      <View style={styles.divider} />
      
      <ThemedText variant="body2" style={styles.description}>
        Different sizes:
      </ThemedText>
      
      <View style={styles.sizeRow}>
        <View style={styles.sizeExample}>
          <SaveClimb saved={false} onPress={() => {}} size={16} />
          <ThemedText variant="subtext2">16px</ThemedText>
        </View>
        
        <View style={styles.sizeExample}>
          <SaveClimb saved={false} onPress={() => {}} size={24} />
          <ThemedText variant="subtext2">24px (default)</ThemedText>
        </View>
        
        <View style={styles.sizeExample}>
          <SaveClimb saved={false} onPress={() => {}} size={32} />
          <ThemedText variant="subtext2">32px</ThemedText>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <ThemedText variant="body2" style={styles.description}>
        States:
      </ThemedText>
      
      <View style={styles.stateRow}>
        <View style={styles.stateExample}>
          <SaveClimb saved={false} onPress={() => {}} />
          <ThemedText variant="subtext2">Not Saved</ThemedText>
        </View>
        
        <View style={styles.stateExample}>
          <SaveClimb saved={true} onPress={() => {}} />
          <ThemedText variant="subtext2">Saved</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.neutral.white,
  },
  title: {
    marginBottom: Theme.spacing.md,
    color: Theme.semantic.text.primary,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
  },
  status: {
    marginBottom: Theme.spacing.md,
    color: Theme.semantic.text.secondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.semantic.border.default,
    marginVertical: Theme.spacing.md,
  },
  description: {
    marginBottom: Theme.spacing.sm,
    color: Theme.semantic.text.primary,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  sizeExample: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.md,
  },
  stateExample: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
});
