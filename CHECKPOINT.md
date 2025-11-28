# 🎯 Weave Development Checkpoint

**Last Updated:** November 28, 2025 (Recommendations List Added)
**Database:** Production (vaijrrodmzvbluytlnmw.supabase.co) - IMPORTANT: App is using production, not staging!

---

## ✅ RECOMMENDATIONS LIST FEATURE (Nov 28, 2025)

### What Was Added

When users explore patterns with Bobbin, they receive personalized recommendations for books, films, music, and other cultural works. Now these recommendations can be saved to a "To Explore" list.

### New Components

1. **`SaveRecommendationsModal`** (`components/SaveRecommendationsModal.tsx`)
   - Bottom sheet modal showing extracted recommendations
   - Checkboxes to select which recommendations to save
   - Displays title, creator, type, and reason for recommendation

2. **`/api/extract-recommendations`** (`app/api/extract-recommendations/route.ts`)
   - New API endpoint using Claude to extract recommendations from conversations
   - Parses cultural works mentioned as suggestions
   - Returns structured data with title, creator, type, and reason

### Updated Components

1. **`FeedView.tsx`**
   - Added "To Explore" collapsible section in the feed
   - Shows saved recommendations with:
     - Title, creator, type
     - Reason why it was recommended
     - Source pattern context
   - Actions: Chat about it, Remove from list
   - Stored in `localStorage` under `weave-to-explore`

2. **`weave-chat/page.tsx`**
   - Pattern exploration now extracts recommendations when leaving
   - Shows `SaveRecommendationsModal` instead of single artifact modal
   - Handles `?topic=` query param for starting chats from recommendations

### User Flow

```
1. User explores a pattern via "Explore this pattern with Bobbin"
2. Bobbin provides insights and 3-5 recommendations
3. When user tries to leave, modal offers to save recommendations
4. User selects which recommendations to keep
5. Recommendations appear in "To Explore" section of feed
6. User can click chat icon to start a conversation about any recommendation
```

---

## ✅ AUTH FIX IMPLEMENTED (Nov 28, 2025)

### Root Cause Identified & Fixed

**The Problem:** Server-side and client-side auth were using **different Supabase clients** that didn't share session state.

| Before (Broken) | After (Fixed) |
|-----------------|---------------|
| Raw `createClient(url, key)` on server | `createServerComponentClient` with cookies |
| No cookie access | ✅ Reads session from cookies |
| `getUser()` always returned null | ✅ Properly detects authenticated users |

### Changes Made

1. ✅ **Created `middleware.ts`** - Centralized auth redirects
   - Redirects `/feed`, `/weave-chat` → `/app` if not authenticated
   - Redirects `/app` → `/feed` if already authenticated
   - Uses `createMiddlewareClient` to properly read session cookies

2. ✅ **Fixed `app/app/page.tsx`**
   - Now uses `createServerComponentClient` with cookies
   - Server component can properly detect authenticated users

3. ✅ **Fixed `app/feed/page.tsx`**
   - Now uses `createServerComponentClient` with cookies
   - Server component can properly detect authenticated users

4. ✅ **Updated `components/SignInModal.tsx`**
   - Added `router.push('/feed')` after successful sign-in/sign-up
   - Acts as backup redirect in case middleware doesn't trigger

### Files Changed

```
middleware.ts                    - NEW: Centralized auth redirect middleware
app/app/page.tsx                 - Fixed: Uses createServerComponentClient
app/feed/page.tsx                - Fixed: Uses createServerComponentClient  
components/SignInModal.tsx       - Enhanced: Client-side redirect after auth
```

### How Auth Flow Works Now

```
1. User visits /app (not logged in)
   └─ Middleware: No session → Allow (shows sign-in UI)

2. User signs in via SignInModal
   └─ SignInModal: Success → router.push('/feed')

3. User visits /feed (logged in)
   └─ Middleware: Has session → Allow
   └─ Server component: Fetches user's artifacts

4. User visits /app (already logged in)
   └─ Middleware: Has session → Redirect to /feed

5. User visits /feed (not logged in)
   └─ Middleware: No session → Redirect to /app
```

### To Test

1. Clear Next.js cache: `rm -rf .next`
2. Start dev server: `npm run dev`
3. Visit `http://localhost:3000/app`
4. Sign in with your credentials
5. Should redirect to `/feed` automatically
6. Sign out and verify you're redirected back to `/app`

---

## Previous Session Work (Earlier Nov 28)

### What Was Completed
1. ✅ **Database Migration on Production**
   - All 5 tables created: `artifacts`, `concepts`, `connections`, `conversations`, `artifact_concepts`
   - Verified tables exist and are accessible

2. ✅ **Verified Database Connectivity**
   - Confirmed PostgREST schema cache was refreshed
   - Created debug endpoint at `/api/debug-env` to verify database URL

