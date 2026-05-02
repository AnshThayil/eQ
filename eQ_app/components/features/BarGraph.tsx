import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { ThemedText } from '../basic/ThemedText';

export interface BarGraphProps {
  valuesByLevel: Record<string, number>;
  heading: string;
  color: string;
  style?: StyleProp<ViewStyle>;
}

interface LevelDatum {
  level: string;
  count: number;
}

const CHART_HEIGHT = 172;
const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

const buildChartData = (valuesByLevel: Record<string, number>): LevelDatum[] => {
  return LEVELS.map((level) => ({
    level,
    count: Math.max(0, valuesByLevel[level] ?? 0),
  }));
};

const getAxisStep = (maxCount: number) => {
  if (maxCount <= 4) {
    return 1;
  }

  const rawStep = Math.ceil(maxCount / 4);
  return Math.ceil(rawStep / 5) * 5;
};

export function BarGraph({ valuesByLevel, heading, color, style }: BarGraphProps) {
  const chartData = buildChartData(valuesByLevel);
  const maxCount = chartData.reduce((currentMax, item) => Math.max(currentMax, item.count), 0);
  const axisStep = getAxisStep(maxCount);
  const axisMax = Math.max(axisStep * 4, axisStep);
  const yAxisLabels = Array.from({ length: 5 }, (_, index) => axisMax - axisStep * index);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText variant="body2" style={styles.heading}>
          {heading}
        </ThemedText>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yAxisLabels.map((label) => (
            <View key={label} style={styles.yAxisLabelSlot}>
              <ThemedText variant="subtext2" style={styles.axisText}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.chartArea}>
          <Svg
            style={styles.gridOverlay}
            width="100%"
            height={CHART_HEIGHT}
            pointerEvents="none"
          >
            {yAxisLabels.map((label, index) => (
              <Line
                key={`grid-${label}`}
                x1="0"
                x2="100%"
                y1={(CHART_HEIGHT / (yAxisLabels.length - 1)) * index}
                y2={(CHART_HEIGHT / (yAxisLabels.length - 1)) * index}
                stroke={Theme.colors.neutral[300]}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
          </Svg>

          <View style={styles.barsRow}>
            {chartData.map((item) => {
              const heightRatio = axisMax === 0 ? 0 : item.count / axisMax;
              const barHeight = Math.max(heightRatio * CHART_HEIGHT, item.count > 0 ? 10 : 0);

              return (
                <View key={item.level} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { backgroundColor: color, height: barHeight }]} />
                  </View>
                  <ThemedText variant="subtext2" style={styles.axisText}>
                    {item.level}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm + 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: Theme.semantic.text.secondary,
    flex: 1,
  },
  chartRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  yAxis: {
    height: CHART_HEIGHT + 22,
    justifyContent: 'space-between',
    paddingBottom: 22,
    width: 24,
  },
  yAxisLabelSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 18,
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT + 22,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  gridOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  barsRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: CHART_HEIGHT + 22,
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    zIndex: 1,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.xs,
  },
  barWrapper: {
    alignItems: 'center',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    borderRadius: Theme.borderRadius.sm,
    maxWidth: 24,
    width: '60%',
  },
  axisText: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
});