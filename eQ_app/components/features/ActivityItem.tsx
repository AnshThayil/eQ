import { Theme } from '@/constants/Theme';
import type { Ascent } from '@/services/api';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FlashIcon, HoldIcon } from '../icons';
import { ThemedText } from '../basic/ThemedText';

type AscentType = Ascent['ascent_type'];

export interface ActivityItemProps {
  climberName: string;
  ascentType: AscentType;
  dateClimbed: string;
  boulderGrade: string;
  difficulty: string;
  climbingStyle: string;
  zone: string;
  personalGrade?: string | null;
  climberInitials?: string;
  relativeTime?: string;
  routeColor?: string;
  style?: ViewStyle;
}

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'NA';
};

const formatRelativeTime = (dateClimbed: string) => {
  const timestamp = Date.parse(dateClimbed);
  if (Number.isNaN(timestamp)) {
    return dateClimbed;
  }

  const elapsedMs = Date.now() - timestamp;
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

  if (elapsedSeconds < 60) {
    return 'Just now';
  }

  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ] as const;

  for (const interval of intervals) {
    const value = Math.floor(elapsedSeconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.unit}${value === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
};

const getAscentLabel = (ascentType: AscentType) => {
  return ascentType === 'flash' ? 'Flashed' : 'Sent';
};

export function ActivityItem({
  climberName,
  ascentType,
  dateClimbed,
  boulderGrade,
  difficulty,
  climbingStyle,
  zone,
  personalGrade,
  climberInitials,
  relativeTime,
  routeColor = Theme.colors.primary[500],
  style: styleProp,
}: ActivityItemProps) {
  const displayInitials = climberInitials ?? getInitials(climberName);
  const displayTime = relativeTime ?? formatRelativeTime(dateClimbed);
  const ascentLabel = getAscentLabel(ascentType);

  return (
    <View style={[styles.container, styleProp]}>
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <ThemedText variant="subtext2" style={styles.avatarText}>
              {displayInitials}
            </ThemedText>
          </View>
          <ThemedText variant="body2" style={styles.climberName}>
            {climberName}
          </ThemedText>
        </View>

        <ThemedText variant="subtext1" style={styles.timeText}>
          {displayTime}
        </ThemedText>
      </View>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          {ascentType === 'flash' ? (
            <FlashIcon size={16} color={Theme.colors.success[500]} />
          ) : (
            <Feather name="check" size={14} color={Theme.colors.success[500]} />
          )}
          <ThemedText variant="subtext2" style={styles.statusText}>
            {ascentLabel}
          </ThemedText>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routeIconWrap}>
            <HoldIcon size={16} color={routeColor} />
          </View>

          <ThemedText variant="subtext2" style={styles.routeMetaText}>
            {boulderGrade}
          </ThemedText>

          <View style={styles.dot} />

          <ThemedText variant="subtext2" style={styles.routeMetaText}>
            {difficulty}
          </ThemedText>

          <View style={styles.dot} />

          <ThemedText variant="subtext2" style={styles.routeMetaText}>
            {climbingStyle}
          </ThemedText>

          <View style={styles.dot} />

          <ThemedText variant="subtext2" style={styles.routeMetaText}>
            {zone}
          </ThemedText>
        </View>

        {personalGrade ? (
          <View style={styles.personalGradeRow}>
            <ThemedText variant="subtext2" style={styles.personalGradeLabel}>
              Personal grade:
            </ThemedText>
            <ThemedText variant="subtext1" style={styles.personalGradeValue}>
              {personalGrade}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.sm + Theme.spacing.xs,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm + Theme.spacing.xs,
    minWidth: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Theme.colors.secondary[100],
    borderRadius: Theme.borderRadius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  avatarText: {
    color: Theme.semantic.text.primary,
    fontWeight: '500',
  },
  climberName: {
    color: Theme.semantic.text.primary,
    flexShrink: 1,
  },
  timeText: {
    color: Theme.semantic.text.secondary,
    flexShrink: 0,
  },
  card: {
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm + Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm + Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  statusText: {
    color: Theme.semantic.text.primary,
  },
  routeRow: {
    alignItems: 'center',
    columnGap: Theme.spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Theme.spacing.xs,
  },
  routeIconWrap: {
    alignItems: 'center',
    height: 16,
    justifyContent: 'center',
    marginRight: 2,
    width: 16,
  },
  routeMetaText: {
    color: Theme.semantic.text.primary,
  },
  dot: {
    backgroundColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.full,
    height: 4,
    width: 4,
  },
  personalGradeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  personalGradeLabel: {
    color: Theme.semantic.text.primary,
  },
  personalGradeValue: {
    color: Theme.semantic.text.primary,
  },
});