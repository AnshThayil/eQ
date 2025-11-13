# EQ Design System Theme

This theme system is based on the design specifications from Figma: [EQ Design System](https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=6-205)

## Colors

The color palette includes six color scales, each with five shades (900, 700, 500, 300, 100):

### Primary
- **900**: `#260510` - Darkest primary
- **700**: `#730e31` - Dark primary
- **500**: `#c01752` - Primary (main brand color)
- **300**: `#d97497` - Light primary
- **100**: `#f2d1dc` - Lightest primary

### Secondary
- **900**: `#0a0917` - Darkest secondary
- **700**: `#1f1c46` - Dark secondary
- **500**: `#332f74` - Secondary
- **300**: `#8582ac` - Light secondary
- **100**: `#d6d5e3` - Lightest secondary

### Neutral
- **900**: `#202020` - Darkest neutral
- **700**: `#606060` - Dark neutral
- **500**: `#a0a0a0` - Neutral
- **300**: `#c6c6c6` - Light neutral
- **100**: `#ececec` - Lightest neutral
- **black**: `#000000` - Pure black
- **white**: `#FFFFFF` - Pure white

### Success
- **900**: `#111a02` - Darkest success
- **700**: `#344f06` - Dark success
- **500**: `#57830a` - Success
- **300**: `#9ab56c` - Light success
- **100**: `#dde6ce` - Lightest success

### Warning
- **900**: `#33230c` - Darkest warning
- **700**: `#996a23` - Dark warning
- **500**: `#ffb13b` - Warning
- **300**: `#ffd089` - Light warning
- **100**: `#ffefd8` - Lightest warning

### Error
- **900**: `#240404` - Darkest error
- **700**: `#6d0b0b` - Dark error
- **500**: `#b61313` - Error
- **300**: `#d37171` - Light error
- **100**: `#f0d0d0` - Lightest error

## Typography

### Font Families
- **Headings**: Montserrat
- **Body Text**: Rubik

### Typography Variants

| Variant | Font Family | Weight | Size | Line Height |
|---------|-------------|---------|------|-------------|
| heading1 | Montserrat | SemiBold (600) | 24px | 32px |
| heading2 | Montserrat | SemiBold (600) | 20px | 28px |
| body1 | Rubik | Light (300) | 16px | 24px |
| body2 | Rubik | Medium (500) | 16px | 24px |
| body3 | Rubik | Light (300) | 14px | 14px |
| button | Rubik | Medium (500) | 14px | 14px |
| subtext1 | Rubik | Light (300) | 12px | 18px |
| subtext2 | Rubik | Medium (500) | 12px | 18px |

## Usage

### Basic Import
```typescript
import { Colors, Typography, Theme } from '@/constants';
```

### Using Colors
```typescript
import { Colors } from '@/constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.neutral[300],
  },
});
```

### Using Typography
```typescript
import { Typography } from '@/constants';

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: Typography.heading1.fontSize,
    lineHeight: Typography.heading1.lineHeight,
  },
});
```

### Using the Theme Hook
```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { colors, typography } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.primary[500] }}>
      <Text style={{ 
        fontFamily: 'Montserrat-SemiBold',
        fontSize: typography.heading1.fontSize 
      }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Using the ThemedText Component
```typescript
import { ThemedText } from '@/components/ThemedText';

function MyComponent() {
  return (
    <>
      <ThemedText variant="heading1" style={{ color: Colors.primary[500] }}>
        Welcome
      </ThemedText>
      <ThemedText variant="body1">
        This is body text with automatic font styling.
      </ThemedText>
    </>
  );
}
```

### Using Semantic Colors
```typescript
import { Theme } from '@/constants';

const styles = StyleSheet.create({
  background: {
    backgroundColor: Theme.semantic.background.primary,
  },
  text: {
    color: Theme.semantic.text.primary,
  },
  button: {
    backgroundColor: Theme.semantic.interactive.primary,
  },
  successMessage: {
    backgroundColor: Theme.semantic.status.successLight,
    color: Theme.semantic.status.success,
  },
});
```

## Spacing Scale
```typescript
Theme.spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

## Border Radius Scale
```typescript
Theme.borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 20,    // For pill-shaped components
  full: 9999,
}
```

## Icon Size Scale
```typescript
Theme.iconSize = {
  xs: 12,  // Extra small icons
  sm: 16,  // Small icons
  md: 24,  // Medium icons (default)
  lg: 32,  // Large icons
}
```

## Shadow/Elevation Tokens
```typescript
Theme.shadow = {
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
}
```

## Icon Components

All icons are available in the `components/icons/` directory with standardized props:

```typescript
import { 
  SortIcon, 
  AscentCompletedIcon, 
  AscentUncompletedIcon,
  CheckboxUnselectedIcon,
  CheckboxSelectedIcon,
  LocationPinIcon,
  CaretDownIcon,
  SearchIcon,
  EmailIcon 
} from '@/components/icons';

// Usage with theme tokens
<SortIcon size={Theme.iconSize.sm} color={Theme.colors.primary[500]} />
<EmailIcon size={Theme.iconSize.md} color={Theme.colors.secondary[500]} />
```

All icon components accept:
- `size?: number` - Icon size in pixels (defaults vary by icon)
- `color?: string` - Icon color (defaults vary by icon)

## Components

### ThemedText
A reusable text component with built-in typography variants:
```typescript
<ThemedText variant="heading1">Heading</ThemedText>
<ThemedText variant="body1">Body text</ThemedText>
<ThemedText variant="button">BUTTON</ThemedText>
```

## Font Loading

Fonts are automatically loaded in `app/_layout.tsx` using `expo-font` and `@expo-google-fonts`.

The following fonts are loaded:
- `Montserrat-SemiBold` (600 weight)
- `Rubik-Light` (300 weight)
- `Rubik-Medium` (500 weight)

## Best Practices

### Avoiding Hardcoded Values

**DO**: Use theme tokens for consistency
```typescript
// ✅ Good - Uses theme tokens
const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.pill,
    padding: Theme.spacing.md,
    gap: Theme.spacing.xs,
    ...Theme.shadow.md,
  },
  icon: {
    width: Theme.iconSize.sm,
    height: Theme.iconSize.sm,
  },
});
```

**DON'T**: Hardcode values
```typescript
// ❌ Bad - Hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
```

### Component Naming Conventions

- Use `onPress` instead of `onClick` for React Native components
- Always provide `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` for interactive components
- Use semantic color mappings (`Theme.semantic.*`) when appropriate

### Performance Considerations

- Icon components are lightweight and can be used without memoization
- ThemedText component uses optimized font family calculation
- Use theme tokens to enable easy theme switching in the future

## Type Safety

All theme values are typed for TypeScript autocomplete and type checking:
```typescript
import type { ColorScale, ColorShade, TypographyVariant } from '@/constants';
```
