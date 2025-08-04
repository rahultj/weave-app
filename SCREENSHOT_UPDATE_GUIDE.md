# 📸 Screenshot Update Guide for Weave Landing Page

## 🎯 Current Screenshot Locations:

### Hero Section (Main landing image):
- **File**: `public/landing/weave-cultural-feed.png`
- **Component**: `components/landing/HeroSection.tsx` (line 60)
- **Usage**: Large prominent image in hero section
- **Recommended size**: 400x600px (portrait)

### How It Works - Step 1:  
- **File**: `public/landing/weave-cultural-feed.png` (same as hero)
- **Component**: `components/landing/HowItWorksSection.tsx` (line 12)
- **Usage**: "Save a cultural moment" demo
- **Recommended size**: 300x600px (mobile-optimized)

### How It Works - Step 2:
- **File**: `public/landing/weave-bobbin-chat.png`  
- **Component**: `components/landing/HowItWorksSection.tsx` (line 21)
- **Usage**: "Ask Bobbin anything" demo
- **Recommended size**: 300x600px (mobile-optimized)

---

## 🔄 How to Update Screenshots:

### Option 1: Replace Existing (Easiest)
1. Take new screenshots with same names
2. Replace files in `public/landing/`
3. Commit and push:
   ```bash
   git add public/landing/
   git commit -m "Update landing page screenshots" 
   git push origin main
   ```

### Option 2: Use Different Filenames
1. Add new image files to `public/landing/`
2. Update component references:

**For Hero Section** (`components/landing/HeroSection.tsx`):
```tsx
<OptimizedImage 
  src="/landing/your-new-hero-image.png"  // <- Change this
  alt="Your new alt text"                  // <- And this
  width={400}
  height={600}
  className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
  priority
/>
```

**For How It Works** (`components/landing/HowItWorksSection.tsx`):
```tsx
const steps = [
  {
    number: "01",
    title: "Save a cultural moment",
    description: "...",
    icon: Plus,
    screenshot: "/landing/your-new-step1-image.png",    // <- Change this
    screenshotAlt: "Your new alt text",                 // <- And this
    comingSoon: false
  },
  {
    number: "02", 
    title: "Ask Bobbin anything",
    description: "...",
    icon: WeaveIcon,
    screenshot: "/landing/your-new-step2-image.png",    // <- Change this
    screenshotAlt: "Your new alt text",                 // <- And this
    comingSoon: false
  },
  // Step 3 stays the same (Coming Soon)
];
```

---

## 📐 Image Requirements:

### Technical Specs:
- **Format**: PNG (recommended) or high-quality JPG
- **Resolution**: High-DPI for crisp display on all devices
- **Aspect Ratio**: Portrait orientation (~2:3 ratio)
- **File Size**: Optimize for web (under 1MB each)

### Content Guidelines:
- **Mobile screenshots work best** (matches user experience)
- **Show real app content** (not empty states)
- **Good lighting/contrast** for readability
- **Representative of actual functionality**

### Recommended Sizes:
- **Hero Image**: 400x600px (can be larger for retina)
- **Step Images**: 300x600px (mobile-optimized)

---

## 🚀 Deployment Process:

1. **Local Development**: Test images at http://localhost:3000
2. **Staging**: Push to `staging` branch first for testing
3. **Production**: Merge to `main` for live deployment

```bash
# Full deployment workflow:
git add .
git commit -m "Update landing page screenshots"
git push origin staging        # Test on staging first
# After testing:
git checkout main
git merge staging  
git push origin main          # Deploy to production
```

---

## 🛠 Troubleshooting:

### Images not loading (404 errors):
1. Check file paths are correct (`/landing/filename.png`)
2. Ensure files are in `public/landing/` directory
3. Verify files are committed and pushed
4. Clear browser cache or try incognito mode

### Images look blurry:
1. Use higher resolution source images
2. Optimize with tools like TinyPNG
3. Ensure proper aspect ratios

### Performance issues:
1. Optimize file sizes (aim for <500KB each)
2. Use WebP format if supported
3. Verify lazy loading is working

---

## 📝 Quick Checklist:

- [ ] Screenshot files saved in `public/landing/`  
- [ ] File names match component references
- [ ] Images are high-quality and properly sized
- [ ] Alt text is descriptive and accessible
- [ ] Files committed and pushed to git
- [ ] Tested on staging environment
- [ ] Deployed to production
- [ ] Verified loading on live site

---

*Need help? Check components in `components/landing/HeroSection.tsx` and `components/landing/HowItWorksSection.tsx` for exact usage!*