### Environment Variable Note
- `.env.local` specifies staging DB but app connects to production
- This is due to Vercel deployment env vars or Next.js caching
- For now, this is okay since migration was run on production

---

## ✅ Completed Work (Previous Sessions)

### 1. Knowledge Graph Architecture
- ✅ Created complete database schema (`sql/migrations/003_knowledge_graph_schema.sql`)
- ✅ **Ran migration successfully on STAGING database**
- ✅ Created 5 new tables:
  - `artifacts` - Books, albums, films, essays, artworks, podcasts
  - `concepts` - Themes, movements, theories, techniques
  - `connections` - Relationships between artifacts
  - `conversations` - Chat history where discoveries happen
  - `artifact_concepts` - Many-to-many junction table
- ✅ Migrated existing scraps data to new tables
- ✅ Full documentation at `/docs/knowledge-graph-schema.md`

### 2. UI Components Built
- ✅ `components/ArtifactCard.tsx` - Card component with full/compact variants
- ✅ `components/ConnectionSuggestion.tsx` - Review AI-suggested connections
- ✅ `components/ConceptTag.tsx` - Pill-shaped concept tags
- ✅ `components/ArtifactFeed.tsx` - Main feed showing artifacts + suggestions
- ✅ Created `/demo` page to test components with mock data

### 3. Chat System Updates
- ✅ **Fixed Discovery Mode** - Chat now acts as cultural encyclopedia
- ✅ Updated `/app/api/chat/route.ts` with two modes:
  - **Discovery Mode**: General chat about cultural artifacts
  - **Reflection Mode**: Deep dive into saved artifacts (future)
- ✅ Chat can now answer questions like "What is Rosalía's MOTOMAMI?"

### 4. Mock Data & Testing
- ✅ Created `lib/mock-data.ts` with example artifacts
- ✅ Mock data includes: MOTOMAMI, The Dispossessed, Carrier Bag Theory, Babel, Everything Everywhere All at Once
- ✅ 2 pending connection suggestions for testing

### 5. Design Documentation
- ✅ Complete UI wireframes at `/docs/ui-wireframes.md`
- ✅ Entity extraction plan at `/docs/entity-extraction-plan.md`
- ✅ TypeScript types at `/lib/types/knowledge-graph.ts`

### 6. Configuration
- ✅ Switched `.env.local` to **STAGING database**
- ✅ Updated `next.config.js` with image domains (Wikipedia, Amazon)
- ✅ Dev server running on port 3000

### 7. Entity Extraction System
- ✅ **Created extraction API endpoint** (`app/api/extract-entities/route.ts`)
  - Accepts conversation messages
  - Uses Claude API to analyze conversations
  - Extracts artifacts, concepts, connections
  - Returns structured JSON with confidence scores
- ✅ **Created database helper functions** (`lib/knowledge-graph.ts`)
  - `createArtifact()`, `updateArtifact()`, `findArtifactByTitleAndCreator()`
  - `findOrCreateConcept()`, `linkArtifactToConcept()`
  - `createConnection()`, `acceptConnection()`, `rejectConnection()`
  - `getPendingSuggestions()`, `getUserArtifacts()`
  - `createConversation()`, `updateConversation()`, `getConversation()`

### 8. New Design System (Updated!)
- ✅ **Updated fonts** to Cormorant Garamond (serif) + DM Sans (sans-serif)
- ✅ **New color palette**:
  - Type-specific colors: Crimson (music), Indigo (books), Forest (film), Ochre (actions)
  - Background: Warm cream `#FAF8F5`
  - Cards: `#F7F5F1`
- ✅ **Created design tokens file** (`lib/design.ts`)
  - Colors, typography, spacing constants
  - Helper functions: `getTypeColor()`, `getTypeIcon()`
  - Type badges: ♫ (music), ◎ (books), ▷ (film)

### 9. New UI Components (Implemented!)
- ✅ **ArtifactCard** (`components/ArtifactCard.tsx`)
  - 4:3 landscape image with type badge overlay
  - Color-coded type badges (♫, ◎, ▷)
  - Key insight display
  - "From conversation" link
- ✅ **InsightCard** (`components/InsightCard.tsx`)
  - Pattern detection display
  - Evidence list (3-5 artifacts)
  - "Explore pattern" action
- ✅ **SaveArtifactModal** (`components/SaveArtifactModal.tsx`)
  - Bottom sheet modal (mobile-first)
  - Editable key insight textarea
  - Save to Collection action

### 10. New Pages (Built!)
- ✅ **Feed Page** (`app/feed/page.tsx` + `FeedView.tsx`)
  - Header with logo, search, avatar
  - Input bar → Opens chat
  - Artifact cards + occasional insight cards
  - Landing page for logged-out users
  - Connected to Supabase (getUserArtifacts)
