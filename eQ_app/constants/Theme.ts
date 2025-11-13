/**
 * Main theme configuration combining colors and typography
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=6-205
 */

import { Colors } from './Colors';
import { Typography } from './Typography';

export const Theme = {
  colors: Colors,
  typography: Typography,
  
  // Semantic color mappings for common use cases
  semantic: {
    // Background colors
    background: {
      primary: Colors.neutral[100],
      secondary: Colors.neutral[300],
      dark: Colors.neutral[900],
    },
    
    // Text colors
    text: {
      primary: Colors.neutral.black,
      secondary: Colors.neutral[700],
      light: Colors.neutral[500],
      inverse: Colors.neutral[100],
    },
    
    // Interactive elements
    interactive: {
      primary: Colors.primary[500],
      primaryHover: Colors.primary[700],
      primaryDisabled: Colors.primary[100],
      secondary: Colors.secondary[500],
      secondaryHover: Colors.secondary[700],
      secondaryDisabled: Colors.secondary[100],
    },
    
    // Status colors
    status: {
      success: Colors.success[500],
      successLight: Colors.success[100],
      warning: Colors.warning[500],
      warningLight: Colors.warning[100],
      error: Colors.error[500],
      errorLight: Colors.error[100],
    },
    
    // Border colors
    border: {
      default: Colors.neutral[300],
      light: Colors.neutral[100],
      dark: Colors.neutral[700],
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius scale
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 20,
    full: 9999,
  },
  
  // Icon size scale
  iconSize: {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
  },
  
  // Shadow/elevation tokens
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
} as const;

export default Theme;
