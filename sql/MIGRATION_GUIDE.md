# Database Migration Guide: Scraps Schema Update

## 🎯 Overview
This migration updates the `scraps` table to:
- Make `title` required (NOT NULL)
- Add `creator` and `medium` fields  
- Rename `content` to `observations` for clarity
- Remove unused `source` field

## ⚠️ CRITICAL: Database Safety

**Current Risk**: Your staging and production environments share the same database.

### Recommended Approach: Separate Databases

**Option 1: Create Staging Database (Recommended)**
1. Create new Supabase project for staging
2. Copy schema to staging
3. Test migration on staging
4. Apply to production

**Option 2: Same Database (High Risk)**
If you must use the same database, follow the strict protocol below.

## 📋 Pre-Migration Checklist

### 1. Backup Your Database
```bash
# In Supabase Dashboard:
# Settings > Database > Backup > Create Backup
```

### 2. Test Migration Prerequisites
```bash
node scripts/test-migration.js
```

### 3. Verify Current Data
- Check for NULL titles
- Verify content data exists
- Confirm creator/medium fields aren't already in use

## 🚀 Implementation Steps

### Phase 1: Code Updates (Safe)
These changes are backwards compatible:

1. **Update Database Types**
   - ✅ Already updated in `lib/database.types.ts`

2. **Update TypeScript Interface**
   - ✅ Already updated in `lib/scraps.ts`

3. **Update Components** (Next section)

### Phase 2: Component Updates
Update all references from `content` to `observations`:

#### Files to Update:
- `components/EditScrapModal.tsx`
- `components/AddEntryModal.tsx`
- `components/ScrapCard.tsx`
- `components/ScrapFeed.tsx`
- `components/ChatModal.tsx`
- `app/api/chat/route.ts`

### Phase 3: Database Migration (Critical)

#### If Using Same Database:
1. **Maintenance Window Required**
2. **Deploy code first** (with backwards compatibility)
3. **Run migration immediately after**
4. **Test thoroughly**

#### If Using Separate Databases:
1. Test on staging first
2. Verify everything works
3. Apply to production

## 🔧 Migration Commands

### Test Migration
```bash
# Test prerequisites
node scripts/test-migration.js

# If successful, proceed with migration
```

### Apply Migration
```sql
-- In Supabase SQL Editor:
-- Copy/paste contents of sql/migrations/001_update_scraps_schema.sql
```

### Rollback (if needed)
```sql
-- In Supabase SQL Editor:
-- Copy/paste contents of sql/migrations/001_rollback_scraps_schema.sql
```

## 🧪 Testing Protocol

### After Migration:
1. **Verify Schema**
   - Check new columns exist
   - Verify data migration
   - Test NOT NULL constraint

2. **Test Application**
   - Create new scrap
   - Edit existing scrap
   - View scrap feed
   - Test chat functionality

3. **Smoke Tests**
   - All forms work
   - Search functionality
   - No console errors

## 🚨 Rollback Plan

If issues occur:
1. **Immediate**: Run rollback SQL
2. **Redeploy**: Previous version of code
3. **Verify**: Data integrity
4. **Investigate**: Root cause

## 📞 Emergency Contacts

- **Database**: Supabase Dashboard
- **Deployment**: Vercel Dashboard
- **Monitoring**: Check application logs

## ✅ Success Criteria

- [ ] Migration completes without errors
- [ ] All existing data preserved
- [ ] New fields work correctly
- [ ] Application functions normally
- [ ] No data loss
- [ ] Performance unchanged

## 📝 Notes

- **Timing**: Plan for low-traffic period
- **Duration**: ~5-10 minutes for migration
- **Monitoring**: Watch for errors post-migration
- **Rollback**: Ready within 5 minutes if needed 