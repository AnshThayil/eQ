/**
 * Design system typography extracted from Figma
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=6-205
 */

export const FontFamily = {
  heading: 'Montserrat',
  body: 'Rubik',
} as const;

export const FontWeight = {
  light: '300' as const,
  medium: '500' as const,
  semibold: '600' as const,
};

export const Typography = {
  // Heading 1: Montserrat SemiBold, 24px, line height 32px
  heading1: {
    fontFamily: FontFamily.heading,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    lineHeight: 32,
  },
  
  // Heading 2: Montserrat SemiBold, 20px, line height 28px
  heading2: {
    fontFamily: FontFamily.heading,
    fontWeight: FontWeight.semibold,
    fontSize: 20,
    lineHeight: 28,
  },
  
  // Body 1: Rubik Light, 16px, line height 24px
  body1: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.light,
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Body 2: Rubik Medium, 16px, line height 24px
  body2: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Body 3: Rubik Light, 14px, line height 14px
  body3: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.light,
    fontSize: 14,
    lineHeight: 14,
  },
  
  // Button: Rubik Medium, 14px, line height 14px
  button: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    lineHeight: 14,
  },
  
  // Subtext 1: Rubik Light, 12px, line height 18px
  subtext1: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.light,
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Subtext 2: Rubik Medium, 12px, line height 18px
  subtext2: {
    fontFamily: FontFamily.body,
    fontWeight: FontWeight.medium,
    fontSize: 12,
    lineHeight: 18,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
