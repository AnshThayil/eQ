/**
 * Tabs component based on Figma design
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=464-4315
 *
 * A tab container that adds tabbing capabilities to its children.
 * Each child corresponds to a tab in the tabs array by index.
 * Supports swipe gestures and an animated sliding tab indicator.
 */

import { Theme } from '@/constants/Theme';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { ThemedText } from './ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabLayout = { x: number; width: number };

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
  const [tabLayouts, setTabLayouts] = useState<(TabLayout | undefined)[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(defaultTab * SCREEN_WIDTH)).current;
  const childArray = React.Children.toArray(children);

  const indicatorReady =
    tabLayouts.length === tabs.length && tabLayouts.every(Boolean);

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveTab(index);
    },
    [],
  );

  const handleTabLayout = useCallback(
    (index: number, x: number, width: number) => {
      setTabLayouts(prev => {
        const next = [...prev];
        next[index] = { x, width };
        return next;
      });
    },
    [],
  );

  const inputRange = tabs.map((_, i) => i * SCREEN_WIDTH);
  const indicatorTranslateX = indicatorReady
    ? scrollX.interpolate({
        inputRange,
        outputRange: (tabLayouts as TabLayout[]).map(l => l.x),
        extrapolate: 'clamp',
      })
    : undefined;
  const indicatorWidth = indicatorReady
    ? scrollX.interpolate({
        inputRange,
        outputRange: (tabLayouts as TabLayout[]).map(l => l.width),
        extrapolate: 'clamp',
      })
    : undefined;

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
              onPress={() => handleTabPress(index)}
              onLayout={e =>
                handleTabLayout(
                  index,
                  e.nativeEvent.layout.x,
                  e.nativeEvent.layout.width,
                )
              }
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

        {/* Animated sliding indicator line */}
        {indicatorReady &&
          indicatorTranslateX !== undefined &&
          indicatorWidth !== undefined && (
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: indicatorWidth,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            />
          )}
      </View>

      {/* Swipeable paged content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => scrollX.setValue(e.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentOffset={defaultTab > 0 ? { x: defaultTab * SCREEN_WIDTH, y: 0 } : undefined}
        style={styles.scrollView}
      >
        {childArray.map((child, index) => (
          <View key={index} style={styles.page}>
            {child}
          </View>
        ))}
      </ScrollView>
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
  },
  activeTab: {
    backgroundColor: Theme.colors.neutral[100],
    borderTopLeftRadius: Theme.borderRadius.sm,
    borderTopRightRadius: Theme.borderRadius.sm,
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
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: Theme.colors.primary[500],
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
  },
});
