# Bottom Navigation Bar

An interactive bottom navigation bar component for the eQ app, built from the Figma design at [node-id=11-891](https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=11-891).

## Features

- 4 navigation tabs: Routes, Leaderboard, Events, Profile
- Interactive selected/unselected icon states
- Smooth transitions when switching tabs
- Integrated with Expo Router for navigation
- Uses app design tokens (colors, typography)
- Accessibility support

## Usage

The navbar is automatically included in the app layout (`app/_layout.tsx`) and handles navigation between the main tabs.

### Navigation Structure

```
app/
├── _layout.tsx       # Root layout with tabs
├── index.tsx         # Redirects to /routes
├── routes.tsx        # Routes tab screen
├── leaderboard.tsx   # Leaderboard tab screen
├── events.tsx        # Events tab screen
└── profile.tsx       # Profile tab screen
```

### Component Props

The `BottomNavBar` component accepts `BottomTabBarProps` from `@react-navigation/bottom-tabs`:

```typescript
interface BottomTabBarProps {
  state: TabNavigationState;
  descriptors: BottomTabDescriptorMap;
  navigation: NavigationHelpers;
  insets: EdgeInsets;
}
```

### Customization

Each tab configuration includes:

```typescript
{
  name: string;              // Route name
  label: string;             // Display label
  SelectedIcon: Component;   // Icon when tab is active
  UnselectedIcon: Component; // Icon when tab is inactive
}
```

## Design

- Height: 80px
- Background: White
- Shadow: Elevation 8 with subtle top shadow
- Icon size: 40x40px
- Label font: Rubik (Light for unselected, Medium/SemiBold for selected)
- Label size: 10px with 0.5px letter spacing
- Color: Secondary 500 (#332F74)

## Icons Used

- `RoutesSelectedIcon` / `RoutesUnselectedIcon`
- `LeaderboardSelectedIcon` / `LeaderboardUnselectedIcon`
- `EventsSelectedIcon` / `EventsUnselectedIcon`
- `ProfileSelectedIcon` / `ProfileUnselectedIcon`

All icons are React Native SVG components located in `components/icons/`.
