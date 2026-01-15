# Design Document: Codebase Refactoring

## Overview

This design outlines a systematic approach to refactoring the Tipsio Next.js application codebase while maintaining zero behavioral changes. The refactoring will be executed in four distinct phases, each targeting specific code quality improvements: cleanup, DRY violations, type safety, and structural organization.

The project uses:
- **Framework**: Next.js 14.2.33 with App Router
- **Language**: TypeScript 5.6.3 (strict mode enabled)
- **Testing**: Vitest with fast-check for property-based testing
- **Styling**: Tailwind CSS
- **Database**: Prisma with PostgreSQL
- **i18n**: next-intl

## Architecture

### Refactoring Phases

The refactoring will follow a sequential, incremental approach:

1. **Phase 1: Cleanup** - Remove dead code, unused imports, and commented code
2. **Phase 2: DRY** - Extract duplicated logic into reusable utilities and hooks
3. **Phase 3: TypeScript** - Improve type safety by reducing `any` usage and adding explicit types
4. **Phase 4: Structure** - Organize imports and resolve structural issues

Each phase will be completed independently with full verification before proceeding to the next.

### Safety Constraints

All refactoring must adhere to these immutable constraints:

- **No UI/UX changes**: DOM structure, CSS classes, and visual appearance remain unchanged
- **No business logic changes**: Algorithms, data processing, and control flow remain identical
- **No API contract changes**: Request/response formats, status codes, and endpoints remain unchanged
- **No i18n changes**: Translation keys and text values remain unchanged
- **No analytics changes**: Event names and payloads remain unchanged
- **No build/deploy changes**: Configuration files remain functionally equivalent

## Components and Interfaces

### Phase 1: Cleanup Module

**Purpose**: Identify and safely remove unused code

**Components**:
- **UnusedImportDetector**: Analyzes import statements and identifies unused imports
- **DeadCodeAnalyzer**: Identifies unused variables, functions, and files
- **CommentCleaner**: Removes commented-out code blocks (preserving documentation comments)

**Interface**:
```typescript
interface CleanupResult {
  filesModified: string[]
  unusedImportsRemoved: number
  deadCodeRemoved: number
  commentsRemoved: number
  safetyNotes: string[]
}
```

**Safety Mechanism**: Before removing any code, verify:
1. No references exist in the codebase (using grep/search)
2. Not used in dynamic imports or string-based references
3. Not exported from public API modules

### Phase 2: DRY Module

**Purpose**: Extract duplicated code patterns into reusable utilities

**Components**:
- **DuplicationDetector**: Identifies repeated code patterns
- **UtilityExtractor**: Creates new utility functions from duplicated code
- **HookExtractor**: Creates custom hooks from duplicated React patterns
- **RefactoringValidator**: Ensures extracted code maintains identical behavior

**Interface**:
```typescript
interface DRYResult {
  filesModified: string[]
  utilitiesCreated: Array<{
    name: string
    path: string
    usageCount: number
  }>
  hooksCreated: Array<{
    name: string
    path: string
    usageCount: number
  }>
  duplicationReduction: number // percentage
}
```

**Target Areas**:
- Repeated formatting logic (dates, currency, numbers)
- Duplicated API call patterns
- Repeated validation logic
- Common React patterns (form handling, data fetching)

### Phase 3: TypeScript Enhancement Module

**Purpose**: Improve type safety without changing runtime behavior

**Components**:
- **AnyTypeAnalyzer**: Identifies `any` types that can be replaced
- **TypeInferencer**: Suggests specific types based on usage
- **PropTypeEnhancer**: Adds explicit prop types to components
- **ReturnTypeEnhancer**: Adds explicit return types to functions

**Interface**:
```typescript
interface TypeSafetyResult {
  filesModified: string[]
  anyTypesReplaced: number
  explicitReturnTypesAdded: number
  propTypesAdded: number
  typeErrors: Array<{
    file: string
    line: number
    message: string
  }>
}
```

**Strategy**:
- Replace `any` with `unknown` where appropriate (safer default)
- Add explicit return types to exported functions
- Add prop types to components with complex props
- Avoid overly complex generic types

### Phase 4: Structure Module

**Purpose**: Organize imports and resolve structural issues

**Components**:
- **ImportOrganizer**: Standardizes import order and grouping
- **CircularDependencyDetector**: Identifies and suggests fixes for circular dependencies
- **PathAliasNormalizer**: Ensures consistent use of path aliases

**Interface**:
```typescript
interface StructureResult {
  filesModified: string[]
  importsOrganized: number
  circularDependenciesResolved: number
  pathAliasesNormalized: number
}
```

**Import Organization Standard**:
```typescript
// 1. External dependencies (node_modules)
import React from 'react'
import { useSession } from 'next-auth/react'

// 2. Internal absolute imports (using @/ alias)
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

// 3. Relative imports
import { LocalComponent } from './LocalComponent'
import type { LocalType } from './types'
```

## Data Models

### Refactoring Metadata

