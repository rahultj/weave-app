# Environment Variables Setup Guide

## 🔧 Vercel Environment Variables Configuration

### Step 1: Get Your Staging Database Credentials

From your **NEW staging Supabase project**:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abc123-staging.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Configure Vercel Environment Variables

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your weave-app project**
3. **Go to Settings → Environment Variables**

### Step 3: Set Branch-Specific Variables

#### For `main` branch (Production):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_ENV=production
```

#### For `staging` branch (Staging):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_ENV=staging
```

### Step 4: How to Set Branch-Specific Variables

1. **Click "Add New" in Environment Variables**
2. **Enter variable name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. **Enter value** (your staging URL)
4. **Select Environment**: Choose "Preview" 
5. **Git Branch**: Enter `staging`
6. **Click "Save"**

Repeat for each variable for both `main` and `staging` branches.

### Step 5: Verify Configuration

Your environment variables should look like this:

| Variable | Production (main) | Staging (staging) |
|----------|------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | prod-url | staging-url |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod-key | staging-key |
| `ANTHROPIC_API_KEY` | same-key | same-key |
| `NEXT_PUBLIC_APP_ENV` | production | staging |

## 🧪 Testing Your Setup

After configuration:

1. **Deploy to staging**: Push to `staging` branch
2. **Check staging app**: https://weave-app-git-staging-rahultj.vercel.app
3. **Verify database**: Create a test scrap, ensure it goes to staging DB
4. **Check production**: Ensure production still works normally

## 🔍 Troubleshooting

### Common Issues:

1. **Wrong database being used**
   - Check environment variables are set correctly
   - Verify branch names match exactly

2. **Authentication issues**
   - Ensure Supabase auth is configured in staging project
   - Check RLS policies are in place

3. **Storage issues**
   - Verify storage bucket exists in staging project
   - Check storage policies are configured

### Quick Test:
```bash
# In your staging environment console:
console.log('Environment:', process.env.NEXT_PUBLIC_APP_ENV)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## ✅ Success Checklist

- [ ] Staging Supabase project created
- [ ] Schema setup completed
- [ ] Environment variables configured for both branches
- [ ] Staging deployment works
- [ ] Production deployment still works
- [ ] Databases are separate and isolated 