# Weave Knowledge Graph UI Wireframes

## Design Principles

Based on existing Weave design system:
- **Clean & Minimal**: Generous whitespace, uncluttered layouts
- **Content First**: Large images, readable quotes, clear hierarchy
- **Cream & Red**: Neutral cream backgrounds (#FAF8F5) with red accents (#C85A5A)
- **Card-Based**: Everything as rounded cards with subtle shadows
- **Mobile-First**: Vertical scrolling feed, thumb-friendly interactions

---

## 1. Main Feed - Artifacts View

```
┌─────────────────────────────────────────────────┐
│ weave    [Search...]           [Avatar] →       │
├─────────────────────────────────────────────────┤
│                                                 │
│  What interests you? [📷] [🎤]                  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─ Suggestions for you ──────────────────┐    │
│  │                                         │    │
│  │  🔗 Bobbin found 2 connections          │    │
│  │                                         │    │
│  │  ┌──────────────────────────────────┐  │    │
│  │  │ MOTOMAMI  ←→  Carrier Bag Theory │  │    │
│  │  │ by Rosalía     by Ursula K. Le Guin│  │    │
│  │  │                                   │  │    │
│  │  │ Both explore challenging power    │  │    │
│  │  │ structures and genre conventions  │  │    │
│  │  │                                   │  │    │
│  │  │        [Accept]  [Dismiss]        │  │    │
│  │  └──────────────────────────────────┘  │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─ Recently Discovered ──────────────────┐    │
│  │                                         │    │
│  │  MOTOMAMI                               │    │
│  │  ┌─────────────────────────────────┐   │    │
│  │  │                                 │   │    │
│  │  │      [Album cover image]        │   │    │
│  │  │                                 │   │    │
│  │  └─────────────────────────────────┘   │    │
│  │  Rosalía • Album • 2022                 │    │
│  │  "Experimental genre-blending..."       │    │
│  │                                         │    │
│  │  Connected to 3 artifacts               │    │
│  │  Discovered Aug 28, 2025                │    │
│  │                         [✏️] [💬] [🗑️]  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  The Dispossessed                        │  │
│  │  ┌─────────────────────────────────┐    │  │
│  │  │                                 │    │  │
│  │  │      [Book cover image]         │    │  │
│  │  │                                 │    │  │
│  │  └─────────────────────────────────┘    │  │
│  │  Ursula K. Le Guin • Book • 1974        │  │
│  │  "Powerful exploration of anarchist..."  │  │
│  │                                         │  │
│  │  Connected to 2 artifacts               │  │
│  │  Explored • Aug 25, 2025                │  │
│  │                         [✏️] [💬] [🗑️]  │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  "Translation means doing violence       │  │
│  │  upon the original, means warping and    │  │
│  │  distorting it for foreign, untutored    │  │
│  │  eyes"                                   │  │
│  │                                          │  │
│  │  -- R.F. Kuang, Babel                   │  │
│  │                                          │  │
│  │  Connected to 1 artifact                 │  │
│  │  Aug 20, 2025                [✏️] [💬]   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│                                              ⊕  │ ← FAB
└─────────────────────────────────────────────────┘
│  [🏠]  [🔍]  [💬]  [👤]                         │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Suggestions section** at top (dismissible) showing pending connections
- **Card design** matches existing scrap cards
- **Connection indicator**: "Connected to N artifacts" badge
- **Status badge**: "Explored", "Exploring", etc.
- **Red borders** for quote/text artifacts (like original design)
- **Image artifacts**: Large hero image with caption below

---

## 2. Artifact Detail View

```
┌─────────────────────────────────────────────────┐
│ [←]  MOTOMAMI                              [⋮]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │                                          │  │
│  │        [Large album cover image]         │  │
│  │                                          │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  MOTOMAMI                                       │
│  Rosalía                                        │
│  Album • 2022                                   │
│                                                 │
│  [Exploring]                    [Edit Notes]    │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  My Notes                                       │
│  Experimental blend of flamenco, reggaeton,     │
│  and electronic music. References "Carrier      │
│  Bag Theory of Fiction" in the concept.         │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Connections (3)                                │
│                                                 │
│  🔗 References                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Carrier Bag Theory of Fiction            │  │
│  │ Ursula K. Le Guin • Essay                │  │
│  │ "Explicitly referenced in album concept" │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  🔗 Explores Similar Themes                     │
│  ┌──────────────────────────────────────────┐  │
│  │ The Dispossessed                         │  │
│  │ Ursula K. Le Guin • Book                 │  │
│  │ "Both challenge established power..."    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  🔗 Similar Style                               │
│  ┌──────────────────────────────────────────┐  │
│  │ Bad Bunny                                │  │
│  │ Un Verano Sin Ti • Album                 │  │
│  │ "Genre-blending Latin music..."          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [+ Add Connection]                             │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Related Concepts                               │
│  [experimental music] [genre-blending]          │
│  [cultural identity] [flamenco]                 │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Discovery                                      │
│  From conversation on Aug 28, 2025              │
│  [View Conversation →]                          │
│                                                 │
│  External Links                                 │
│  [🎵 Spotify] [🍎 Apple Music]                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Hero image** at top (matches current scrap detail)
- **Edit Notes** button for user reflections
- **Status badge** (Exploring, Want to Explore, Explored, Archived)
- **Connections grouped by type** with cards for each connected artifact
- **Concept tags** as pills/chips
- **Discovery context** links back to conversation
- **External links** for streaming/purchase

---

## 3. Connection Review / Suggestion Detail

```
┌─────────────────────────────────────────────────┐
│ [←]  Review Connection                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Bobbin suggested a connection                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ MOTOMAMI                                 │  │
│  │ ┌────────────────────┐                   │  │
│  │ │  [Album cover]     │                   │  │
│  │ └────────────────────┘                   │  │
│  │ Rosalía • Album • 2022                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│              ↕ Explores Similar Themes          │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ The Dispossessed                         │  │
│  │ ┌────────────────────┐                   │  │
│  │ │  [Book cover]      │                   │  │
│  │ └────────────────────┘                   │  │
│  │ Ursula K. Le Guin • Book • 1974          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Why this connection?                           │
│  Both works challenge established power         │
│  structures in their respective domains.        │
│  The album experiments with music industry      │
│  conventions while the novel explores           │
│  alternatives to capitalist systems.            │
│                                                 │
│  Confidence: ████████░░ 80%                     │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Your thoughts (optional)                       │
│  ┌──────────────────────────────────────────┐  │
│  │ Add your own insight about this          │  │
│  │ connection...                            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Accept Connection                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Dismiss]                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Side-by-side artifact cards** showing both items
- **Connection type** clearly labeled with arrow/icon
- **Reasoning explanation** from AI
- **Confidence meter** visual indicator
- **Optional user input** to add personal insight
- **Primary action** (Accept) in red button
- **Secondary action** (Dismiss) as text link

---

## 4. Chat Page - Save Flow

```
┌─────────────────────────────────────────────────┐
│ [←]  Chat with Bobbin                     [💾]  │ ← Save icon
├─────────────────────────────────────────────────┤
│                                                 │
│  You:                                           │
│  I just finished reading The Dispossessed       │
│  by Ursula K. Le Guin                           │
│                                                 │
│  Bobbin:                                        │
│  That's a powerful exploration of anarchist     │
│  utopia! What resonated with you?               │
│                                                 │
│  You:                                           │
│  The way it challenges capitalist structures    │
│  felt similar to what Rosalía does with music   │
│  industry conventions in MOTOMAMI               │
│                                                 │
│  Bobbin:                                        │
│  That's a fascinating connection! Both works    │
│  question established power dynamics. Did you   │
│  know Le Guin also wrote "Carrier Bag Theory    │
│  of Fiction" which Rosalía referenced?          │
│                                                 │
│  You:                                           │
│  No, I didn't! Tell me more.                    │
│                                                 │
│  Bobbin:                                        │
│  [Bobbin is typing...]                          │
│                                                 │
├─────────────────────────────────────────────────┤
│  What interests you? [📷] [🎤]                  │
└─────────────────────────────────────────────────┘
```

**When user taps Save icon:**

```
┌─────────────────────────────────────────────────┐
│            Save Conversation                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Analyzing conversation...               │  │
│  │  [■■■■■■■░░░] 70%                        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Found so far:                                  │
│  • 2 artifacts (The Dispossessed, MOTOMAMI)     │
│  • 1 connection (explores similar themes)       │
│  • 1 suggestion (Carrier Bag Theory)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After extraction completes:**

```
┌─────────────────────────────────────────────────┐
│            Conversation Saved                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✓ Saved 2 artifacts                            │
│  ✓ Created 1 connection                         │
│  ✓ Found 1 suggestion for you                   │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Review Suggestions               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Return to Feed]                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Save icon** in header (replaces current save button)
- **Progress modal** shows extraction happening
- **Live updates** as entities are found
- **Results summary** with action to review
- **Return to feed** shows new artifacts in timeline

---

## 5. Add Artifact Manually (FAB action)

```
┌─────────────────────────────────────────────────┐
│ [×]  Add Artifact                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  What type?                                     │
│  [📖 Book] [🎵 Album] [🎬 Film] [📝 Essay]      │
│  [🎨 Artwork] [🎙️ Podcast] [📰 Article]         │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Title *                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ MOTOMAMI                                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Creator                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Rosalía                                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Year                                           │
│  ┌──────────────────────────────────────────┐  │
│  │ 2022                                     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  My Notes                                       │
│  ┌──────────────────────────────────────────┐  │
│  │ Experimental blend of flamenco...        │  │
│  │                                          │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Status                                         │
│  ○ Want to Explore                              │
│  ○ Exploring                                    │
│  ● Explored                                     │
│  ○ Archived                                     │
│                                                 │
│  Image (optional)                               │
│  [Upload Image] or [Paste URL]                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │              Add Artifact                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Cancel]                                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Type selector** with emoji icons (fun, clear)
- **Minimal required fields** (just title)
- **Status radio buttons** to track engagement
- **Simple image upload** (optional)
- **Clean form** matching existing input styles

