/**
 * SessionHistoryItem component - Displays a single climbing session as an accordion card
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=454-2531
 *
 * Shows session summary (date, duration, routes climbed, flashes) and expands
 * to reveal the list of routes climbed during that session.
 */

import { Theme } from '@/constants/Theme';
import React, { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CaretDownIcon } from '../icons/CaretDownIcon';
import { FlashIcon } from '../icons/FlashIcon';
import { HoldIcon } from '../icons/HoldIcon';
import { LikeFilledIcon } from '../icons/LikeFilledIcon';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface SessionRouteItem {
  /** Unique identifier for the route */
  id: number;
  /** Color of the route hold icon */
  colour: string;
  /** Grade level (e.g., "L3") */
  level: string;
  /** Set difficulty label (e.g., "Easy", "Hard") */
  difficulty: string;
  /** Zone identifier (e.g., "Z1") */
  zone: string;
  /** Climbing style (e.g., "Coordination", "Technical") */
  climbingStyle: string;
  /** Whether the route was flashed (sent on first try) */
  isFlash: boolean;
  /** Whether the user liked the route */
  isLiked: boolean;
  /** User's perceived difficulty rating */
  perceivedDifficulty: string;
}

export interface SessionHistoryItemProps {
  /** Display date string (e.g., "April 1st, 2026") */
  date: string;
  /** Day of the week (e.g., "Wednesday") */
  dayOfWeek: string;
  /** Total number of routes climbed */
  routesClimbed: number;
  /** Number of flashes during the session */
  flashes: number;
  /** List of routes climbed during the session */
  routes: SessionRouteItem[];
  /** Whether the accordion starts expanded */
  defaultExpanded?: boolean;
  /** Additional style overrides for the outer container */
  style?: ViewStyle;
}

function RouteRow({ route }: { route: SessionRouteItem }) {
  return (
    <View style={styles.routeRow}>
      {/* Left: icon + level/difficulty + zone/style */}
      <View style={styles.routeLeft}>
        <View style={styles.routeIconContainer}>
          <View style={styles.routeIconRotate}>
            <HoldIcon size={24} color={route.colour} />
          </View>
        </View>
        <View style={styles.routeDetails}>
          <View style={styles.routeLevelRow}>
            <ThemedText variant="body2" style={styles.routeLevel}>
              {route.level}
            </ThemedText>
            <StaticPill text={route.difficulty} size="small" />
          </View>
          <View style={styles.routeZoneRow}>
            <ThemedText variant="subtext2" style={styles.routeMeta}>
              {route.zone}
            </ThemedText>
            <View style={styles.dot} />
            <ThemedText variant="subtext2" style={styles.routeMeta}>
              {route.climbingStyle}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Right: "You marked" + icons + perceived difficulty */}
      <View style={styles.routeRight}>
        <ThemedText variant="subtext1" style={styles.youMarked}>
          You marked
        </ThemedText>
        <View style={styles.routeActions}>
          {route.isFlash && (
            <FlashIcon size={16} color={Theme.colors.success[500]} />
          )}
          {route.isLiked && (
            <LikeFilledIcon size={16} color={Theme.colors.primary[300]} />
          )}
          <StaticPill text={route.perceivedDifficulty} size="small" />
        </View>
      </View>
    </View>
  );
}

export function SessionHistoryItem({
  date,
  dayOfWeek,
  routesClimbed,
  flashes,
  routes,
  defaultExpanded = false,
  style: styleProp,
}: SessionHistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const isExpandedRef = useRef(defaultExpanded);
  const hasMeasured = useRef(false);

  const handleToggle = () => {
    const next = !isExpandedRef.current;
    isExpandedRef.current = next;
    setIsExpanded(next);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: next ? 1 : 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: next ? 1 : 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleLayout = (h: number) => {
    if (h > 0 && !hasMeasured.current) {
      hasMeasured.current = true;
      setMeasuredHeight(h);
      heightAnim.setValue(isExpandedRef.current ? 1 : 0);
    }
  };

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, measuredHeight],
  });

  return (
    <View style={[styles.card, styleProp]}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <ThemedText variant="body2" style={styles.dateText}>
          {date}
        </ThemedText>
        <ThemedText variant="body3" style={styles.dayText}>
          {dayOfWeek}
        </ThemedText>
      </View>

      {/* Stats chips row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <ThemedText variant="subtext1" style={styles.statLabel}>
            Routes Climbed
          </ThemedText>
          <ThemedText variant="subtext2" style={styles.statValue}>
            {routesClimbed}
          </ThemedText>
        </View>
        <View style={styles.statChip}>
          <ThemedText variant="subtext1" style={styles.statLabel}>
            Flashes
          </ThemedText>
          <ThemedText variant="subtext2" style={styles.statValue}>
            {flashes}
          </ThemedText>
        </View>
      </View>

      {/* Accordion toggle */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.caretContainer, { transform: [{ rotate: rotateDeg }] }]}>
          <CaretDownIcon size={12} color={Theme.colors.primary[500]} />
        </Animated.View>
        <ThemedText variant="button" style={styles.toggleText}>
          {isExpanded ? 'Hide routes' : 'See routes'}
        </ThemedText>
      </TouchableOpacity>

      {/* Expanded routes list - always mounted, height animated */}
      {routes.length > 0 && (
        <Animated.View style={[styles.routesList, { height: measuredHeight === 0 ? undefined : animatedHeight, overflow: 'hidden' }]}>
          <View onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}>
            {routes.map((route, index) => (
              <View
                key={route.id}
                style={[
                  styles.routeRowWrapper,
                  index === 0 && styles.routeRowFirst,
                ]}
              >
                <RouteRow route={route} />
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateHeader: {
    gap: 2,
  },
  dateText: {
    color: Theme.semantic.text.primary,
  },
  dayText: {
    color: Theme.semantic.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  statChip: {
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    gap: Theme.spacing.sm,
    padding: Theme.spacing.sm,
  },
  statLabel: {
    color: Theme.semantic.text.primary,
  },
  statValue: {
    color: Theme.semantic.text.primary,
  },
  toggleButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Theme.borderRadius.sm,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
  },
  caretContainer: {},
  toggleText: {
    color: Theme.colors.primary[500],
  },
  routesList: {
    width: '100%',
  },
  routeRowWrapper: {
    borderBottomColor: Theme.semantic.border.default,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.semantic.border.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: -StyleSheet.hairlineWidth,
  },
  routeRowFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  routeLeft: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  routeIconContainer: {
    alignItems: 'center',
    height: 27,
    justifyContent: 'center',
    width: 27,
  },
  routeIconRotate: {
    transform: [{ rotate: '7.56deg' }],
  },
  routeDetails: {
    gap: Theme.spacing.sm,
  },
  routeLevelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  routeLevel: {
    color: Theme.semantic.text.primary,
  },
  routeZoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  routeMeta: {
    color: Theme.semantic.text.primary,
  },
  dot: {
    backgroundColor: Theme.semantic.text.primary,
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  routeRight: {
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
  },
  youMarked: {
    color: Theme.semantic.text.primary,
  },
  routeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
});
