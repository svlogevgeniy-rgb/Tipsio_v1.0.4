# Design Tokens Documentation

This document describes the design token system for the Tips.io admin panel redesign.

## Color System

### Neutral Scale

A 11-step grayscale palette for text, backgrounds, and borders.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `neutral-50` | `#fafafa` | `#0a0a0a` | Subtle backgrounds |
| `neutral-100` | `#f5f5f5` | `#171717` | Card backgrounds, hover states |
| `neutral-200` | `#e5e5e5` | `#262626` | Borders, dividers |
| `neutral-300` | `#d4d4d4` | `#404040` | Strong borders |
| `neutral-400` | `#a3a3a3` | `#525252` | Placeholder text |
| `neutral-500` | `#737373` | `#737373` | Secondary text |
| `neutral-600` | `#525252` | `#a3a3a3` | Body text |
| `neutral-700` | `#404040` | `#d4d4d4` | Headings |
| `neutral-800` | `#262626` | `#e5e5e5` | Strong text |
| `neutral-900` | `#171717` | `#f5f5f5` | Primary text |
| `neutral-950` | `#0a0a0a` | `#fafafa` | Maximum contrast |

**Usage in Tailwind:**
```tsx
<div className="bg-neutral-100 text-neutral-900 border-neutral-200">
  Content
</div>
```

### Accent Color (Teal)

Brand color palette based on teal/cyan.

| Token | Value | Usage |
|-------|-------|-------|
| `accent-50` | `#f0fdfa` | Lightest tint |
| `accent-100` | `#ccfbf1` | Very light backgrounds |
| `accent-200` | `#99f6e4` | Light backgrounds |
| `accent-300` | `#5eead4` | Subtle accents |
| `accent-400` | `#2dd4bf` | Hover states |
| `accent-500` | `#14b8a6` | **Primary brand color** |
| `accent-600` | `#0d9488` | Active states |
| `accent-700` | `#0f766e` | Pressed states |
| `accent-800` | `#115e59` | Dark accents |
| `accent-900` | `#134e4a` | Darkest tint |

**Usage in Tailwind:**
```tsx
<button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white">
  Primary Action
</button>
```

### Semantic Colors

Colors with specific meanings.

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `hsl(142 71% 45%)` | Success states, positive feedback |
| `warning` | `hsl(38 92% 50%)` | Warning states, caution |
| `error` | `hsl(0 84% 60%)` | Error states, destructive actions |
| `info` | `hsl(217 91% 60%)` | Informational messages |

**Usage in Tailwind:**
```tsx
<div className="bg-green-100 text-green-800 border-green-200">
  Success message
</div>
```

### Surface Colors

Background colors for components.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `surface` | `#ffffff` | `#1c1c1c` | Card backgrounds |
| `surface-elevated` | `#fafafa` | `#242424` | Elevated cards, modals |

### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `border` | `#e5e5e5` | `#2e2e2e` | Default borders |
| `border-strong` | `#d4d4d4` | `#3d3d3d` | Emphasized borders |

## Typography

### Font Families

- **Sans (Body)**: Inter
- **Heading**: Urbanist

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Captions, labels |
| `text-sm` | 14px | 20px | Body text, table cells |
| `text-base` | 16px | 24px | Default body text |
| `text-lg` | 18px | 28px | Section headings |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Page titles |
| `text-3xl` | 30px | 36px | Hero titles |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, emphasized text |
| `font-semibold` | 600 | Headings, buttons |
| `font-bold` | 700 | Page titles |

### Typography Guidelines

```tsx
// Page title
<h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

// Section heading
<h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>

// Card title
<h3 className="text-base font-semibold text-neutral-900">Venue Details</h3>

// Body text
<p className="text-sm text-neutral-600">Description text</p>

// Label
<label className="text-sm font-medium text-neutral-700">Email</label>

// Caption
<span className="text-xs text-neutral-500">Last updated 2 hours ago</span>
```

## Spacing

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Small gaps |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Default spacing |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Large spacing |
| `space-10` | 40px | Extra large spacing |
| `space-12` | 48px | Section spacing |
| `space-16` | 64px | Page spacing |

**Usage in Tailwind:**
```tsx
<div className="p-6 gap-4">
  <div className="mb-6">Section</div>
</div>
```

## Shadows

Three levels only for consistency.

| Class | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards, subtle elevation |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Dropdowns, popovers |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Modals, dialogs |

**Usage:**
```tsx
<div className="shadow-sm">Card</div>
<div className="shadow">Dropdown</div>
<div className="shadow-md">Modal</div>
```

## Border Radius

Three sizes for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, pills, small elements |
| `rounded` | 8px | Buttons, inputs, cards (default) |
| `rounded-lg` | 12px | Modals, large containers |

**Usage:**
```tsx
<button className="rounded">Button</button>
<div className="rounded-lg">Card</div>
<span className="rounded-sm">Badge</span>
```

## Component Patterns

### Buttons

```tsx
// Primary
<button className="h-10 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded">
  Primary
</button>

// Secondary
<button className="h-10 px-4 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 rounded">
  Secondary
</button>

// Tertiary
<button className="h-10 px-4 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded">
  Tertiary
</button>

// Destructive
<button className="h-10 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded">
  Delete
</button>
```

### Inputs

```tsx
<input 
  className="h-10 px-3 border border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded"
  placeholder="Enter text..."
/>
```

### Cards

```tsx
<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm p-6">
  Card content
</div>
```

### Badges

```tsx
// Success
<span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded-sm text-xs font-medium">
  Active
</span>

// Warning
<span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-sm text-xs font-medium">
  Pending
</span>

// Error
<span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-sm text-xs font-medium">
  Failed
</span>
```

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (≥ 18px or ≥ 14px bold): minimum 3:1 contrast ratio
- UI components and borders: minimum 3:1 contrast ratio

### Focus States

All interactive elements must have visible focus indicators:

```tsx
<button className="focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
  Button
</button>
```

### Touch Targets

All interactive elements must be at least 44x44px:

```tsx
<button className="h-10 px-4">Button</button> // 40px height
<button className="h-11 px-4">Button</button> // 44px height (better)
```

## Dark Mode

All components support dark mode using the `.dark` class:

```tsx
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
  Content
</div>
```

## Migration Guide

### Replacing Glass Effects

**Before:**
```tsx
<div className="glass">Content</div>
```

**After:**
```tsx
<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
  Content
</div>
```

### Replacing Old Colors

| Old | New |
|-----|-----|
| `bg-primary` | `bg-teal-600` |
| `text-primary` | `text-teal-600` |
| `border-white/10` | `border-neutral-200 dark:border-neutral-700` |
| `text-muted-foreground` | `text-neutral-600 dark:text-neutral-400` |

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
