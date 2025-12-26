# Requirements Document

## Introduction

This specification defines updates to the landing page positioning, content, visual design, and user interface consistency. The changes focus on repositioning TIPSIO as a "guest experience platform," removing outdated benefit points, unifying button styles across the landing page, and replacing the hero dashboard visualization with a modern product-style image. All changes must preserve existing functionality, responsive design, SEO, and analytics while maintaining the shadcn/ui design system aesthetic.

## Glossary

- **Hero Section**: The first visible section of the landing page containing the main headline, subheadline, and call-to-action
- **Hero Text**: The main headline and subheadline text in the hero section
- **Benefit Points**: Individual feature or advantage items displayed in the benefits/features section
- **Brand Blue**: The primary brand color used for interactive elements and hover states
- **Button Variant**: A predefined style configuration for button components in the shadcn/ui system
- **Hero Image**: The visual representation (dashboard mockup) displayed in the hero section
- **shadcn/ui**: The UI component library and design system used throughout the application
- **Non-breaking Space**: HTML entity (&nbsp;) used to prevent line breaks between specific words
- **CTA (Call-to-Action)**: Interactive button elements that prompt users to take action
- **Layout Shift**: Visual instability caused by content moving after initial page load
- **Responsive Design**: Layout that adapts appropriately across mobile and desktop viewports

## Requirements

### Requirement 1

**User Story:** As a visitor viewing the landing page, I want to see updated positioning text that describes TIPSIO as a guest experience platform, so that I understand the broader value proposition beyond just tipping.

#### Acceptance Criteria

1. WHEN the landing page hero section loads THEN the System SHALL display the headline "Цифровая платформа гостевого опыта, в которой люди работают с людьми."
2. WHEN the landing page hero section loads THEN the System SHALL display the subheadline "Бесплатное подключение. Гостям вашего заведения будет удобнее, а персоналу — проще."
3. WHEN the hero text is rendered THEN the System SHALL use non-breaking spaces (&nbsp;) between "в которой", "с людьми", "вашего заведения", and "а персоналу —"
4. WHEN the hero text spans multiple lines THEN the System SHALL maintain proper line height and spacing without visual breaks
5. WHEN the updated text is displayed THEN the System SHALL preserve existing typography styles, font sizes, and responsive behavior

### Requirement 2

**User Story:** As a visitor browsing the landing page benefits, I want to see only current and relevant advantages, so that I'm not confused by outdated or removed features.

#### Acceptance Criteria

1. WHEN the benefits section renders THEN the System SHALL NOT display the benefit point "Гостям не нужно приложение"
2. WHEN the benefits section renders THEN the System SHALL NOT display the benefit point "Прямые выплаты (без посредников)"
3. WHEN benefit points are removed THEN the System SHALL maintain proper grid layout without gaps or misalignment
4. WHEN benefit points are removed from data sources THEN the System SHALL remove them from arrays or configuration objects, not hide them with CSS
5. WHEN the benefits section renders THEN the System SHALL display remaining benefit points with consistent spacing and alignment

### Requirement 3

**User Story:** As a visitor interacting with the landing page, I want all buttons to have consistent styling with white default state and brand blue hover, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. WHEN a landing page button is in default state THEN the System SHALL render it with white background color
2. WHEN a user hovers over a landing page button THEN the System SHALL transition the background to brand blue color
3. WHEN button hover state is active THEN the System SHALL maintain readable text contrast against the brand blue background
4. WHEN buttons use shadcn/ui Button component THEN the System SHALL apply a unified variant (e.g., "landing" or "brand") across all landing page buttons
5. WHEN button states change THEN the System SHALL preserve focus-visible, disabled, and active state styling without visual breaks

### Requirement 4

**User Story:** As a visitor viewing the hero section, I want to see a modern product visualization that reflects the shadcn/ui aesthetic, so that I can better understand what the platform looks like.

#### Acceptance Criteria

1. WHEN the hero section loads THEN the System SHALL display a new hero image in place of the current dashboard mockup
2. WHEN the new hero image is rendered THEN the System SHALL display a modern UI mockup with card-based layout, rounded corners, and subtle shadows consistent with shadcn/ui style
3. WHEN the hero image is displayed THEN the System SHALL provide WebP format with PNG fallback for browser compatibility
4. WHEN the hero image loads on desktop THEN the System SHALL use an asset with width between 1400-1800px
5. WHEN the hero image loads on mobile THEN the System SHALL use an asset with width between 800-1000px optimized for smaller screens
6. WHEN the hero image is rendered THEN the System SHALL maintain proper aspect ratio and prevent layout shift during load
7. WHEN the hero image is displayed THEN the System SHALL NOT contain real personal data, recognizable third-party brands, or logos
8. WHEN the hero image file is served THEN the System SHALL have optimized file size (target: 250-400KB for WebP format)

### Requirement 5

**User Story:** As a developer, I want all changes to pass build validation and maintain existing functionality, so that the landing page remains stable and deployable.

#### Acceptance Criteria

1. WHEN npm run build executes THEN the System SHALL complete without errors or warnings related to the changes
2. WHEN the landing page loads THEN the System SHALL NOT produce runtime errors in the browser console
3. WHEN responsive layouts are tested THEN the System SHALL display correctly on mobile (320px-768px) and desktop (769px+) viewports
4. WHEN layout shift is measured THEN the System SHALL maintain or improve Cumulative Layout Shift (CLS) score compared to baseline
5. WHEN existing features are accessed THEN the System SHALL maintain all current functionality including i18n, SEO metadata, and analytics tracking
