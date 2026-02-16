# Design Document: Admin Panel Redesign

## Overview

This design document outlines the comprehensive redesign of the Tips.io admin panel. The redesign focuses on establishing a robust design system, improving visual consistency, enhancing accessibility, and creating a professional B2B interface. The current implementation uses glass morphism effects and aurora backgrounds which will be replaced with a clean, systematic approach using solid backgrounds, consistent spacing, and proper contrast ratios.

### Current State Analysis

**Problems Identified:**
- Inconsistent use of glass effects (`bg-white/80 dark:bg-white/5`) creates visual noise
- Aurora animated backgrounds distract from content
- Inconsistent spacing and component sizing
- Poor contrast in some areas (muted text, borders)
- Mixed use of border radii (10px, 0.75rem, xl)
- Inconsistent shadow usage
- No systematic approach to component states
- Tables lack proper hierarchy and scanability

**Technology Stack:**
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS with CSS variables
- shadcn/ui components (Radix UI primitives)
- Framer Motion for animations
- React Hook Form for forms
- Existing i18n system

## Architecture

### Design System Structure

```
Design System
├── Design Tokens
│   ├── Colors (Neutral, Accent, Semantic)
│   ├── Typography (Scale, Weights, Line Heights)
│   ├── Spacing (4px base scale)
│   ├── Shadows (3 levels)
│   ├── Border Radii (3 sizes)
│   └── Breakpoints (Mobile, Tablet, Desktop)
├── Components
│   ├── Primitives (Button, Input, Select, etc.)
│   ├── Patterns (Table, Filter Bar, Stats Grid)
│   └── Layouts (Sidebar, Top Bar, Page Container)
└── Pages
    ├── Dashboard
    ├── List Pages (Venues, Transactions)
    ├── Detail Pages
    ├── Form Pages
    └── Settings
```

### Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  Top Bar (64px)                                     │
│  [Logo] [Search] [Notifications] [Profile]         │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │  Page Content                           │
│ (240px)  │  ┌────────────────────────────────────┐ │
│          │  │ Page Header                        │ │
│ Nav      │  │ [Title] [Actions]                  │ │
│ Items    │  ├────────────────────────────────────┤ │
│          │  │ Filters / Stats                    │ │
│          │  ├────────────────────────────────────┤ │
│          │  │ Main Content                       │ │
│          │  │ (Table / Cards / Form)             │ │
│          │  └────────────────────────────────────┘ │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Design Tokens

#### Color System

```typescript
// CSS Variables (globals.css)
:root {
  // Neutral Scale (Light Mode)
  --neutral-50: 250 250 250;   // #fafafa
  --neutral-100: 245 245 245;  // #f5f5f5
  --neutral-200: 229 229 229;  // #e5e5e5
  --neutral-300: 212 212 212;  // #d4d4d4
  --neutral-400: 163 163 163;  // #a3a3a3
  --neutral-500: 115 115 115;  // #737373
  --neutral-600: 82 82 82;     // #525252
  --neutral-700: 64 64 64;     // #404040
  --neutral-800: 38 38 38;     // #262626
  --neutral-900: 23 23 23;     // #171717
  --neutral-950: 10 10 10;     // #0a0a0a

  // Accent Color (Teal - existing brand color)
  --accent-50: 240 253 250;    // #f0fdfa
  --accent-100: 204 251 241;   // #ccfbf1
  --accent-200: 153 246 228;   // #99f6e4
  --accent-300: 94 234 212;    // #5eead4
  --accent-400: 45 212 191;    // #2dd4bf
  --accent-500: 20 184 166;    // #14b8a6 (primary)
  --accent-600: 13 148 136;    // #0d9488
  --accent-700: 15 118 110;    // #0f766e
  --accent-800: 17 94 89;      // #115e59
  --accent-900: 19 78 74;      // #134e4a

  // Semantic Colors
  --success: 142 71% 45%;      // Green (existing)
  --warning: 38 92% 50%;       // Amber
  --error: 0 84% 60%;          // Red (existing)
  --info: 217 91% 60%;         // Blue

  // Background & Foreground
  --background: 0 0% 100%;     // White
  --foreground: 0 0% 9%;       // Near black (#171717)
  
  // Component Backgrounds
  --surface: 0 0% 100%;        // White
  --surface-elevated: 0 0% 98%; // Slightly elevated
  
  // Borders
  --border: 0 0% 90%;          // #e5e5e5
  --border-strong: 0 0% 82%;   // #d4d4d4
}

.dark {
  // Neutral Scale (Dark Mode)
  --neutral-50: 10 10 10;
  --neutral-100: 23 23 23;
  --neutral-200: 38 38 38;
  --neutral-300: 64 64 64;
  --neutral-400: 82 82 82;
  --neutral-500: 115 115 115;
  --neutral-600: 163 163 163;
  --neutral-700: 212 212 212;
  --neutral-800: 229 229 229;
  --neutral-900: 245 245 245;
  --neutral-950: 250 250 250;

  // Background & Foreground
  --background: 0 0% 9%;       // #171717
  --foreground: 0 0% 98%;      // #fafafa
  
  // Component Backgrounds
  --surface: 0 0% 11%;         // #1c1c1c
  --surface-elevated: 0 0% 14%; // #242424
  
  // Borders
  --border: 0 0% 18%;          // #2e2e2e
  --border-strong: 0 0% 24%;   // #3d3d3d
}
```

