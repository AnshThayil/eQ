import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ThemedText } from '../basic/ThemedText';

export interface PieChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  heading: string;
  segments: PieChartSegment[];
  style?: StyleProp<ViewStyle>;
}

const PIE_SIZE = 176;
const PIE_RADIUS = 84;
const PIE_CENTER = PIE_SIZE / 2;
const LABEL_RADIUS = 106;
const PLOT_BOX_WIDTH = 280;
const PLOT_BOX_HEIGHT = 232;
const PLOT_BOX_PADDING_X = (PLOT_BOX_WIDTH - PIE_SIZE) / 2;
const PLOT_BOX_PADDING_Y = (PLOT_BOX_HEIGHT - PIE_SIZE) / 2;
const LABEL_WIDTH = 112;

const toCartesian = (radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: PIE_CENTER + radius * Math.cos(angleInRadians),
    y: PIE_CENTER + radius * Math.sin(angleInRadians),
  };
};

const buildSlicePath = (startAngle: number, endAngle: number) => {
  const start = toCartesian(PIE_RADIUS, startAngle);
  const end = toCartesian(PIE_RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${PIE_CENTER} ${PIE_CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

export function PieChart({ heading, segments, style }: PieChartProps) {
  const sanitizedSegments = segments.filter((segment) => segment.value > 0);
  const total = sanitizedSegments.reduce((sum, segment) => sum + segment.value, 0);

  let currentAngle = 0;
  const slices = sanitizedSegments.map((segment) => {
    const angle = total === 0 ? 0 : (segment.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = startAngle + angle / 2;
    currentAngle = endAngle;

    return {
      ...segment,
      percentage: total === 0 ? 0 : Math.round((segment.value / total) * 100),
      path: buildSlicePath(startAngle, endAngle),
      labelPosition: toCartesian(LABEL_RADIUS, midAngle),
    };
  });

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText variant="body2" style={styles.heading}>
          {heading}
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.plotBox}>
          <Svg width={PIE_SIZE} height={PIE_SIZE} style={styles.chart}>
            {total === 0 ? (
              <Circle
                cx={PIE_CENTER}
                cy={PIE_CENTER}
                r={PIE_RADIUS}
                fill={Theme.colors.neutral[100]}
              />
            ) : (
              slices.map((slice) => (
                <Path
                  key={slice.label}
                  d={slice.path}
                  fill={slice.color}
                  stroke={Theme.colors.neutral.white}
                  strokeWidth={1.5}
                />
              ))
            )}
          </Svg>

          {slices.map((slice) => {
            const isRightSide = slice.labelPosition.x >= PIE_CENTER;
            const labelLeft = isRightSide
              ? PLOT_BOX_PADDING_X + slice.labelPosition.x + 6
              : PLOT_BOX_PADDING_X + slice.labelPosition.x - LABEL_WIDTH - 6;
            const labelTop = PLOT_BOX_PADDING_Y + slice.labelPosition.y - 10;

            return (
              <View
                key={`label-${slice.label}`}
                style={[
                  styles.label,
                  {
                    alignItems: isRightSide ? 'flex-start' : 'flex-end',
                    left: labelLeft,
                    top: labelTop,
                  },
                ]}
              >
                <ThemedText variant="subtext2" style={[styles.labelText, { color: slice.color }]}>
                  {`${slice.label} ${slice.percentage}%`}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.lg,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    justifyContent: 'center',
  },
  heading: {
    color: Theme.semantic.text.secondary,
  },
  chartContainer: {
    alignItems: 'center',
    height: 232,
    justifyContent: 'center',
  },
  plotBox: {
    height: PLOT_BOX_HEIGHT,
    position: 'relative',
    width: PLOT_BOX_WIDTH,
  },
  chart: {
    left: PLOT_BOX_PADDING_X,
    overflow: 'visible',
    position: 'absolute',
    top: PLOT_BOX_PADDING_Y,
  },
  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
  },
  labelText: {
    textAlign: 'center',
  },
});