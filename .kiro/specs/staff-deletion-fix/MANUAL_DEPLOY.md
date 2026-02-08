# Manual Deployment Instructions - Staff Deletion Fix (TIPS-58)

## Problem Summary

Staff members cannot be deleted on production. After deletion, they reappear on page refresh because:
- API only checks `_count.tips` but not `_count.allocations`
- Database has RESTRICT constraint on TipAllocation → Staff
- When staff has allocations, hard delete fails silently

## Solution Implemented

Enhanced DELETE API to:
1. Check both tips AND allocations
2. Use soft delete (INACTIVE) when financial history exists
3. Fallback to soft delete if hard delete fails due to constraints

## Files Changed

- `src/app/api/staff/[id]/route.ts` - Enhanced deletion logic

## Deployment Steps

### Option 1: SSH Deployment (if SSH is available)

```bash
# 1. Copy fixed file to server
scp src/app/api/staff/\[id\]/route.ts root@31.130.155.71:/var/www/tipsio/src/app/api/staff/\[id\]/route.ts

# 2. SSH into server
ssh root@31.130.155.71

# 3. Restart application
cd /var/www/tipsio
pm2 restart tipsio
pm2 save

# 4. Check logs
pm2 logs tipsio --lines 50
```

### Option 2: Manual File Transfer (if SSH times out)

1. **Download the fixed file from local:**
   - File location: `src/app/api/staff/[id]/route.ts`
   - Or use the file from commit `b517733`

2. **Access server via alternative method:**
   - Use hosting provider's file manager
   - Or use FTP/SFTP client
   - Or use web-based SSH terminal

3. **Upload file to server:**
   - Target path: `/var/www/tipsio/src/app/api/staff/[id]/route.ts`
   - Backup original file first!

4. **Restart application:**
   ```bash
   cd /var/www/tipsio
   pm2 restart tipsio
   pm2 save
   ```

### Option 3: Git Pull (if git remote is configured)

```bash
# On server
cd /var/www/tipsio
git pull origin main
pm2 restart tipsio
pm2 save
```

## Testing After Deployment

### Test 1: Soft Delete (Staff with Financial History)

1. Login to https://tipsio.tech/venue/login
   - Email: TestMid@gmail.com
   - Password: (your password)

2. Navigate to Staff page

3. Find staff member with tip allocations (e.g., Testing_Waiter_2)

4. Click delete button

5. **Expected result:**
   - Staff status changes to INACTIVE
   - Staff remains in list (grayed out or marked inactive)
   - After page refresh, staff still shows as INACTIVE
   - Message: "Staff deactivated (has financial history)"

### Test 2: Hard Delete (Staff without History)

1. Create new test staff member

2. Immediately delete (before any tips)

3. **Expected result:**
   - Staff is permanently removed
   - After page refresh, staff is gone
   - Message: "Staff deleted successfully"

### Test 3: Verify No Errors

1. Open browser DevTools (F12)

2. Check Console tab for errors

3. Check Network tab for failed requests

4. **Expected result:**
   - No console errors
   - DELETE request returns 200 OK
   - Response includes `softDeleted: true/false`

## Rollback Plan

If issues occur after deployment:

```bash
# On server
cd /var/www/tipsio

# Option 1: Restore from backup
cp /var/www/tipsio/src/app/api/staff/\[id\]/route.ts.backup /var/www/tipsio/src/app/api/staff/\[id\]/route.ts

# Option 2: Git revert
git revert b517733
pm2 restart tipsio
pm2 save
```

## Verification Checklist

- [ ] File uploaded to correct location
- [ ] PM2 restarted successfully
- [ ] No errors in PM2 logs
- [ ] Staff with allocations can be "deleted" (deactivated)
- [ ] Staff without history can be hard deleted
- [ ] Page refresh shows correct state
- [ ] No console errors in browser
- [ ] Appropriate messages shown to user

## Support

If deployment fails or issues persist:
- Check PM2 logs: `pm2 logs tipsio --lines 100`
- Check application logs: `tail -f /var/www/tipsio/logs/*.log`
- Verify file permissions: `ls -la /var/www/tipsio/src/app/api/staff/[id]/`

## Commit Information

- **Commit:** b517733
- **Message:** "fix: Fix staff deletion bug - check TipAllocation before delete (TIPS-58)"
- **Date:** 2026-02-08
- **Files changed:** 1 file, 44 insertions(+), 16 deletions(-)
