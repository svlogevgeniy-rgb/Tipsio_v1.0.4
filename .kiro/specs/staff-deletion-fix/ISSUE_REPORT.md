# Staff Deletion Bug - Issue Report

## Problem Description

Staff members cannot be deleted on production (tipsio.tech). After clicking delete, the staff member disappears from the UI temporarily, but returns after page refresh.

## Root Cause Analysis

### Database Constraints

Investigation of production database revealed foreign key constraints blocking deletion:

```sql
-- Constraints on Staff table
TipAllocation_staffId_fkey: confdeltype = 'r' (RESTRICT)
Tip_staffId_fkey: confdeltype = 'n' (NO ACTION)
```

### Prisma Schema Issues

The Prisma schema is missing `onDelete` actions:

```prisma
model TipAllocation {
  staffId  String
  staff    Staff   @relation(fields: [staffId], references: [id])
  // Missing: onDelete action
}

model Tip {
  staffId     String?
  staff       Staff?  @relation(fields: [staffId], references: [id])
  // Missing: onDelete: SetNull
}
```

### Current API Behavior

File: `src/app/api/staff/[id]/route.ts`

The DELETE endpoint attempts to:
1. Check if staff has tips (`_count.tips > 0`)
2. If yes → soft delete (set INACTIVE)
3. If no → hard delete with `prisma.staff.delete()`

**Problem:** The check only counts `tips`, but doesn't check `allocations`. When staff has TipAllocation records (which is common after tips are distributed), the hard delete fails due to database RESTRICT constraint.

### Why It Appears to Work in UI

The client-side code (`use-staff-management.ts`) optimistically removes the staff from local state:

```typescript
if (response.ok) {
  setStaff((prev) => prev.filter((s) => s.id !== staffMember.id));
}
```

But the database operation fails silently, so on page refresh, the staff reappears.

## Impact

- Users cannot delete staff members who have received tip allocations
- Confusing UX - staff appears deleted but returns
- No error message shown to user

## Solution Required

1. Fix Prisma schema to add proper `onDelete` actions
2. Update DELETE logic to check for TipAllocation records
3. Always use soft delete when staff has financial history
4. Show clear messaging to users about soft vs hard delete

## Test Case

Venue: TestMid@gmail.com (venue ID: cml7t8jaf000146v36zp19nhh)
- Staff members with tip allocations cannot be deleted
- After "delete", they reappear on page refresh

## Priority

**HIGH** - Core functionality broken on production
