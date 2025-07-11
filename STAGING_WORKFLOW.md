# 🚀 Weave App - Staging Environment Workflow

## Branch Structure

```
main (production) → your-custom-domain.com
  ↑
staging (staging environment) → https://weave-app-git-staging-rahultj.vercel.app
  ↑  
stable-with-empty-states (development) → preview URLs
  ↑
feature branches → individual preview URLs
```

## 🔄 Development Workflow

### For New Features:
1. **Create feature branch** from `staging`:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test locally**:
   ```bash
   npm run dev
   ```

3. **Push feature branch** (gets automatic Vercel preview):
   ```bash
   git push -u origin feature/your-feature-name
   ```

### For Staging Testing:
1. **Merge feature to staging**:
   ```bash
   git checkout staging
   git merge feature/your-feature-name
   git push origin staging
   ```

2. **Test on staging URL**: `https://weave-app-git-staging-rahultj.vercel.app`

### For Production Release:
1. **Merge staging to main** (when ready):
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Production deploys** to your custom domain automatically

## 🌐 Vercel URLs

- **Production**: Your custom domain (from `main` branch)
- **Staging**: `https://weave-app-git-staging-rahultj.vercel.app` (from `staging` branch)
- **Feature Previews**: Auto-generated URLs for each feature branch

## 🔧 Environment Variables

### Same Database Setup
Since you're using the same database for both environments:
- Both staging and production use the same Supabase project
- Same environment variables for now
- Consider adding environment indicators in the future

### Vercel Environment Configuration
In your Vercel dashboard, you can set different variables per branch:
1. Go to Project Settings → Environment Variables
2. Set variables for specific branches:
   - `main` branch: Production values
   - `staging` branch: Could have different rate limits or debug settings

## 🧪 Testing Strategy

### On Staging:
- ✅ Test new features thoroughly
- ✅ Test mobile responsiveness  
- ✅ Test error boundaries
- ✅ Test rate limiting
- ✅ Test PWA features
- ✅ Test environment validation

### Before Production:
- ✅ All staging tests pass
- ✅ No console errors
- ✅ Mobile testing complete
- ✅ Performance review

## 🚨 Emergency Hotfixes

For urgent production fixes:
1. **Create hotfix branch** from `main`:
   ```bash
   git checkout main
   git checkout -b hotfix/urgent-fix
   ```

2. **Fix and test**, then merge directly to `main`:
   ```bash
   git checkout main
   git merge hotfix/urgent-fix
   git push origin main
   ```

3. **Sync back to staging**:
   ```bash
   git checkout staging
   git merge main
   git push origin staging
   ```

## 📋 Quick Commands

```bash
# Check current branch
git branch

# Switch to staging
git checkout staging

# Create new feature
git checkout -b feature/new-feature

# Push and create Vercel preview
git push -u origin feature/new-feature

# Deploy to staging
git checkout staging && git merge feature/new-feature && git push origin staging

# Deploy to production  
git checkout main && git merge staging && git push origin main
```

## 🎯 Benefits

- ✅ **Isolated testing** on staging before production
- ✅ **Automatic deployments** for all branches
- ✅ **Safe production releases** with thorough testing
- ✅ **Feature previews** for individual development
- ✅ **Rollback capability** if issues arise
- ✅ **Collaborative workflow** for team development

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Staging Environment**: https://weave-app-git-staging-rahultj.vercel.app
- **GitHub Repository**: https://github.com/rahultj/weave-app

---

*Happy deploying! 🚀* 