```typescript
interface RefactoringPhase {
  name: 'cleanup' | 'dry' | 'typescript' | 'structure'
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  result?: CleanupResult | DRYResult | TypeSafetyResult | StructureResult
  verificationPassed: boolean
}

interface RefactoringSession {
  phases: RefactoringPhase[]
  totalFilesModified: Set<string>
  verificationCommands: string[]
  followUps: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

После анализа всех acceptance criteria, я выявил следующие тестируемые свойства:

**Testable as Properties:**
- 2.5: Публичные интерфейсы модулей не изменяются
- 4.1/4.3: Импорты организованы последовательно
- 4.2: Отсутствие циклических зависимостей
- 4.5: Обратная совместимость публичных API
- 5.1: Файлы переводов не изменены
- 5.6: Конфигурационные файлы функционально эквивалентны

**Testable as Examples (Verification Steps):**
- 1.5, 2.6, 5.4, 5.5, 5.7: Все существующие тесты проходят
- 3.6, 5.8, 7.1-7.4: Команды lint/typecheck/build/test успешны

**Redundancy Analysis:**
- Свойства 4.1 и 4.3 дублируют друг друга (оба про организацию импортов) → объединяем в одно
- Свойства 2.5 и 4.5 частично пересекаются (оба про публичные API) → объединяем
- Все verification steps (7.1-7.4) по сути проверяют одно: "система компилируется и тесты проходят" → объединяем

### Correctness Properties

Property 1: Translation Files Immutability
*For any* translation file (en.json, ru.json, id.json), the file content before and after refactoring should be byte-identical.
**Validates: Requirements 5.1**

Property 2: Public API Preservation
*For any* module that exports public interfaces, the exported names, types, and signatures should remain unchanged after refactoring.
**Validates: Requirements 2.5, 4.5**

Property 3: Import Organization Consistency
*For any* modified file, imports should be organized in three groups in order: external dependencies, internal absolute imports (using @/ alias), then relative imports, with each group sorted alphabetically.
**Validates: Requirements 4.1, 4.3**

Property 4: Circular Dependency Elimination
*For any* pair of modules in the codebase, there should be no circular import dependencies after refactoring.
**Validates: Requirements 4.2**

Property 5: Build Configuration Equivalence
*For any* build or deployment configuration file (package.json scripts, tsconfig.json, next.config.mjs, docker files), the functional behavior should remain equivalent after refactoring.
**Validates: Requirements 5.6**

Property 6: Test Suite Stability
*For all* existing tests, they should pass both before and after refactoring with identical results.
**Validates: Requirements 1.5, 2.6, 5.4, 5.5, 5.7, 7.4**

Property 7: Compilation Success
*For all* TypeScript compilation, linting, and build processes, they should complete successfully after refactoring.
**Validates: Requirements 3.6, 5.8, 7.1, 7.2, 7.3**

## Error Handling

### Refactoring Errors

**Detection Strategy:**
- After each phase, run verification commands (lint, typecheck, build, test)
- If any command fails, identify the specific files causing the failure
- Analyze the error messages to determine if it's a refactoring issue or pre-existing

**Recovery Strategy:**
1. **Immediate Rollback**: If a phase introduces errors, revert all changes from that phase
2. **Incremental Retry**: Re-apply changes file-by-file to isolate the problematic change
3. **Skip and Document**: If a specific change is risky, skip it and document as a follow-up

**Error Categories:**

1. **Type Errors**: TypeScript compilation fails
   - Cause: Incorrect type inference or overly strict types
   - Fix: Revert type changes or use more permissive types (e.g., `unknown` instead of specific type)

2. **Import Errors**: Module resolution fails
   - Cause: Incorrect path after reorganization
   - Fix: Verify all import paths and aliases

3. **Test Failures**: Existing tests fail
   - Cause: Behavioral change introduced accidentally
   - Fix: Revert the change that caused the failure

4. **Build Errors**: Next.js build fails
   - Cause: Invalid syntax or missing dependencies
   - Fix: Check for syntax errors and verify all imports

### Safety Checks

Before each file modification:
1. **Backup**: Keep original content in memory for potential rollback
2. **Syntax Validation**: Ensure modified code is syntactically valid
3. **Import Validation**: Verify all imports resolve correctly
4. **Test Execution**: Run tests related to modified files

After each phase:
1. **Full Verification**: Run all verification commands
2. **Diff Review**: Review all changes for unintended modifications
3. **Manual Smoke Test**: Test critical user flows manually

## Testing Strategy

### Dual Testing Approach

The refactoring will use both **verification testing** (running existing tests) and **property-based testing** (for specific refactoring properties).

**Existing Test Suite (Primary Safety Net):**
- Unit tests: Verify specific component and function behavior
- Property tests: Verify universal properties across inputs
- Integration tests: Verify API endpoints and data flows
- Component tests: Verify React component rendering

All existing tests MUST pass after each refactoring phase. This is the primary mechanism for ensuring zero behavioral changes.

**Refactoring-Specific Property Tests:**

We will create new property-based tests to verify refactoring-specific properties:

1. **Translation Immutability Test**
   - Compare translation file hashes before/after
   - Minimum 1 iteration (deterministic check)
   - Tag: **Feature: codebase-refactoring, Property 1: Translation Files Immutability**

2. **Public API Preservation Test**
   - Extract all exported names from modules before/after
   - Compare export signatures
   - Minimum 1 iteration per module
   - Tag: **Feature: codebase-refactoring, Property 2: Public API Preservation**

3. **Import Organization Test**
   - Parse imports from modified files
   - Verify grouping and sorting
   - Minimum 1 iteration per file
   - Tag: **Feature: codebase-refactoring, Property 3: Import Organization Consistency**

4. **Circular Dependency Test**
   - Build dependency graph
   - Detect cycles using graph traversal
   - Minimum 1 iteration (deterministic check)
   - Tag: **Feature: codebase-refactoring, Property 4: Circular Dependency Elimination**

### Verification Commands

After each phase, run these commands in order:

```bash
# 1. Linting
npm run lint

