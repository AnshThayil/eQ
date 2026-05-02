/**
 * Example usage of the Tabs component
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from '../../basic/Tabs';
import { ThemedText } from '../../basic/ThemedText';

export function TabsExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Tabs
      </ThemedText>

      <View style={styles.tabsWrapper}>
        <Tabs tabs={['Activity', 'Stats', 'Badges']}>
          <View style={styles.tabContent}>
            <ThemedText variant="body1" style={styles.tabContentText}>
              Your recent climbing activity will appear here.
            </ThemedText>
          </View>
          <View style={styles.tabContent}>
            <ThemedText variant="body1" style={styles.tabContentText}>
              Your climbing stats will appear here.
            </ThemedText>
          </View>
          <View style={styles.tabContent}>
            <ThemedText variant="body1" style={styles.tabContentText}>
              Your earned badges will appear here.
            </ThemedText>
          </View>
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.md,
  },
  heading: {
    color: Theme.colors.neutral.black,
  },
  tabsWrapper: {
    height: 160,
  },
  tabContent: {
    paddingVertical: Theme.spacing.lg,
  },
  tabContentText: {
    color: Theme.colors.neutral[700],
  },
});
