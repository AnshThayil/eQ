/**
 * Design system colors extracted from Figma
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=6-205
 */

export const Colors = {
  // Primary color palette
  primary: {
    900: '#260510',
    700: '#730e31',
    500: '#c01752',
    300: '#d97497',
    100: '#f2d1dc',
  },
  
  // Secondary color palette
  secondary: {
    900: '#0a0917',
    700: '#1f1c46',
    500: '#332f74',
    300: '#8582ac',
    100: '#d6d5e3',
  },
  
  // Neutral color palette
  neutral: {
    900: '#202020',
    700: '#606060',
    500: '#a0a0a0',
    300: '#c6c6c6',
    100: '#ececec',
    black: '#000000',
    white: '#FFFFFF',
  },
  
  // Success color palette
  success: {
    900: '#111a02',
    700: '#344f06',
    500: '#57830a',
    300: '#9ab56c',
    100: '#dde6ce',
  },
  
  // Warning color palette
  warning: {
    900: '#33230c',
    700: '#996a23',
    500: '#ffb13b',
    300: '#ffd089',
    100: '#ffefd8',
  },
  
  // Error color palette
  error: {
    900: '#240404',
    700: '#6d0b0b',
    500: '#b61313',
    300: '#d37171',
    100: '#f0d0d0',
  },
} as const;

export type ColorScale = keyof typeof Colors;
export type ColorShade = '900' | '700' | '500' | '300' | '100';
