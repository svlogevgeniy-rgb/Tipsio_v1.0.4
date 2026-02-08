# Design Document - Staff Deletion Fix

## Overview

Fix the staff deletion functionality by properly checking for TipAllocation records before attempting deletion, and implementing robust fallback to soft delete when database constraints prevent hard deletion.

## Architecture

### Current Flow (Broken)
```
DELETE /api/staff/[id]
  ↓
Check _count.tips only
  ↓
If tips > 0 → Soft delete
If tips = 0 → Hard delete ❌ FAILS if allocations exist
```

### Fixed Flow
```
DELETE /api/staff/[id]
  ↓
Check _count.tips AND _count.allocations
  ↓
If tips > 0 OR allocations > 0 → Soft delete
If both = 0 → Try hard delete
  ↓
If hard delete fails → Fallback to soft delete
```

## Components and Interfaces

### API Endpoint: DELETE /api/staff/[id]

**Input:**
- Path parameter: `id` (staff ID)
- Session: authenticated user

**Output:**
```typescript
{
  message: string;
  softDeleted: boolean;
}
```

**Logic Changes:**

1. **Enhanced Query** - Include allocations count:
```typescript
const staff = await prisma.staff.findUnique({
  where: { id },
  include: {
    venue: { select: { managerId: true } },
    qrCode: true,
    _count: {
      select: { 
        tips: true,
        allocations: true,  // ← ADDED
      },
    },
  },
});
```

2. **Financial History Check**:
```typescript
const hasFinancialHistory = 
  staff._count.tips > 0 || 
  staff._count.allocations > 0;
```

3. **Deletion Strategy**:
```typescript
if (hasFinancialHistory) {
  // Soft delete - set INACTIVE
  await prisma.$transaction([
    prisma.staff.update({ 
      where: { id }, 
      data: { status: "INACTIVE" } 
    }),
    // Also deactivate QR code if exists
  ]);
  return { softDeleted: true };
}

// Try hard delete
try {
  await prisma.$transaction([
    // Delete QR code if exists
    prisma.staff.delete({ where: { id } }),
  ]);
  return { softDeleted: false };
} catch (error) {
  // Fallback to soft delete if constraints prevent hard delete
  await prisma.$transaction([
    prisma.staff.update({ 
      where: { id }, 
      data: { status: "INACTIVE" } 
    }),
  ]);
  return { softDeleted: true };
}
```

### Client Hook: useStaffManagement

**No changes required** - already handles response correctly:
```typescript
const deleteStaff = async (staffMember: Staff) => {
  const response = await fetch(`/api/staff/${staffMember.id}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    setStaff((prev) => prev.filter((s) => s.id !== staffMember.id));
  } else {
    throw new Error('Failed to delete staff');
  }
};
```

## Data Models

### Prisma Schema - No Changes Needed

Current schema already has correct constraints:
```prisma
model TipAllocation {
  staffId  String
  staff    Staff   @relation(fields: [staffId], references: [id])
  // Default: Restrict (prevents deletion) ✓ CORRECT
}

model Tip {
  staffId     String?
  staff       Staff?  @relation(fields: [staffId], references: [id])
  // Default: No Action (prevents deletion) ✓ ACCEPTABLE
}
```

**Why no schema changes:**
- TipAllocation RESTRICT is correct - we want to preserve financial records
- Tip relationship can stay as-is - we handle it in application logic
- Adding `onDelete: SetNull` to Tip would lose data integrity

## Error Handling

### Database Constraint Errors

When hard delete fails due to foreign key constraints:
```typescript
catch (deleteError) {
  console.error("Hard delete failed, performing soft delete:", deleteError);
  // Fallback to soft delete
}
```

### User-Facing Messages

- **Soft delete (has history)**: "Staff deactivated (has financial history)"
- **Hard delete (success)**: "Staff deleted successfully"  
- **Soft delete (fallback)**: "Staff deactivated (has related records)"

## Testing Strategy

### Unit Tests

1. **Test soft delete when tips exist**
   - Create staff with tips
   - Call DELETE
   - Verify status = INACTIVE
   - Verify staff still in database

2. **Test soft delete when allocations exist**
   - Create staff with allocations
   - Call DELETE
   - Verify status = INACTIVE
   - Verify staff still in database

3. **Test hard delete when no history**
   - Create staff with no tips/allocations
   - Call DELETE
   - Verify staff removed from database

4. **Test fallback to soft delete**
   - Mock database constraint error
   - Call DELETE
   - Verify falls back to soft delete

### Integration Tests

1. **End-to-end deletion flow**
   - Login as venue manager
   - Navigate to staff page
   - Delete staff member
   - Refresh page
   - Verify staff status updated correctly

### Manual Testing on Production

1. Login to TestMid@gmail.com venue
2. Try to delete staff with tip allocations
3. Verify staff is deactivated (not deleted)
4. Refresh page
5. Verify staff still shows as INACTIVE

## Deployment Notes

### Files Changed
- `src/app/api/staff/[id]/route.ts` - Enhanced deletion logic

### Database Migrations
- None required

### Rollback Plan
If issues occur, revert to previous version:
```bash
git revert <commit-hash>
pm2 restart tipsio
```

### Monitoring
After deployment, monitor:
- PM2 logs for deletion errors
- User reports of staff reappearing
- Database for orphaned records