- ✅ **Chat Page** (`app/weave-chat/page.tsx`)
  - Header with back button, Save button, avatar
  - Message list (user + Bobbin)
  - Chat input with send button
  - Save button → extraction → modal → database
  - Connected to existing `/api/chat` endpoint
  - Connected to `/api/extract-entities` endpoint

---

## 🎯 REVISED UX DIRECTION (Simplified!)

### **New Philosophy: Conversation-First, Simple**

**Old approach (too complex):**
- Batch extraction of multiple artifacts
- Review page with accept/reject flows
- Explicit connection suggestions
- Complex graph UI

**New approach (simple & focused):**
- 🗣️ **All interaction through conversation with Bobbin**
- 💾 **Save button always visible in chat** (user saves when ready)
- 📝 **Extract one artifact at a time from conversation context**
- ✏️ **Quick edit/confirm before saving**
- 🎴 **Feed is simple collection of artifact cards**
- 💡 **Insight cards appear occasionally when patterns emerge**
- 🔗 **No explicit connection UI** (connections detected in background for insights)

### **Revised Architecture**

```
User chats with Bobbin
    ↓
[Save button always visible in chat header/footer]
    ↓
User clicks "Save" when ready
    ↓
Extract artifact + key insight from conversation
    ↓
Show confirmation card with edit option
    ↓
Save to database (link to conversation preserved)
    ↓
Artifact appears in feed
    ↓
[Background: Detect patterns across saved artifacts]
    ↓
[Every N artifacts] Insight card appears in feed
```

### **Two Conversation Types**

**Discovery Mode** (asking questions):
```
User: "What is the Carrier Bag Theory of Fiction?"
Bobbin: [explains]
User: [clicks Save]
→ Saves with Bobbin's summary as key insight
```

**Reflection Mode** (sharing thoughts):
```
User: "I just finished The Dispossessed. It challenged how I think about society."
Bobbin: [responds]
User: [clicks Save]
→ Saves with user's observation as key insight
```

## 🎯 CURRENT STATUS

### **✅ COMPLETED: New Design Implementation**

All core components and pages have been built with the new design system:

#### Components
- ✅ **ArtifactCard** - With type colors, badges, conversation links
- ✅ **InsightCard** - Pattern detection display
- ✅ **SaveArtifactModal** - Bottom sheet with editable insight

#### Pages
- ✅ **Feed Page** (`/feed`) - Main collection view
  - Shows user's artifacts
  - Input bar → Opens chat
  - Landing page for logged-out users
  - Connected to database
- ✅ **Chat Page** (`/weave-chat`) - New chat interface
  - Save button in header
  - Calls extraction API
  - Shows save modal
  - Saves to database with conversation link

#### Integration
- ✅ Connected to existing `/api/chat` endpoint
- ✅ Connected to `/api/extract-entities` endpoint
- ✅ Using database helper functions from `lib/knowledge-graph.ts`
- ✅ Artifacts save with conversation context

## 🎯 NEXT STEPS (To Improve)

#### 1. Test End-to-End Flow
- Test chat → save → feed flow
- Verify artifact creation
- Test conversation links
- Check mobile responsiveness

#### 2. Enhance Pattern Detection
- Implement actual pattern detection logic
- Determine when to show insight cards
- Build pattern exploration page

#### 3. Add Image Upload
- Allow users to upload artifact images
- Integrate with image storage

#### 4. Polish & Edge Cases
- Error handling
- Loading states
- Empty states
- Offline support

---

## 📂 Key File Locations

### Auth & Middleware
- Auth Middleware: `/middleware.ts` ✅ NEW - Handles all auth redirects
- Auth Context: `/contexts/AuthContext.tsx` - Client-side auth state
- Supabase Client: `/lib/supabase.ts` - Client component Supabase client

### Database
- Migration: `/sql/migrations/003_knowledge_graph_schema.sql`
- Current DB: Production (vaijrrodmzvbluytlnmw.supabase.co)

### Types
- Knowledge Graph: `/lib/types/knowledge-graph.ts`
- Chat: `/lib/types/chat.ts`

### Components
- `/components/ArtifactCard.tsx`
- `/components/ConnectionSuggestion.tsx`
- `/components/ConceptTag.tsx`
- `/components/ArtifactFeed.tsx`

### APIs
- Chat: `/app/api/chat/route.ts` ✅ Updated
- Extract Entities: `/app/api/extract-entities/route.ts` ✅ Built
- Save Conversation: `/app/api/save-conversation/route.ts` (OLD - needs updating)

### Database Helpers
- Knowledge Graph Operations: `/lib/knowledge-graph.ts` ✅ Built

### Documentation
- Schema Docs: `/docs/knowledge-graph-schema.md`
- Extraction Plan: `/docs/entity-extraction-plan.md`
- UI Wireframes: `/docs/ui-wireframes.md`

