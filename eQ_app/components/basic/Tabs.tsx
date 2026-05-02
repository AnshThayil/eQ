/**
 * Tabs component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=464-4315
 *
 * A tab container that adds tabbing capabilities to its children.
 * Each child corresponds to a tab in the tabs array by index.
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export interface TabsProps {
  /**
   * Labels for each tab. Must match the number of children.
   */
  tabs: string[];

  /**
   * One child element per tab, rendered when that tab is active.
   */
  children: React.ReactNode | React.ReactNode[];

  /**
   * Index of the tab to show by default.
   * @default 0
   */
  defaultTab?: number;

  /**
   * Additional style overrides for the outer container.
   */
  style?: ViewStyle;

  /**
   * Additional style overrides for the tab bar container.
   */
  tabBarStyle?: ViewStyle;
}

export function Tabs({ tabs, children, defaultTab = 0, style, tabBarStyle }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, style]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, tabBarStyle]}>
        {tabs.map((label, index) => {
          const isActive = activeTab === index;
          return (
            <Pressable
              key={index}
              style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab(index)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <ThemedText
                variant={isActive ? 'button' : 'body3'}
                style={[styles.tabText, isActive && styles.activeTabText]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Active Tab Content */}
      <View style={styles.content}>
        {childArray[activeTab] ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
    backgroundColor: Theme.colors.neutral.white,
  },
  tab: {
    paddingTop: Theme.spacing.md + Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.lg + Theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: Theme.colors.neutral[100],
    borderTopLeftRadius: Theme.borderRadius.sm,
    borderTopRightRadius: Theme.borderRadius.sm,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary[500],
    marginBottom: -1,
    paddingBottom: Theme.spacing.md,
  },
  inactiveTab: {
    paddingBottom: Theme.spacing.md + Theme.spacing.xs,
  },
  tabText: {
    color: Theme.colors.neutral[500],
  },
  activeTabText: {
    color: Theme.colors.neutral.black,
  },
  content: {
    flex: 1,
  },
});