---

## 6. Search / Filter View

```
┌─────────────────────────────────────────────────┐
│ [×]  [Search artifacts...]                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Recent Searches                                │
│  • Ursula K. Le Guin                            │
│  • anarchism                                    │
│  • experimental music                           │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Filter by Type                                 │
│  [All] [Books] [Albums] [Films] [Essays]        │
│  [Artworks] [Podcasts]                          │
│                                                 │
│  Filter by Status                               │
│  [All] [Want to Explore] [Exploring]            │
│  [Explored] [Archived]                          │
│                                                 │
│  Filter by Concept                              │
│  #anarchism #experimental-music                 │
│  #genre-blending #cultural-identity             │
│                                                 │
│  Connected Artifacts Only                       │
│  [Toggle ON]                                    │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Sort by                                        │
│  • Recently Added                               │
│  ○ Title (A-Z)                                  │
│  ○ Creator (A-Z)                                │
│  ○ Year (Newest)                                │
│  ○ Most Connected                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Design Notes:
- **Search bar** at top
- **Recent searches** for quick access
- **Chip-style filters** for types
- **Concept tags** clickable
- **Toggle for connected only** (show knowledge graph items)
- **Sort options** radio buttons

---

## Component Specifications

### Artifact Card

**Variants:**
1. **With Image** (books, albums, films, artworks)
2. **Quote/Text** (quotes, essays without images)
3. **Compact** (in connection lists)

**Elements:**
- Hero image (if applicable)
- Title (h3 font size, primary text color)
- Creator (body font, secondary text color)
- Type • Year (caption font, muted text color)
- User notes preview (italic, 2-line clamp)
- Connection badge ("Connected to N artifacts")
- Status badge (if applicable)
- Action icons (edit, chat, delete)

**Colors:**
- Card background: `#F7F5F1` (neutral-bg-card)
- Border: None for image cards, `#C85A5A` for text/quote cards
- Text: `#2A2A2A` (neutral-text-primary)
- Metadata: `#888888` (neutral-text-muted)

