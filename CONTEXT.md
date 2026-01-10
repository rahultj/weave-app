# Weave App - Development Context

> **Last Updated:** January 10, 2026  
> **Purpose:** Context file for resuming development with AI assistance

## 🎯 Project Overview

**Weave** is a cultural journal app where users reflect on and discover new cultural works through conversation with an AI assistant named "Bobbin". It's less of a library and more of a personal journal for cultural discovery.

### Core Concept
- Users chat with Bobbin (Claude AI) about cultural works (books, films, art, etc.)
- Conversations are saved and artifacts (cultural works) are extracted
- Patterns emerge across user's taste, displayed as insights
- Focus on reflection and discovery, not recommendations

## 🏗️ Technical Stack

- **Framework:** Next.js 16.0.7 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (with @supabase/ssr)
- **AI:** Anthropic Claude API (Sonnet 4)
- **Deployment:** Vercel
- **Testing:** Vitest (unit), Playwright (E2E)
- **CI/CD:** GitHub Actions

## 📁 Key Architecture

### Navigation Structure
- **Collection** (`/feed`) - User's saved artifacts
- **Patterns** (`/patterns`) - Detected patterns in user's taste
- **Bobbin** (`/weave-chat`) - Start new conversations
- **Explore** (`/explore`) - Recommendation queue from pattern exploration

Bottom navigation bar (`components/BottomNav.tsx`) appears on all authenticated pages.

### Key Files & Directories

#### Pages
- `app/page.tsx` - Landing page (unauthenticated)
- `app/feed/page.tsx` - Main collection feed (artifacts only)
- `app/weave-chat/page.tsx` - Chat interface with Bobbin
- `app/patterns/page.tsx` - Patterns page
- `app/explore/page.tsx` - Recommendations/explore page
- `app/conversation/[id]/page.tsx` - View individual conversation

#### Components
- `components/BottomNav.tsx` - Bottom navigation (4 sections)
- `components/ArtifactCard.tsx` - Displays cultural artifacts (compact & full layouts)
- `components/BobbinAvatar.tsx` - Animated Bobbin avatar
- `components/SignInModal.tsx` - Authentication modal

#### API Routes
- `app/api/chat/route.ts` - Claude AI chat endpoint
- `app/api/detect-patterns/route.ts` - Pattern detection (with caching)
- `app/api/extract-entities/route.ts` - Extract artifacts from conversations
- `app/api/extract-recommendations/route.ts` - Generate recommendations

#### Database & Data Layer
- `lib/knowledge-graph.ts` - Database helper functions
- `lib/supabase/` - Supabase client utilities (server, route, middleware)
- `lib/types/knowledge-graph.ts` - TypeScript types for DB schema
- `middleware.ts` - Auth middleware for route protection

#### Testing
- `tests/components/` - Component unit tests (Vitest)
- `tests/e2e/` - End-to-end tests (Playwright)
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `.github/workflows/test.yml` - CI/CD workflow

## 🔄 Recent Changes

### January 2026
1. **Branch Protection** - Production (`main`) now requires PRs with passing CI checks
2. **Improved Error Handling** - API routes now show user-friendly error messages instead of silent failures
3. **CI on Production** - Tests now run on both `staging` and `main` pushes
4. **Lazy Anthropic Client** - API key validated at runtime with clear error messages

### December 2024
1. **Bottom Navigation UX Refactor** - Separated feed, patterns, explore, and chat into distinct sections
2. **Pattern Caching** - Implemented database-backed caching for AI-generated patterns (improves load times)
3. **Testing Infrastructure** - Set up Vitest + Playwright with GitHub Actions CI

### Current State
- ✅ Bottom navigation implemented
- ✅ Patterns page with caching
- ✅ Explore/recommendations page
- ✅ Feed shows only artifacts (patterns/recommendations moved to separate pages)
- ✅ Pattern caching working
- ✅ Unit tests setup (BottomNav component tested)
- ✅ E2E tests setup (landing page, navigation)
- ✅ CI/CD workflow configured
- ✅ Branch protection on `main` (tests gate production)
- ✅ User-friendly error handling in chat/API
- ⚠️ Lint step temporarily disabled in CI (Next.js lint command bug)

## 🗄️ Database Schema

### Key Tables
- `artifacts` - Saved cultural works
- `conversations` - Chat conversations with Bobbin
- `chat_history` - Message history
- `cached_patterns` - Cached pattern detection results
- `pattern_cache_meta` - Metadata for pattern cache invalidation
- `concepts` - Extracted concepts/themes
- `connections` - Relationships between artifacts

### Pattern Caching
Patterns are cached in `cached_patterns` table to avoid repeated AI calls. Cache is invalidated when artifact count changes (tracked in `pattern_cache_meta`).

## 🎨 Design System

