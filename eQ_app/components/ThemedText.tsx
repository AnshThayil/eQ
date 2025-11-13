/**
 * Reusable Text component with built-in typography variants
 */

import { Typography, TypographyVariant } from '@/constants/Typography';
import React, { useMemo } from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
}

// Memoized font family mapping for performance
const getFontFamily = (fontFamily: string, fontWeight: string): string => {
  if (fontFamily === 'Montserrat') {
    return 'Montserrat-SemiBold';
  }
  // Rubik fonts
  if (fontWeight === '300') {
    return 'Rubik-Light';
  }
  return 'Rubik-Medium';
};

export function ThemedText({ variant = 'body1', style, ...props }: ThemedTextProps) {
  const typographyStyle = Typography[variant];
  
  // Memoize the computed font family to avoid recalculation on every render
  const fontFamily = useMemo(
    () => getFontFamily(typographyStyle.fontFamily, typographyStyle.fontWeight),
    [typographyStyle.fontFamily, typographyStyle.fontWeight]
  );

  // Memoize the base style object
  const baseStyle = useMemo(
    () => ({
      fontFamily,
      fontSize: typographyStyle.fontSize,
      lineHeight: typographyStyle.lineHeight,
    }),
    [fontFamily, typographyStyle.fontSize, typographyStyle.lineHeight]
  );

  return (
    <RNText
      style={[baseStyle, style]}
      {...props}
    />
  );
}
