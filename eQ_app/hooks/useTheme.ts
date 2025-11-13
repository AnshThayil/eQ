/**
 * React hook for accessing the theme in components
 */

import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Typography } from '@/constants/Typography';

export function useTheme() {
  return {
    theme: Theme,
    colors: Colors,
    typography: Typography,
  };
}

/**
 * Helper function to create themed styles
 * Usage:
 * const styles = createThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.primary[500],
 *   },
 * }));
 */
export function createThemedStyles<T>(
  stylesFn: (theme: typeof Theme) => T
): T {
  return stylesFn(Theme);
}
