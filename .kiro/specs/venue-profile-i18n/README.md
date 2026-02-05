# Venue Profile Internationalization (TIPS-53)

## Overview
Add internationalization support to the venue profile page to enable English, Indonesian, and Russian language switching.

## Problem
The venue profile page currently displays all text in Russian only, with no translation support. The Language Switcher component is present but has no effect on the page content.

## Solution
Integrate the existing i18n system by:
1. Adding translation keys to `messages/*.json` files
2. Using `useTranslations` hook in the profile component
3. Replacing all hardcoded Russian text with translation calls

## Files
- **Requirements**: `requirements.md` - Detailed requirements with acceptance criteria
- **Design**: `design.md` - Technical design and implementation approach
- **Tasks**: `tasks.md` - Step-by-step implementation tasks
- **Task Description**: `TASK.md` - Issue-style task description

## Quick Start
1. Review requirements and design documents
2. Follow tasks in `tasks.md` sequentially
3. Test language switching after implementation

## Languages Supported
- English (en)
- Indonesian (id)
- Russian (ru)

## Related
- **Previous Task**: TIPS-52 (Venue Profile Simplification)
- **Affected Page**: `/venue/profile`
- **Translation System**: `@/i18n/client` with `useTranslations` hook