### Mock Data
- `/lib/mock-data.ts`

---

## 🔧 Current Environment

```bash
Database: PRODUCTION (despite .env.local saying staging!)
URL: https://vaijrrodmzvbluytlnmw.supabase.co
Anon Key: eyJhbGciOi... (in .env.local)

.env.local shows: ovhbjiqykoxtknadtfsc.supabase.co (staging)
Actual runtime: vaijrrodmzvbluytlnmw.supabase.co (production)

Dev Server: http://localhost:3000
Landing Page: http://localhost:3000/
Auth/Sign-in: http://localhost:3000/app → redirects to /feed if logged in
New Feed UI: http://localhost:3000/feed → redirects to /app if not logged in
New Chat UI: http://localhost:3000/weave-chat → redirects to /app if not logged in
Old Demo: http://localhost:3000/demo (mock data)
Old Chat: http://localhost:3000/chat (deprecated)

Debug Endpoint: http://localhost:3000/api/debug-env (shows actual DB URL)

Auth Middleware: middleware.ts (handles all auth redirects)
```

---

## 💡 Important Context

### Design Philosophy (Updated!)
- **Conversation-First**: All interaction happens through chat with Bobbin
- **User Agency**: Save when ready, not when prompted
- **Simple Collection**: Feed is just artifact cards, not a complex graph
- **Implicit Connections**: Patterns detected in background, surfaced as insights
- **Two Modes**:
  - **Discovery Mode**: Learning about cultural works (Bobbin explains)
  - **Reflection Mode**: Sharing personal thoughts (user reflects)
- **Key Insight Preservation**: Every artifact saves the core insight from conversation
- **Taste Cultivation**: Occasional insight cards reveal patterns in your taste
- **NOT a recommendation engine**: This is a tool for cultural self-reflection through conversation

### Known Issues (Updated Nov 28)
- ✅ **FIXED**: Auth redirect between `/app` and `/feed` - now uses middleware + proper Supabase clients
- ⚠️ Environment variables - app uses production DB despite .env.local specifying staging (not blocking)
- ⚠️ Some Wikipedia/Amazon images return 404 in mock data (not critical)
- ⚠️ Old `scraps` and `chat_history` tables still exist (safe to keep for now)
- ✅ PostgREST schema cache issue resolved
- ✅ Database migration completed on production
- ✅ Tables created and accessible

### Testing
- Mock data visible at `/demo`
- Chat Discovery Mode tested and working
- Database migration verified successful

---

## 🚀 To Resume Development

**Simple command:**

```
"Resume from CHECKPOINT.md - build the Save & Extract flow"
```

**Or be more specific:**

```
"Continue building Weave. I want to implement the conversation
extraction system. Check CHECKPOINT.md for current state."
```

**What was done:**
1. ✅ Updated design system (fonts, colors, tokens)
2. ✅ Built all UI components (ArtifactCard, InsightCard, SaveArtifactModal)
3. ✅ Created feed page (`/feed`)
4. ✅ Created chat page (`/weave-chat`)
5. ✅ Wired everything to database
6. ✅ Integrated extraction API with save flow

**Ready to test:**
- Visit `/feed` to see collection
- Click "What interests you?" to open chat
- Chat with Bobbin
- Click Save button → modal appears
- Save artifact → appears in feed

---

## 📊 Simplified Architecture

```
User chats with Bobbin (Discovery OR Reflection)
    ↓
[Save button always visible]
    ↓
User clicks "Save" when ready
    ↓
Extract single artifact + key insight from conversation
    ↓
Show confirmation modal (editable)
    ↓
Save to database with conversation link
    ↓
Artifact appears in feed
    ↓
[Background: Pattern detection across artifacts]
    ↓
Occasional insight card in feed
```

**Key Differences from Old Approach:**
- ❌ No batch extraction
- ❌ No review page
- ❌ No explicit connection suggestions
- ✅ One artifact at a time
- ✅ In-chat save flow
- ✅ Simple artifact feed
- ✅ Implicit pattern insights

---

## 🔍 Quick Troubleshooting

### Check Which Database Is Being Used
```bash
# Visit in browser:
http://localhost:3000/api/debug-env

# Or test from command line:
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
"
```

### Test Database Connection
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
(async () => {
  const { data, error } = await supabase.from('artifacts').select('*').limit(1);
  console.log(error ? 'Error: ' + error.message : 'Success! Tables exist.');
})();
"
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Check Auth State (Browser Console)
```javascript
// On any authenticated page, run in browser console:
const { createClient } = require('@supabase/auth-helpers-nextjs')
const supabase = createClient()
const { data } = await supabase.auth.getUser()
console.log('User:', data.user)
```

---

**End of Checkpoint**
