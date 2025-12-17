/**
 * Example usage of the AscentsListItem component
 * Demonstrates the different states and configurations
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AscentsListItem } from '../AscentsListItem';
import { ThemedText } from '../ThemedText';

export function AscentsListItemExample() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Basic Ascent Item
        </ThemedText>
        <AscentsListItem
          position={1}
          name="Ansh Thayil"
          date="12/11/2025"
          rating="Easy"
          flash={true}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Without Flash
        </ThemedText>
        <AscentsListItem
          position={2}
          name="John Doe"
          date="12/10/2025"
          rating="Hard"
          flash={false}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Different Ratings
        </ThemedText>
        <AscentsListItem
          position={3}
          name="Jane Smith"
          date="12/09/2025"
          rating="Medium"
        />
        <AscentsListItem
          position={4}
          name="Mike Johnson"
          date="12/08/2025"
          rating="V-Hard"
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Without Position
        </ThemedText>
        <AscentsListItem
          name="Sarah Wilson"
          date="12/07/2025"
          rating="Easy"
          flash={true}
        />
      </View>

      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          Multiple Items in List
        </ThemedText>
        <AscentsListItem
          position={1}
          name="Alex Chen"
          date="12/15/2025"
          rating="Easy"
          flash={true}
        />
        <AscentsListItem
          position={2}
          name="Emily Davis"
          date="12/14/2025"
          rating="Medium"
        />
        <AscentsListItem
          position={3}
          name="Chris Brown"
          date="12/13/2025"
          rating="Hard"
          flash={true}
        />
        <AscentsListItem
          position={4}
          name="Jessica Lee"
          date="12/12/2025"
          rating="V-Hard"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
});
