/**
 * SessionCalendar component - A shareable monthly calendar view of climbing sessions
 *
 * Renders a full month with climbing days highlighted. Days with more routes
 * get a brighter indicator. Designed to look great as a screenshot to share.
 */

import { Theme } from '@/constants/Theme';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedText } from '../basic/ThemedText';
import { CaretDownIcon } from '../icons/CaretDownIcon';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarSession {
  /** YYYY-MM-DD */
  dateKey: string;
  routesClimbed: number;
  flashes: number;
}

export interface SessionCalendarProps {
  sessions: CalendarSession[];
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Returns an intensity level 0–3 based on routes climbed */
function getIntensity(routes: number): 0 | 1 | 2 | 3 {
  if (routes === 0) return 0;
  if (routes <= 3) return 1;
  if (routes <= 7) return 2;
  return 3;
}

const INTENSITY_COLORS: Record<number, string> = {
  0: 'transparent',
  1: Theme.colors.primary[100],
  2: Theme.colors.primary[300],
  3: Theme.colors.primary[500],
};

const INTENSITY_TEXT_COLORS: Record<number, string> = {
  0: Theme.semantic.text.primary,
  1: Theme.colors.primary[700],
  2: Theme.colors.neutral.white,
  3: Theme.colors.neutral.white,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DayCell({
  day,
  intensity,
  isToday,
  flashCount,
}: {
  day: number | null;
  intensity: 0 | 1 | 2 | 3;
  isToday: boolean;
  flashCount: number;
}) {
  if (day === null) {
    return <View style={styles.dayCell} />;
  }

  const bgColor = intensity > 0 ? INTENSITY_COLORS[intensity] : 'transparent';
  const textColor = intensity > 0 ? INTENSITY_TEXT_COLORS[intensity] : Theme.semantic.text.primary;

  return (
    <View style={styles.dayCell}>
      <View
        style={[
          styles.dayCellInner,
          { backgroundColor: bgColor },
          isToday && styles.todayBorder,
        ]}
      >
        <ThemedText
          variant="subtext2"
          style={[styles.dayNumber, { color: textColor }]}
        >
          {day}
        </ThemedText>
        {flashCount > 0 && intensity > 0 && (
          <View style={[styles.flashDot, intensity === 1 && styles.flashDotDark]} />
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SessionCalendar({ sessions, style: styleProp }: SessionCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Build a map of dateKey → session data for quick lookup
  const sessionMap = React.useMemo(() => {
    const map = new Map<string, CalendarSession>();
    for (const s of sessions) {
      map.set(s.dateKey, s);
    }
    return map;
  }, [sessions]);

  // Compute calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  // Build array: nulls for empty leading cells, then 1..daysInMonth
  const gridDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (gridDays.length % 7 !== 0) gridDays.push(null);

  // Summary stats for this month
  const monthSessions = sessions.filter((s) => {
    const [y, m] = s.dateKey.split('-').map(Number);
    return y === viewYear && m - 1 === viewMonth;
  });
  const totalRoutes = monthSessions.reduce((sum, s) => sum + s.routesClimbed, 0);
  const totalFlashes = monthSessions.reduce((sum, s) => sum + s.flashes, 0);
  const sessionDays = monthSessions.length;

  const goBack = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goForward = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={[styles.card, styleProp]}>
      {/* Header: brand + month nav */}
      <View style={styles.header}>
        <View>
          <ThemedText variant="heading2" style={styles.brandText}>
            eQ
          </ThemedText>
          <ThemedText variant="subtext1" style={styles.brandSub}>
            Climbing Journal
          </ThemedText>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn} accessibilityLabel="Previous month">
            <View style={styles.caretLeft}>
              <CaretDownIcon size={14} color={Theme.colors.primary[500]} />
            </View>
          </TouchableOpacity>
          <ThemedText variant="body2" style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </ThemedText>
          <TouchableOpacity onPress={goForward} style={styles.navBtn} accessibilityLabel="Next month">
            <View style={styles.caretRight}>
              <CaretDownIcon size={14} color={Theme.colors.primary[500]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={styles.dayLabelCell}>
            <ThemedText variant="subtext1" style={styles.dayLabelText}>
              {d}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {gridDays.map((day, index) => {
          if (day === null) {
            return <DayCell key={`empty-${index}`} day={null} intensity={0} isToday={false} flashCount={0} />;
          }
          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const session = sessionMap.get(dateKey);
          const intensity = session ? getIntensity(session.routesClimbed) : 0;
          const isToday = dateKey === todayKey;
          return (
            <DayCell
              key={dateKey}
              day={day}
              intensity={intensity}
              isToday={isToday}
              flashCount={session?.flashes ?? 0}
            />
          );
        })}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Monthly summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ThemedText variant="heading2" style={styles.summaryValue}>
            {sessionDays}
          </ThemedText>
          <ThemedText variant="subtext1" style={styles.summaryLabel}>
            {sessionDays === 1 ? 'Session' : 'Sessions'}
          </ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <ThemedText variant="heading2" style={styles.summaryValue}>
            {totalRoutes}
          </ThemedText>
          <ThemedText variant="subtext1" style={styles.summaryLabel}>
            Routes
          </ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <ThemedText variant="heading2" style={styles.summaryValue}>
            {totalFlashes}
          </ThemedText>
          <ThemedText variant="subtext1" style={styles.summaryLabel}>
            Flashes
          </ThemedText>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <ThemedText variant="subtext1" style={styles.legendLabel}>
          Intensity:
        </ThemedText>
        {([1, 2, 3] as const).map((lvl) => (
          <View key={lvl} style={[styles.legendDot, { backgroundColor: INTENSITY_COLORS[lvl] }]} />
        ))}
        <ThemedText variant="subtext1" style={styles.legendLabel}>
          More
        </ThemedText>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  brandText: {
    color: Theme.colors.primary[500],
  },
  brandSub: {
    color: Theme.semantic.text.secondary,
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  navBtn: {
    padding: 4,
  },
  caretLeft: {
    transform: [{ rotate: '90deg' }],
  },
  caretRight: {
    transform: [{ rotate: '-90deg' }],
  },
  monthLabel: {
    color: Theme.semantic.text.primary,
    minWidth: 120,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabelCell: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabelText: {
    color: Theme.semantic.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    width: `${100 / 7}%`,
  },
  dayCellInner: {
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    height: CELL_SIZE,
    justifyContent: 'center',
    width: CELL_SIZE,
  },
  todayBorder: {
    borderColor: Theme.colors.primary[300],
    borderWidth: 1.5,
  },
  dayNumber: {
    lineHeight: 16,
  },
  flashDot: {
    backgroundColor: Theme.colors.warning[500],
    borderRadius: 3,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  flashDotDark: {
    backgroundColor: Theme.colors.primary[700],
  },
  divider: {
    backgroundColor: Theme.colors.neutral[100],
    height: 1,
    marginVertical: Theme.spacing.md,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  summaryValue: {
    color: Theme.colors.primary[500],
  },
  summaryLabel: {
    color: Theme.semantic.text.secondary,
  },
  summaryDivider: {
    backgroundColor: Theme.colors.neutral[100],
    height: 32,
    width: 1,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  legendLabel: {
    color: Theme.semantic.text.secondary,
  },
  legendDot: {
    borderRadius: 4,
    height: 12,
    width: 12,
  },
});