#### Typography Scale

```typescript
// Font Families (existing)
--font-sans: Inter (body text)
--font-heading: Urbanist (headings)

// Type Scale
text-xs: 12px / 16px (line-height)
text-sm: 14px / 20px
text-base: 16px / 24px
text-lg: 18px / 28px
text-xl: 20px / 28px
text-2xl: 24px / 32px
text-3xl: 30px / 36px

// Font Weights
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700

// Usage Guidelines
- Page titles: text-2xl font-bold
- Section headings: text-lg font-semibold
- Card titles: text-base font-semibold
- Body text: text-sm font-normal
- Labels: text-sm font-medium
- Captions: text-xs font-normal
```

#### Spacing Scale

```typescript
// Base: 4px
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-5: 20px
space-6: 24px
space-8: 32px
space-10: 40px
space-12: 48px
space-16: 64px

// Component Spacing
- Button padding: px-4 py-2 (16px/8px)
- Input padding: px-3 py-2 (12px/8px)
- Card padding: p-6 (24px)
- Page padding: p-6 (24px)
- Section gap: gap-6 (24px)
- Grid gap: gap-4 (16px)
```

#### Shadows

```typescript
// Three levels only
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)

// Usage
- Cards: shadow-sm
- Dropdowns/Popovers: shadow
- Modals: shadow-md
```

#### Border Radii

```typescript
// Three sizes only
rounded-sm: 4px   // Small elements (badges, pills)
rounded: 8px      // Default (buttons, inputs, cards)
rounded-lg: 12px  // Large containers (modals, panels)
```

### 2. Component Library

#### Button Component

```typescript
// Enhanced button variants
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

// Variants
primary: bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800
secondary: bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300
tertiary: border border-neutral-300 bg-transparent hover:bg-neutral-50
destructive: bg-red-600 text-white hover:bg-red-700 active:bg-red-800
ghost: bg-transparent hover:bg-neutral-100 active:bg-neutral-200

// Sizes
sm: h-8 px-3 text-sm
md: h-10 px-4 text-sm
lg: h-12 px-6 text-base

// States
disabled: opacity-50 cursor-not-allowed
loading: opacity-75 cursor-wait [show spinner]
focus: ring-2 ring-accent-500 ring-offset-2
```

#### Input Component

```typescript
interface InputProps {
  size: 'sm' | 'md' | 'lg'
  state: 'default' | 'error' | 'disabled'
  prefix?: ReactNode
  suffix?: ReactNode
}

// Base styles
h-10 px-3 rounded border border-neutral-300
bg-white text-neutral-900
placeholder:text-neutral-400

// States
default: border-neutral-300 focus:border-accent-500 focus:ring-1 focus:ring-accent-500
error: border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500
disabled: bg-neutral-50 text-neutral-400 cursor-not-allowed

// Dark mode
dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100
```

#### Table Component

