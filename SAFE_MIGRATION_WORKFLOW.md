# 🛡️ Safe Migration Workflow with Separate Databases

## 📋 Overview
This workflow ensures zero-downtime migration by:
1. Setting up separate staging database
2. Testing migration thoroughly in staging
3. Applying to production only after validation

## 🚀 Phase 1: Setup Staging Database

### Step 1: Create Staging Supabase Project
- ✅ Create new Supabase project (name: `weave-app-staging`)
- ✅ Note down project URL and anon key
- ✅ Run `scripts/setup-staging-db.sql` in staging project

### Step 2: Configure Environment Variables
- ✅ Follow `scripts/setup-env-vars.md`
- ✅ Set branch-specific variables in Vercel
- ✅ Verify staging deployment connects to staging DB

### Step 3: Verify Staging Setup
```bash
# Test staging environment
NEXT_PUBLIC_APP_ENV=staging node scripts/test-staging-migration.js
```

## 🧪 Phase 2: Test Migration in Staging

### Step 1: Run Pre-Migration Tests
```bash
# Make sure you're testing against staging
echo "NEXT_PUBLIC_APP_ENV=staging" >> .env.local
node scripts/test-staging-migration.js
```

### Step 2: Apply Migration to Staging
1. **Go to staging Supabase project**
2. **Open SQL Editor**
3. **Run migration script**: `sql/migrations/001_update_scraps_schema.sql`
4. **Verify success**: Check for "Migration 001 applied" message

### Step 3: Test Staging Application
- ✅ Visit staging URL: `https://weave-app-git-staging-rahultj.vercel.app`
- ✅ Create new scrap (test `title` is required)
- ✅ Edit existing scrap (test `observations` field)
- ✅ Verify chat functionality works
- ✅ Test search functionality
- ✅ No console errors

## 🔄 Phase 3: Update Application Code

### Step 1: Update Component References
Update all files to use `observations` instead of `content`:

```bash
# Components that need updating:
- components/EditScrapModal.tsx
- components/AddEntryModal.tsx
- components/ScrapCard.tsx
- components/ScrapFeed.tsx
- components/ChatModal.tsx
- app/api/chat/route.ts
```

### Step 2: Deploy Code Changes
```bash
# Deploy to staging first
git checkout staging
git add .
git commit -m "Update components to use observations field"
git push origin staging

# Test staging thoroughly
# If successful, deploy to production
git checkout main
git merge staging
git push origin main
```

## 🚀 Phase 4: Apply to Production

### Step 1: Final Pre-Production Checks
- ✅ Staging migration completed successfully
- ✅ All functionality tested in staging
- ✅ Code deployed to production
- ✅ Production backup created

### Step 2: Apply Migration to Production
1. **Create production database backup**
2. **Go to production Supabase project**
3. **Open SQL Editor**
4. **Run migration script**: `sql/migrations/001_update_scraps_schema.sql`
5. **Verify success immediately**

### Step 3: Post-Migration Validation
- ✅ Production app loads without errors
- ✅ Existing data preserved
- ✅ New features work correctly
- ✅ User accounts still functional

## 🚨 Emergency Procedures

### If Migration Fails:
1. **Immediately run rollback**: `sql/migrations/001_rollback_scraps_schema.sql`
2. **Redeploy previous code version**
3. **Verify data integrity**
4. **Investigate and fix issues**

### If Application Breaks:
1. **Check database connection**
2. **Verify environment variables**
3. **Review application logs**
4. **Rollback if necessary**

## 📊 Success Metrics

### Database Level:
- [ ] Migration script runs without errors
- [ ] All data preserved during migration
- [ ] New schema structure verified
- [ ] Performance remains stable

### Application Level:
- [ ] All pages load correctly
- [ ] User authentication works
- [ ] CRUD operations function
- [ ] Search functionality intact
- [ ] Chat feature operational

## 🎯 Testing Checklist

### Before Production Migration:
- [ ] Staging database migration successful
- [ ] All components updated and tested
- [ ] Code deployed to both environments
- [ ] No console errors in staging
- [ ] Performance acceptable
- [ ] Mobile responsiveness verified

### After Production Migration:
- [ ] Database migration completed
- [ ] Application loads normally
- [ ] User data intact
- [ ] All features functional
- [ ] No error reports
- [ ] Performance monitoring normal

## 📞 Support Information

### Key Resources:
- **Staging URL**: https://weave-app-git-staging-rahultj.vercel.app
- **Production URL**: Your custom domain
- **Supabase Dashboards**: Keep both open during migration
- **Vercel Dashboard**: Monitor deployments

### Emergency Contacts:
- **Database Issues**: Supabase support
- **Deployment Issues**: Vercel support
- **Application Issues**: Your development team

## 🔄 Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| Setup | 30 minutes | Create staging DB, configure env vars |
| Testing | 60 minutes | Test migration in staging thoroughly |
| Code Update | 45 minutes | Update components and deploy |
| Production | 15 minutes | Apply migration to production |
| Validation | 30 minutes | Verify everything works |

**Total Estimated Time**: 3 hours

## ✅ Final Verification

After completing all phases:
- [ ] Both staging and production work correctly
- [ ] Data migration successful
- [ ] No user-facing issues
- [ ] Performance metrics normal
- [ ] Documentation updated
- [ ] Team notified of completion

---

**Remember**: This workflow prioritizes safety over speed. Take your time with each phase and don't rush the production deployment. 