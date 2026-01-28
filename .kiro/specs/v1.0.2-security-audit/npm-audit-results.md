# npm Audit Results - v.1.0.2

**Date:** 2026-01-15  
**Command:** `npm audit --audit-level=high`

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 4 |
| Moderate | 0 |
| Low | 2 |
| **Total** | **6** |

**Dependencies:**
- Production: 431
- Development: 475
- Optional: 143
- **Total:** 951

## High Severity Vulnerabilities (4)

### 1. Next.js - Denial of Service with Server Components

**Package:** `next`  
**Severity:** 🔴 HIGH  
**CVSS Score:** 7.5  
**Affected Versions:** 13.3.0 - 14.2.34  
**Current Version:** (in range)

**Vulnerabilities:**
- **GHSA-mwv6-3258-q52c:** Next Vulnerable to Denial of Service with Server Components
- **GHSA-5j59-xgg2-r9c4:** Incomplete Fix Follow-Up

**CWE:**
- CWE-400: Uncontrolled Resource Consumption
- CWE-502: Deserialization of Untrusted Data
- CWE-1395: Dependency on Vulnerable Third-Party Component

**Fix Available:** ✅ Yes  
**Fix Version:** 14.2.35 (non-breaking)  
**Fix Command:** `npm audit fix` or `npm install next@14.2.35`

**Recommendation:** 🟢 **UPDATE IMMEDIATELY** - Non-breaking fix available

---

### 2. Hono - JWT Algorithm Confusion (2 issues)

**Package:** `hono`  
**Severity:** 🔴 HIGH  
**CVSS Score:** 8.2  
**Affected Versions:** <=4.11.3  
**Dependency Chain:** hono → @prisma/dev → prisma

**Vulnerabilities:**
- **GHSA-3vhc-576x-3qv4:** JWK Auth Middleware JWT algorithm confusion when JWK lacks "alg"
- **GHSA-f67f-6cw9-8mq4:** JWT Algorithm Confusion via Unsafe Default (HS256) Allows Token Forgery

**CWE:**
- CWE-347: Improper Verification of Cryptographic Signature

**Fix Available:** ⚠️ Breaking change  
**Fix Version:** prisma@6.19.2 (major version downgrade)  
**Fix Command:** `npm audit fix --force`

**Recommendation:** 🟡 **EVALUATE IMPACT** - Breaking change required
- Hono is a transitive dependency through @prisma/dev
- Check if @prisma/dev is actually used in production
- Consider if JWT middleware is used in the application

---

### 3. Prisma - Indirect via Hono

**Package:** `prisma`  
**Severity:** 🔴 HIGH (inherited from hono)  
**Affected Versions:** 6.20.0-dev.1 - 7.3.0-integration-*  
**Dependency Chain:** hono → @prisma/dev → prisma

**Fix Available:** ⚠️ Breaking change  
**Fix Version:** 6.19.2 (major version downgrade)

**Recommendation:** 🟡 **EVALUATE** - Same as Hono issue above

---

## Low Severity Vulnerabilities (2)

### 4. diff - Denial of Service in parsePatch/applyPatch

**Package:** `diff`  
**Severity:** 🟢 LOW  
**CVSS Score:** 0 (not scored)  
**Affected Versions:** <8.0.3  
**Dependency Chain:** diff → ts-node

**Vulnerability:**
- **GHSA-73rr-hh4g-fpgx:** jsdiff DoS vulnerability

**CWE:**
- CWE-400: Uncontrolled Resource Consumption
- CWE-1333: Inefficient Regular Expression Complexity

**Fix Available:** ⚠️ Breaking change  
**Fix Version:** ts-node@1.7.1 (major version downgrade)

**Recommendation:** 🟢 **LOW PRIORITY** - Development dependency, low severity

---

### 5. ts-node - Indirect via diff

**Package:** `ts-node`  
**Severity:** 🟢 LOW (inherited from diff)  
**Affected Versions:** <=1.4.3 || >=1.7.2  
**Dependency Chain:** diff → ts-node

**Recommendation:** 🟢 **LOW PRIORITY** - Same as diff issue above

---

## Recommendations by Priority

### 🔴 Immediate Action Required

1. **Update Next.js to 14.2.35**
   ```bash
   npm install next@14.2.35
   ```
   - Non-breaking update
   - Fixes high severity DoS vulnerabilities
   - Should be done before release

### 🟡 Evaluate and Plan

2. **Review Hono/Prisma Dependencies**
   - Check if @prisma/dev is used in production
   - Evaluate if JWT middleware from Hono is used
   - If not used, consider removing or updating
   - If used, plan for breaking change update

### 🟢 Low Priority (Post-Release)

3. **Update ts-node/diff (Development Dependencies)**
   - Low severity, development-only impact
   - Can be addressed in next maintenance cycle
   - Create ticket for future update

## Fix Commands

### Safe Fix (Non-Breaking)
```bash
# Update Next.js only
npm install next@14.2.35
npm audit
```

### Force Fix (Breaking Changes)
```bash
# WARNING: This will cause breaking changes
npm audit fix --force

# Review changes
git diff package.json package-lock.json

# Test thoroughly before committing
npm test
```

### Selective Fix
```bash
# Update only Next.js
npm install next@14.2.35

# Check remaining issues
npm audit --audit-level=high
```

## Post-Fix Verification

After applying fixes:

1. Run tests: `npm test`
2. Check build: `npm run build`
3. Verify audit: `npm audit --audit-level=high`
4. Test application functionality
5. Commit changes with clear message

## Conclusion

**Overall Status:** ⚠️ **ACTION REQUIRED**

**Critical Issues:** 0  
**High Issues:** 4 (1 easily fixable, 3 require evaluation)  
**Recommendation:** 
- Update Next.js immediately (non-breaking)
- Evaluate Hono/Prisma dependencies
- Low priority issues can wait

**Release Decision:**
- ✅ Safe to release after updating Next.js
- 🟡 Consider addressing Hono issues if JWT is used in production
- 🟢 Low severity issues do not block release