```typescript
interface TableProps {
  columns: Column[]
  data: any[]
  sortable?: boolean
  selectable?: boolean
  stickyHeader?: boolean
  onRowClick?: (row: any) => void
}

// Structure
<table className="w-full">
  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
        Column Name
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-200">
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <td className="px-4 py-4 text-sm text-neutral-900">
        Cell Content
      </td>
    </tr>
  </tbody>
</table>

// Sticky header
thead: sticky top-0 z-10 bg-white dark:bg-neutral-950

// Row actions
- Dropdown menu on right side
- Icon button with MoreVertical icon
- Actions: View, Edit, Delete, etc.
```

#### Badge Component

```typescript
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
  size: 'sm' | 'md'
}

// Variants (with proper contrast)
default: bg-neutral-100 text-neutral-700 border-neutral-200
success: bg-green-100 text-green-800 border-green-200
warning: bg-amber-100 text-amber-800 border-amber-200
error: bg-red-100 text-red-800 border-red-200
info: bg-blue-100 text-blue-800 border-blue-200

// Dark mode
dark:default: bg-neutral-800 text-neutral-200 border-neutral-700
dark:success: bg-green-900/30 text-green-300 border-green-800
dark:warning: bg-amber-900/30 text-amber-300 border-amber-800
dark:error: bg-red-900/30 text-red-300 border-red-800
dark:info: bg-blue-900/30 text-blue-300 border-blue-800

// Sizes
sm: px-2 py-0.5 text-xs
md: px-2.5 py-1 text-sm
```

#### Filter Bar Component

```typescript
interface FilterBarProps {
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onSearchChange?: (value: string) => void
  onFilterChange?: (filters: Record<string, any>) => void
}

// Layout
<div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200">
  <div className="flex-1">
    <Input
      prefix={<Search className="w-4 h-4 text-neutral-400" />}
      placeholder="Search..."
    />
  </div>
  <div className="flex gap-2">
    <Select>...</Select>
    <Select>...</Select>
  </div>
</div>
```

#### Stats Grid Component

```typescript
interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: ReactNode
}

// Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 rounded-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-neutral-600">Label</p>
      <Icon className="w-5 h-5 text-accent-600" />
    </div>
    <p className="text-2xl font-bold text-neutral-900">Value</p>
    {change && (
      <p className="text-sm text-green-600 mt-1">
        ↑ {change.value}%
      </p>
    )}
  </div>
</div>
```

### 3. Navigation Components

#### Sidebar

```typescript
interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

// Structure
<aside className="w-60 bg-white dark:bg-neutral-900 border-r border-neutral-200 flex flex-col">
  {/* Logo */}
  <div className="h-16 flex items-center px-6 border-b border-neutral-200">
    <Logo />
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    <NavItem
      icon={<LayoutDashboard />}
      label="Dashboard"
      active={true}
      href="/admin"
    />
    <NavItem
      icon={<Building2 />}
      label="Venues"
      badge={5}
      href="/admin/venues"
    />
  </nav>
  
  {/* Footer */}
  <div className="p-4 border-t border-neutral-200">
    <Button variant="ghost" size="sm" fullWidth>
      <Settings className="w-4 h-4" />
      Settings
    </Button>
  </div>
</aside>

// NavItem states
active: bg-accent-50 text-accent-700 border-l-2 border-accent-600
hover: bg-neutral-50
default: text-neutral-700

// Collapsed state
collapsed: w-16 [hide labels, show only icons]
```

#### Top Bar

```typescript
interface TopBarProps {
  onMenuClick?: () => void
}

// Structure
<header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 flex items-center px-6 gap-4">
  {/* Mobile menu button */}
  <Button variant="ghost" size="icon" className="md:hidden">
    <Menu />
  </Button>
  
  {/* Search */}
  <div className="flex-1 max-w-md">
    <Input
      prefix={<Search className="w-4 h-4" />}
      placeholder="Search..."
      size="sm"
    />
  </div>
  
  {/* Actions */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon">
      <Bell className="w-5 h-5" />
      <Badge className="absolute -top-1 -right-1">3</Badge>
    </Button>
    
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar />
      </DropdownMenuTrigger>
    </DropdownMenu>
  </div>
</header>
```

## Data Models

### Page Layout Model

