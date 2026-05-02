import { Theme } from '@/constants/Theme';
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../basic/ThemedText';

export interface StatsCardProps {
  heading: string;
  value: string;
  icon?: ReactNode;
  size?: 'normal' | 'wide';
  style?: ViewStyle;
}

export function StatsCard({
  heading,
  value,
  icon,
  size = 'normal',
  style,
}: StatsCardProps) {
  return (
    <View style={[styles.card, size === 'wide' ? styles.cardWide : styles.cardNormal, style]}>
      <ThemedText variant="subtext2" style={styles.heading}>
        {heading}
      </ThemedText>

      <View style={styles.valueRow}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <ThemedText variant="heading2" style={styles.value}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    gap: 10,
    minHeight: 96,
    justifyContent: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardNormal: {
    width: 160,
  },
  cardWide: {
    width: '100%',
  },
  heading: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  valueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    height: Theme.iconSize.md,
    justifyContent: 'center',
    width: Theme.iconSize.md,
  },
  value: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
});