### Colors
- Brand primary: `#C85A5A` (badges, alerts)
- Ochre/gold: `#C9A227` (active nav, patterns accent)
- Background: `#FAF8F5` (main), `#F7F5F1` (cards)
- Border: `#E8E5E0`
- Text: `#2A2A2A` (primary), `#666` (secondary), `#888` (muted)

### Typography
- Titles: Cormorant (serif)
- Body: DM Sans (sans-serif)

### Design Philosophy
Warm, parchment-like aesthetic - cultural journal, not a tech product.

## 🚨 Known Issues & Pending Work

### Current Issues
1. **Linting** - `next lint` command has a bug (misinterprets "lint" as directory). Temporarily disabled in CI.
   - ESLint 9 flat config setup
   - May need Next.js upgrade or alternative approach

2. **Badge Tracking** - Database fields for `explored` (patterns) and `dismissed` (recommendations) exist but may need implementation updates

### Pending Tasks
- [ ] Fix Next.js lint command bug
- [ ] Complete badge persistence implementation
- [ ] Add more comprehensive test coverage

## 🧪 Testing

### Running Tests Locally
```bash
# Unit tests
npm run test

# E2E tests (against staging by default)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### CI/CD
- Runs on push to `staging` and `main` branches
- Runs on PRs to `main` and `staging`
- Steps: Type-check → Unit tests → E2E tests → Build
- Lint step currently disabled
- **Branch Protection:** PRs to `main` require passing status checks before merge

## 🔐 Authentication Flow

1. User lands on `/` (landing page)
2. Clicks sign-in → `SignInModal` opens
3. After auth → redirected to `/feed`
4. `middleware.ts` protects authenticated routes
5. Uses `@supabase/ssr` for proper SSR auth handling

### Password Reset
- Uses dynamic `redirectTo` based on `window.location.origin`
- Redirects to `/auth/callback?next=/reset-password`
- Supabase redirect URLs must include production domains

## 🚀 Deployment

### Environments
- **Production:** `https://theweave.app` (Vercel)
- **Staging:** `https://weave-app-git-staging-rahultjs-projects.vercel.app`

### Workflow (Protected Production)
1. Develop locally on `main` branch
2. Push to `staging` branch → CI tests run → auto-deploys to staging
3. Test on staging
4. Create PR: `staging` → `main`
5. CI tests must pass before merge is allowed (branch protection)
6. Merge PR → auto-deploys to production

**Important:** Direct pushes to `main` are blocked. All production deployments go through PRs.

### When Asking AI to "Push to Prod"
The AI assistant will:
1. Push changes to `staging`
2. Create a PR from `staging` → `main`
3. Wait for CI checks to pass
4. You (or AI) merge the PR to deploy

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

See `scripts/setup-env-vars.md` for detailed setup.

## 📝 Development Workflow

### Local Development
```bash
npm run dev        # Start dev server (Turbopack)
npm run type-check # TypeScript validation
npm run test       # Unit tests
npm run lint       # ESLint (currently has bug)
```

### Making Changes
1. Make changes locally on `main`
2. Test locally
3. Push to `staging` → CI runs → deploys to staging
4. Test on staging
5. Create PR: `staging` → `main` (via GitHub)
6. CI checks must pass
7. Merge PR → deploys to production

## 🔑 Key Decisions & Patterns

### Supabase Client Usage
- **Server Components:** Use `createServerComponentClient` from `lib/supabase/server.ts`
- **API Routes:** Use `createRouteClient` from `lib/supabase/route.ts`
- **Middleware:** Use `createMiddlewareClient` from `lib/supabase/middleware.ts`
- **Client Components:** Use `createClientComponentClient` from `lib/supabase.ts`

### Pattern Caching Strategy
- Patterns cached in database to avoid repeated AI calls
- Cache invalidated when artifact count changes
- Refresh button on patterns page forces recompute

### Component Patterns
- Conditional rendering for compact vs full artifact cards (based on image presence)
- Bottom navigation appears on all authenticated pages
- Animated Bobbin avatar in chat interface

## 📚 Additional Documentation

- `CHECKPOINT.md` - Detailed development checkpoint (older)
- `docs/design-prompt.md` - Design system rationale
- `docs/knowledge-graph-schema.md` - Database schema details
- `STAGING_WORKFLOW.md` - Staging deployment process
- `sql/MIGRATION_GUIDE.md` - Database migration guide

## 🎯 Quick Resume Commands

For AI assistants:

```
"I'm working on Weave, a cultural journal app. Check CONTEXT.md for current state.
[Describe what you want to do]"
```

Example:
```
"I'm working on Weave. Check CONTEXT.md. I want to fix the linting issue 
in the CI workflow."
```

---

**Note:** This file should be updated when making significant changes to architecture, adding new features, or changing development patterns.

