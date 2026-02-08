# Implementation Plan: Staff Deletion Fix

## Overview

Fix staff deletion bug by checking TipAllocation records and implementing proper fallback logic.

## Tasks

- [x] 1. Fix DELETE API endpoint
  - Enhanced query to include allocations count
  - Added financial history check (tips OR allocations)
  - Implemented try-catch with fallback to soft delete
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2_

- [ ] 2. Deploy to production
  - [ ] 2.1 Copy fixed file to production server
    - Use SCP or manual file transfer
    - Target: `/var/www/tipsio/src/app/api/staff/[id]/route.ts`
    - _Requirements: N/A_

  - [ ] 2.2 Restart PM2 application
    - Run: `pm2 restart tipsio`
    - Run: `pm2 save`
    - _Requirements: N/A_

  - [ ] 2.3 Verify deployment
    - Check PM2 logs for errors
    - Test staff deletion on production
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Manual testing on production
  - [ ] 3.1 Test soft delete with financial history
    - Login to TestMid@gmail.com
    - Try to delete staff with tip allocations
    - Verify staff is deactivated (INACTIVE status)
    - Refresh page and verify staff still shows
    - _Requirements: 2.1, 2.2, 3.1_

  - [ ] 3.2 Test hard delete without history
    - Create new test staff member
    - Delete immediately (no tips/allocations)
    - Verify staff is permanently removed
    - _Requirements: 2.3, 2.5_

  - [ ] 3.3 Verify error messages
    - Check that appropriate messages are shown
    - Verify no console errors
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Documentation
  - [ ] 4.1 Create deployment report
    - Document what was fixed
    - Include test results
    - Note any issues encountered
    - _Requirements: N/A_

## Notes

- Code changes already committed locally (commit b517733)
- SSH connection to production server is currently timing out
- Manual deployment may be required
- No database migrations needed
- No Prisma schema changes required