```typescript
interface PageLayout {
  header: {
    title: string
    subtitle?: string
    actions?: Action[]
  }
  filters?: FilterConfig[]
  stats?: StatCard[]
  content: 'table' | 'cards' | 'form' | 'custom'
}

interface Action {
  label: string
  icon?: ReactNode
  variant: ButtonProps['variant']
  onClick: () => void
}

interface FilterConfig {
  type: 'search' | 'select' | 'date' | 'multiselect'
  label: string
  options?: Option[]
  onChange: (value: any) => void
}

interface StatCard {
  label: string
  value: string | number
  icon?: ReactNode
  change?: {
    value: number
    trend: 'up' | 'down'
  }
}
```

### Table Configuration Model

```typescript
interface TableConfig<T> {
  columns: Column<T>[]
  data: T[]
  sortable?: boolean
  selectable?: boolean
  stickyHeader?: boolean
  pagination?: PaginationConfig
  rowActions?: RowAction<T>[]
  onRowClick?: (row: T) => void
}

interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: any, row: T) => ReactNode
  width?: string
}

interface RowAction<T> {
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
}

interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Contrast Ratio Compliance

*For any* text element displayed on a background, the contrast ratio should meet or exceed WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Spacing Consistency

*For any* component using spacing values, all margins and padding should use values from the defined spacing scale (multiples of 4px).

**Validates: Requirements 4.1**

### Property 3: Component State Completeness

*For any* interactive component, all required states (default, hover, pressed, focus, disabled) should be defined and visually distinct.

**Validates: Requirements 3.8**

### Property 4: Border Radius Consistency

*For any* component with rounded corners, the border radius should be one of the three defined values (4px, 8px, 12px).

**Validates: Requirements 4.4**

### Property 5: Shadow Consistency

*For any* component using shadows, the shadow should be one of the three defined levels (sm, default, md).

**Validates: Requirements 4.5**

### Property 6: Typography Scale Adherence

*For any* text element, the font size should be one of the defined values in the typography scale.

**Validates: Requirements 1.4**

### Property 7: Color Token Usage

*For any* color value in components, the color should reference a design token variable rather than a hardcoded value.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 8: Navigation State Visibility

*For any* navigation item, the active state should be visually distinct from the default state with sufficient contrast.

**Validates: Requirements 5.3, 5.4**

### Property 9: Focus Indicator Presence

*For any* focusable element, a visible focus indicator should appear when the element receives keyboard focus.

**Validates: Requirements 14.2**

### Property 10: Touch Target Size

*For any* interactive element, the minimum touch target size should be 44x44px for accessibility.

**Validates: Requirements 14.5**

### Property 11: Loading State Feedback

*For any* asynchronous operation, a loading state should be displayed while the operation is in progress.

**Validates: Requirements 13.1, 13.2**

### Property 12: Error State Recovery

*For any* failed data fetch, an error message and retry mechanism should be provided.

**Validates: Requirements 13.3**

## Error Handling

### API Error Handling

```typescript
interface ErrorState {
  message: string
  code?: string
  retry?: () => void
}

// Error Display Component
<div className="flex flex-col items-center justify-center p-8 gap-4">
  <AlertTriangle className="w-12 h-12 text-red-500" />
  <div className="text-center">
    <h3 className="text-lg font-semibold text-neutral-900">
      Failed to load data
    </h3>
    <p className="text-sm text-neutral-600 mt-1">
      {error.message}
    </p>
  </div>
  <Button onClick={error.retry} variant="secondary">
    <RefreshCw className="w-4 h-4" />
    Try Again
  </Button>
</div>
```

### Form Validation

```typescript
// Inline validation errors
<div className="space-y-1">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    state={errors.email ? 'error' : 'default'}
  />
  {errors.email && (
    <p className="text-sm text-red-600">
      {errors.email.message}
    </p>
  )}
</div>
```

### Empty States

```typescript
<div className="flex flex-col items-center justify-center p-12 gap-4">
  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
    <Icon className="w-8 h-8 text-neutral-400" />
  </div>
  <div className="text-center">
    <h3 className="text-lg font-semibold text-neutral-900">
      No data found
    </h3>
    <p className="text-sm text-neutral-600 mt-1">
      Get started by creating your first item
    </p>
  </div>
  <Button variant="primary">
    <Plus className="w-4 h-4" />
    Create New
  </Button>