# 2. Type checking
npx tsc --noEmit

# 3. Build
npm run build

# 4. Tests
npm test

# 5. i18n validation
npm run i18n:validate
```

All commands must succeed before proceeding to the next phase.

### Manual Smoke Testing

After all phases complete, manually verify:

1. **Landing Page** (http://localhost:3000)
   - Page loads without errors
   - All sections render correctly
   - Language switcher works
   - CTA buttons are functional

2. **Admin Panel** (http://localhost:3000/admin)
   - Login works
   - Dashboard loads
   - Navigation works
   - Data displays correctly

3. **Venue Dashboard** (http://localhost:3000/venue/dashboard)
   - Login works
   - Dashboard loads
   - QR code management works
   - Staff management works

### Property-Based Testing Configuration

- **Library**: fast-check (already in devDependencies)
- **Minimum iterations**: 100 for non-deterministic properties, 1 for deterministic checks
- **Test location**: `.kiro/specs/codebase-refactoring/refactoring.property.test.ts`
- **Execution**: Part of `npm test` suite

### Testing Balance

- **Existing tests**: Primary safety mechanism (comprehensive coverage)
- **New property tests**: Verify refactoring-specific invariants
- **Manual tests**: Catch visual/UX regressions not covered by automated tests

The existing test suite provides the main confidence that behavior hasn't changed. New property tests add specific checks for refactoring goals (import organization, API preservation, etc.).

## Implementation Phases

### Phase 1: Cleanup (Estimated: 2-3 hours)

**Scope:**
- Remove unused imports (using ESLint auto-fix)
- Remove unused variables and functions (manual review + removal)
- Remove commented-out code blocks
- Remove unused files (after verification)

**Tools:**
- ESLint with `no-unused-vars` rule
- TypeScript compiler unused checks
- Manual code review

**Verification:**
- `npm run lint` passes
- `npm run build` succeeds
- `npm test` passes

### Phase 2: DRY (Estimated: 4-6 hours)

**Scope:**
- Extract repeated formatting logic
- Extract repeated validation patterns
- Extract repeated API call patterns
- Create custom hooks for repeated React patterns

**Target Areas:**
- Date/currency formatting (multiple files use similar logic)
- Form validation (repeated patterns in venue/staff forms)
- API error handling (duplicated across API routes)
- Data fetching patterns (similar useEffect patterns)

**Verification:**
- All tests pass
- No behavioral changes
- Code coverage maintained or improved

### Phase 3: TypeScript (Estimated: 3-4 hours)

**Scope:**
- Replace `any` with specific types or `unknown`
- Add explicit return types to exported functions
- Add prop types to complex components
- Improve type inference where possible

**Strategy:**
- Start with leaf modules (no dependencies)
- Work up to higher-level modules
- Avoid breaking changes to public APIs

**Verification:**
- `npx tsc --noEmit` passes with no new errors
- All tests pass
- No runtime behavior changes

### Phase 4: Structure (Estimated: 2-3 hours)

**Scope:**
- Organize imports in all modified files
- Resolve circular dependencies (if found)
- Normalize path alias usage
- Ensure consistent file organization

**Import Standard:**
```typescript
// External
import React from 'react'
import { useSession } from 'next-auth/react'

// Internal (@/ alias)
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

// Relative
import { LocalComponent } from './LocalComponent'
```

**Verification:**
- All imports resolve correctly
- Build succeeds
- No circular dependency warnings

## Follow-Up Opportunities

These improvements are identified but carry higher risk or require more extensive changes. They should be considered for future work:

1. **Component Decomposition**: Some large components (e.g., dashboard pages) could be split into smaller components
2. **API Route Consolidation**: Similar API routes could share more common middleware
3. **Test Coverage Expansion**: Some modules have limited test coverage
4. **Performance Optimization**: Some components could benefit from memoization
5. **Accessibility Improvements**: Some components could have better ARIA labels

These are intentionally excluded from this refactoring to maintain the zero behavioral change constraint.
