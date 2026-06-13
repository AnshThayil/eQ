/**
 * LogRouteListItem - a single staged route row in the Log Routes screen.
 * Shows hold colour icon, grade (body2/medium), difficulty pill, climbing style (subtext2/medium),
 * plus delete (trash) and edit (pencil) icon buttons.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=471-6418
 */

import { Theme } from '@/constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EditIcon, HoldIcon, TrashIcon } from '../icons';
import { StaticPill } from '../basic/StaticPill';
import { ThemedText } from '../basic/ThemedText';

export interface LogRouteListItemProps {
  colour: string;
  grade: string;
  difficulty: string;
  climbingStyle: string;
  onDelete: () => void;
  onEdit?: () => void;
}

export function LogRouteListItem({
  colour,
  grade,
  difficulty,
  climbingStyle,
  onDelete,
  onEdit,
}: LogRouteListItemProps) {
  return (
    <View style={styles.container}>
      {/* Left: hold icon + details */}
      <View style={styles.left}>
        <HoldIcon size={24} color={colour} />
        <View style={styles.info}>
          {/* Row 1: grade (body2 medium) + difficulty pill */}
          <View style={styles.gradeRow}>
            <ThemedText variant="body2" style={styles.grade}>{grade}</ThemedText>
            {difficulty ? <StaticPill text={difficulty} size="small" /> : null}
          </View>
          {/* Row 2: climbing style (subtext2 medium) */}
          {climbingStyle ? (
            <ThemedText variant="subtext2" style={styles.style}>{climbingStyle}</ThemedText>
          ) : null}
        </View>
      </View>

      {/* Right: trash + edit icons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={8}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Delete route"
        >
          <TrashIcon size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={8}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Edit route"
        >
          <EditIcon size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  info: {
    gap: 8,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  grade: {
    color: Theme.colors.neutral[900],
  },
  style: {
    color: Theme.colors.neutral[900],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

