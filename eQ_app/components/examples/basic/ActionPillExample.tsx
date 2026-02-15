/**
 * Example usage of the ActionPill component
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActionPill } from '../../basic/ActionPill';
import { SortIcon } from '../../icons';
import { ThemedText } from '../../basic/ThemedText';

export function ActionPillExample() {
  const [selectedLarge, setSelectedLarge] = useState(false);
  const [selectedSmall, setSelectedSmall] = useState(false);
  const [selectedLargeWithIcon, setSelectedLargeWithIcon] = useState(false);
  const [selectedSmallWithIcon, setSelectedSmallWithIcon] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.heading}>
        Action Pills
      </ThemedText>
      
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Large Pills
        </ThemedText>
        <View style={styles.row}>
          <ActionPill
            text="Filter"
            size="large"
            isSelected={selectedLarge}
            onPress={() => setSelectedLarge(!selectedLarge)}
          />
          <ActionPill
            text="Sort By"
            size="large"
            isSelected={selectedLargeWithIcon}
            onPress={() => setSelectedLargeWithIcon(!selectedLargeWithIcon)}
            icon={<SortIcon color={selectedLargeWithIcon ? Theme.colors.neutral.white : Theme.colors.primary[500]} />}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Small Pills
        </ThemedText>
        <View style={styles.row}>
          <ActionPill
            text="Tag"
            size="small"
            isSelected={selectedSmall}
            onPress={() => setSelectedSmall(!selectedSmall)}
          />
          <ActionPill
            text="Date"
            size="small"
            isSelected={selectedSmallWithIcon}
            onPress={() => setSelectedSmallWithIcon(!selectedSmallWithIcon)}
            icon={<SortIcon color={selectedSmallWithIcon ? Theme.colors.neutral.white : Theme.colors.primary[500]} />}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Multiple Filters
        </ThemedText>
        <MultipleFiltersExample />
      </View>

      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.sectionTitle}>
          Full Width Pills
        </ThemedText>
        <ActionPill
          text="Full Width Filter"
          size="large"
          isSelected={false}
          onPress={() => {}}
          fullWidth
        />
        <ActionPill
          text="Selected Full Width"
          size="large"
          isSelected={true}
          onPress={() => {}}
          fullWidth
        />
      </View>
    </View>
  );
}

// Example showing multiple filter pills working together
function MultipleFiltersExample() {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };

  const filters = ['All', 'Active', 'Completed', 'Archived'];

  return (
    <View style={styles.filterRow}>
      {filters.map((filter) => (
        <ActionPill
          key={filter}
          text={filter}
          size="small"
          isSelected={selectedFilters.has(filter)}
          onPress={() => toggleFilter(filter)}
        />
      ))}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm + Theme.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
});
