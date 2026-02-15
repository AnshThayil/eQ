# eQ Component Mapping

This document organizes all components by category and their usage across pages.

## 📦 Basic Building Blocks

Core reusable UI primitives that serve as the foundation for more complex components.

### Form Controls
- **Button** (`Button.tsx`)
  - Primary and secondary button variants
  - Used across all pages for actions

- **InputField** (`InputField.tsx`)
  - Text input with icon support
  - Used in: Login, AddAscentModal, FilterModal

- **Checkbox** (`Checkbox.tsx`)
  - Checkable input control
  - Used in: FilterModal (for filter options)

- **RadioButton** (`RadioButton.tsx`)
  - Single-select option control
  - Used in: AddAscentModal (Flash/No Flash selection)

### Typography
- **ThemedText** (`ThemedText.tsx`)
  - Typography component with variant support
  - Used universally across all pages

### Visual Elements
- **StaticPill** (`StaticPill.tsx`)
  - Non-interactive pill for displaying info
  - Used in: RouteListItem (style, sends), LeaderboardUsed in: RouteListItem (style, sends)

- **ActionPill** (`ActionPill.tsx`)
  - Interactive pill component
  - Used in: FilterModal, any filterable views

### Icons
All icon components in `icons/` directory:
- Navigation: `EventsSelectedIcon`, `EventsUnselectedIcon`, `LeaderboardSelectedIcon`, etc.
- Actions: `SaveIcon`, `SaveIconSelected`, `PlusIcon`, `CloseIcon`, `FilterIcon`, `SortIcon`
- Status: `AscentCompletedIcon`, `AscentUncompletedIcon`, `FlashIcon`, `CheckboxSelectedIcon`, `CheckboxUnselectedIcon`
- Route: `HoldIcon`, `LocationPinIcon`, `MapIcon`
- UI: `CaretDownIcon`, `SearchIcon`
- User: `EmailIcon`

---

## 🧩 Layout Components

Components that handle navigation and page structure.

- **BottomNavBar** (`BottomNavBar.tsx`)
  - Main app navigation bar
  - Used in: Root layout (`app/_layout.tsx`)
  - Navigates between: Routes, Events, Leaderboard, Profile

---

## 🎯 Feature-Specific Components

Components organized by the pages/features they support.

### 🗺️ Routes Page (`app/(routes)/index.tsx`)

Main listing and filtering of climbing routes.

- **RouteListItem** (`RouteListItem.tsx`)
  - Displays individual route in list
  - Contains: route color, level, difficulty, zone, style, sends
  - Integrates: SaveClimb, AscentLog, StaticPill
  
- **FilterModal** (`FilterModal.tsx`)
  - Modal for filtering routes
  - Contains: Checkbox, ActionPill, InputField

- **ZoneAccordion** (`ZoneAccordion.tsx`)
  - Collapsible zone sections
  - Used for grouping routes by zone

- **SaveClimb** (`SaveClimb.tsx`)
  - Save/unsave route button
  - Embedded in: RouteListItem

- **AscentLog** (`AscentLog.tsx`)
  - Quick access to log an ascent
  - Embedded in: RouteListItem

### 📍 Route Detail Page (`app/(routes)/route-detail.tsx`)

Detailed view of a single route with ascent history.

- **AddAscentModal** (`AddAscentModal.tsx`)
  - Modal form for logging route ascents
  - Contains: InputField, RadioButton, Button, HoldIcon

- **AscentsListItem** (`AscentsListItem.tsx`)
  - Displays individual ascent in history
  - Shows: user, date, difficulty, flash status

### 🗺️ Zone Map (`app/(routes)/zone-map.tsx`)

Visual map of climbing zones.

- Currently uses static image/text
- May use: StaticPill, LocationPinIcon, MapIcon in future

### 📅 Events Page (`app/events.tsx`)

Event listings and management.

- TBD (not yet implemented)
- Likely will use: Button, ThemedText, StaticPill/ActionPill

### 🏆 Leaderboard Page (`app/leaderboard.tsx`)

Rankings and user scores.

- TBD (not yet implemented)
- Likely will use: StaticPill, ThemedText, sorting components

### 👤 Profile Page (`app/profile.tsx`)

User profile and settings.

- TBD (not yet implemented)
- Likely will use: Button, ThemedText, InputField, profile stats

### 🔐 Login Page (`app/login.tsx`)

Authentication.

- **InputField** - Email/password inputs
- **Button** - Sign in/sign up actions
- **ThemedText** - Labels and errors

---

## 📋 Component Usage Matrix

| Component | Routes | Route Detail | Zone Map | Events | Leaderboard | Profile | Login |
|-----------|--------|--------------|----------|--------|-------------|---------|-------|
| Button | ✓ | ✓ | - | - | - | - | ✓ |
| ThemedText | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| InputField | ✓ | ✓ | - | - | - | - | ✓ |
| Checkbox | ✓ | - | - | - | - | - | - |
| RadioButton | - | ✓ | - | - | - | - | - |
| StaticPill | ✓ | ✓ | ✓* | - | - | - | - |
| ActionPill | ✓ | - | - | - | - | - | - |
| RouteListItem | ✓ | - | - | - | - | - | - |
| AddAscentModal | - | ✓ | - | - | - | - | - |
| AscentsListItem | - | ✓ | - | - | - | - | - |
| FilterModal | ✓ | - | - | - | - | - | - |
| ZoneAccordion | ✓ | - | - | - | - | - | - |
| SaveClimb | ✓ | ✓ | - | - | - | - | - |
| AscentLog | ✓ | ✓ | - | - | - | - | - |
| BottomNavBar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |

_* Potential future use_

---

## 🔍 Quick Reference

### When building a new feature, use:
- **Forms**: Button, InputField, Checkbox, RadioButton
- **Text Display**: ThemedText (with variants: h1-h5, body1-body2, caption)
- **Status Badges**: StaticPill (info display), ActionPill (interactive filters)
- **Icons**: Check `components/icons/index.ts` for available icons

### Component Hierarchy Examples:

**Route List Structure:**
```
RouteListItem
├── HoldIcon
├── ThemedText (multiple)
├── StaticPill (style, sends)
├── SaveClimb
│   └── SaveIcon
└── AscentLog
    └── AscentCompletedIcon
```

**Add Ascent Form:**
```
AddAscentModal
├── HoldIcon
├── ThemedText (multiple)
├── InputField (difficulty dropdown)
│   └── CaretDownIcon
├── RadioButton (flash option)
└── Button (submit/cancel)
```

**Filter Interface:**
```
FilterModal
├── ThemedText
├── Checkbox (multiple filters)
├── ActionPill (active filters)
└── Button (apply/clear)
```

---

## 📁 File Organization

```
components/
├── [Basic Building Blocks]
│   ├── Button.tsx
│   ├── ThemedText.tsx
│   ├── InputField.tsx
│   ├── Checkbox.tsx
│   ├── RadioButton.tsx
│   ├── StaticPill.tsx
│   └── ActionPill.tsx
│
├── [Layout]
│   └── BottomNavBar.tsx
│
├── [Feature Components]
│   ├── RouteListItem.tsx
│   ├── AddAscentModal.tsx
│   ├── AscentsListItem.tsx
│   ├── FilterModal.tsx
│   ├── ZoneAccordion.tsx
│   ├── SaveClimb.tsx
│   └── AscentLog.tsx
│
├── icons/
│   └── [All icon components]
│
└── examples/
    └── [Component examples]
```