### Connection Suggestion Card

**Elements:**
- Two mini artifact cards (compact variant)
- Connection type label (with icon)
- Description text
- Confidence indicator
- Action buttons (Accept in red, Dismiss as link)

**Colors:**
- Background: White with subtle border
- Connection type: Red accent color
- Accept button: Red (`#C85A5A`)

### Concept Tag

**Style:**
- Small pill shape
- Light red background (`#D67373` at 20% opacity)
- Red text (`#C85A5A`)
- Rounded corners (`border-radius: 16px`)
- Padding: `4px 12px`

---

## Navigation Updates

### Bottom Nav Icons
- **Home** (🏠) - Artifact feed
- **Search** (🔍) - Search/filter
- **Chat** (💬) - Chat with Bobbin
- **Profile** (👤) - User settings

### FAB Actions
When tapped, show bottom sheet:
- Add Artifact Manually
- Start Conversation
- Upload Image/Photo
- Record Voice Note

---

## Color Usage Summary

| Element | Color Token | Hex |
|---------|-------------|-----|
| Primary action | brand-primary | #C85A5A |
| Primary hover | brand-hover | #B84848 |
| Main background | neutral-bg-main | #FAF8F5 |
| Card background | neutral-bg-card | #F7F5F1 |
| Borders (subtle) | neutral-border | #E8E5E0 |
| Borders (accent) | brand-primary | #C85A5A |
| Primary text | neutral-text-primary | #2A2A2A |
| Secondary text | neutral-text-secondary | #5A5A5A |
| Muted text | neutral-text-muted | #888888 |

---

## Typography Scale

| Element | Token | Size/Height |
|---------|-------|-------------|
| Card titles | h3 | 18px/22px |
| Creator names | body | 14px/20px |
| Metadata | caption | 12px/16px |
| User notes | body | 14px/20px |
| Connection descriptions | body | 14px/20px |
| Section headers | h2 | 20px/24px |

---

## Spacing System

| Usage | Token | Value |
|-------|-------|-------|
| Card padding | lg | 24px |
| Section spacing | xl | 32px |
| Element gaps | md | 16px |
| Tight spacing | sm | 8px |
| Inline spacing | xs | 4px |

---

## Implementation Priority

1. **Phase 1: Core Views**
   - Artifact Card component (both variants)
   - Main Feed with artifacts
   - Artifact Detail View

2. **Phase 2: Connections**
   - Connection Suggestion Card
   - Review Suggestion flow
   - Connection indicators on cards

3. **Phase 3: Discovery**
   - Chat save & extract flow
   - Progress/results modals
   - Suggestion review page

4. **Phase 4: Management**
   - Manual add artifact form
   - Search/filter interface
   - Concept tag system