</div>
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Component Rendering**: Verify components render with correct props
2. **State Transitions**: Test component state changes (hover, focus, disabled)
3. **Event Handlers**: Test click, change, and submit handlers
4. **Conditional Rendering**: Test empty states, error states, loading states
5. **Accessibility**: Test ARIA attributes, keyboard navigation
6. **Responsive Behavior**: Test layout changes at different breakpoints

### Property-Based Tests

Property tests will verify universal properties across all inputs using **fast-check** library (minimum 100 iterations per test):

1. **Property 1: Contrast Ratio Compliance**
   - Generate random color combinations
   - Verify contrast ratios meet WCAG AA standards
   - **Feature: admin-panel-redesign, Property 1: For any text element displayed on a background, the contrast ratio should meet or exceed WCAG AA standards**

2. **Property 2: Spacing Consistency**
   - Generate random component configurations
   - Verify all spacing values are multiples of 4px
   - **Feature: admin-panel-redesign, Property 2: For any component using spacing values, all margins and padding should use values from the defined spacing scale**

3. **Property 3: Component State Completeness**
   - Generate random component types
   - Verify all required states are defined
   - **Feature: admin-panel-redesign, Property 3: For any interactive component, all required states should be defined and visually distinct**

4. **Property 7: Color Token Usage**
   - Parse component styles
   - Verify no hardcoded color values exist
   - **Feature: admin-panel-redesign, Property 7: For any color value in components, the color should reference a design token variable**

5. **Property 10: Touch Target Size**
   - Generate random interactive elements
   - Verify minimum size of 44x44px
   - **Feature: admin-panel-redesign, Property 10: For any interactive element, the minimum touch target size should be 44x44px**

### Integration Tests

Integration tests will verify:

1. **Navigation Flow**: Test navigation between pages
2. **Data Fetching**: Test API integration and data display
3. **Form Submission**: Test end-to-end form workflows
4. **Filter and Search**: Test data filtering and search functionality
5. **Pagination**: Test table pagination behavior

### Visual Regression Tests

Visual regression tests will verify:

1. **Component Snapshots**: Capture and compare component screenshots
2. **Page Layouts**: Verify page layouts remain consistent
3. **Responsive Breakpoints**: Test layouts at different screen sizes
4. **Theme Switching**: Verify dark mode consistency

### Accessibility Tests

Accessibility tests will verify:

1. **Keyboard Navigation**: Test tab order and keyboard shortcuts
2. **Screen Reader**: Test ARIA labels and announcements
3. **Color Contrast**: Automated contrast ratio checking
4. **Focus Management**: Test focus indicators and focus trapping

## Implementation Notes

### Migration Strategy

1. **Phase 1: Design Tokens**
   - Update CSS variables in globals.css
   - Create token documentation
   - Update Tailwind config

2. **Phase 2: Core Components**
   - Update Button, Input, Badge, Card components
   - Add new Table, FilterBar, StatsGrid components
   - Update component tests

3. **Phase 3: Layout Components**
   - Create new Sidebar and TopBar components
   - Create PageContainer layout component
   - Remove AuroraBackground component

4. **Phase 4: Page Updates**
   - Update Dashboard page
   - Update Venues list page
   - Update Transactions list page
   - Update other admin pages

5. **Phase 5: Polish**
   - Add loading states
   - Add error states
   - Add empty states
   - Accessibility audit

### Performance Considerations

- Use CSS variables for theme switching (no JS required)
- Minimize animation duration (150-200ms max)
- Use `will-change` sparingly
- Lazy load heavy components
- Optimize table rendering for large datasets
- Use virtual scrolling for 100+ rows

### Accessibility Considerations

- Maintain proper heading hierarchy (h1 → h2 → h3)
- Provide skip links for keyboard users
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements
- Provide descriptive ARIA labels
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure minimum 44x44px touch targets
- Provide focus indicators with 3:1 contrast ratio

### Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Responsive Breakpoints

```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large desktop
```

### Dark Mode Strategy

- Use CSS variables for all colors
- Test all components in both modes
- Ensure contrast ratios in both modes
- Provide theme toggle in user menu
- Persist theme preference in localStorage
