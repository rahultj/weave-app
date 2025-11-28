# Weave - Design System Prompt

A personal cultural journal PWA. Users chat with Bobbin (AI) to discover cultural works, then save artifacts to build a collection that reveals their taste.

---

## Core Aesthetic

**Feel:** Minimal, warm, intellectual. Like a beautifully curated personal library.

**Colors:**
- Background: Warm cream `#FAF8F5`
- Cards: Slightly darker `#F7F5F1`
- Borders: Subtle gray `#E8E5E0`
- Text: Deep charcoal `#2A2A2A`

**Type-Specific Colors:**
- Music (Album/Podcast): Crimson `#A4243B`
- Books (Novel/Essay): Indigo `#1E3A5F`
- Film: Forest `#2D6A4F`
- Insights/Actions: Ochre `#C9A227`

**Typography:**
- Headlines: Cormorant Garamond (serif)
- Body/UI: DM Sans (sans-serif)
- Sizes: Headlines 18-24px, Body 14-16px
- Line-height: 1.5-1.6

**Cards:**
- Soft rounded corners (12px)
- Very subtle shadows
- Image-heavy with minimal text

---

## User Flow (Simplified)

```
1. From feed: User clicks input bar "What interests you?" → Opens chat
2. User chats with Bobbin about cultural work
3. [Save button always visible in chat header]
4. User clicks Save → Modal shows extracted artifact + key insight (editable)
5. Saves to collection
6. Returns to feed → Artifact appears
7. Occasionally, insight card appears showing taste patterns
```

---

## Components to Design

### 1. Chat with Save Button

```
┌─────────────────────────────────────┐
│ ← Weave              [Save] [@user] │
├─────────────────────────────────────┤
│ [Chat messages]                     │
│                                     │
│ User: "What is MOTOMAMI about?"     │
│ Bobbin: "It's an experimental..."   │
│                                     │
├─────────────────────────────────────┤
│ What interests you?  [📷] [Send]    │
└─────────────────────────────────────┘
```

- Save button: Top right, muted red, always visible
- Chat: Clean message bubbles, plenty of white space

### 2. Save Confirmation Modal

```
┌─────────────────────────────────────┐
│ Save to Collection              [✕] │
├─────────────────────────────────────┤
│ [IMG] 🎵 MOTOMAMI                   │
│       Rosalía • 2022 • Album        │
│                                     │
│ Key insight:                        │
│ ┌─────────────────────────────────┐ │
│ │ Experimental blend that         │ │
│ │ challenges genre boundaries     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 From conversation on Nov 24     │
│                                     │
│ [Edit Details] [Save to Collection] │
└─────────────────────────────────────┘
```

- Small thumbnail (64x64px)
- Editable textarea for insight (3-4 lines)
- Primary action: "Save to Collection" (muted red)

### 3. Artifact Card

```
┌─────────────────────────┐
│ ♫ [COVER IMAGE 4:3]     │ ← Type badge (colored)
│                         │
├─────────────────────────┤
│ MOTOMAMI                │
│ Rosalía • Album • 2022  │
│                         │
│ "Experimental blend..." │
│                         │
│ 💬 From conversation    │
│ [View conversation →]   │
└─────────────────────────┘
```

- 4:3 landscape image with type badge overlay
- Type badge colors: ♫ crimson, ◎ indigo, ▷ forest
- Key insight in italic (2 lines max)
- Conversation link in type color

### 4. Insight Card

```
┌─────────────────────────────────────┐
│ 💡 A pattern in your taste          │
├─────────────────────────────────────┤
│ You're drawn to works that          │
│ challenge conventions               │
│                                     │
│ This thread appears in:             │
│ • MOTOMAMI                          │
│ • The Dispossessed                  │
│ • Carrier Bag Theory                │
│                                     │
│ [Explore this pattern →]            │
└─────────────────────────────────────┘
```

- Warm, encouraging tone
- Shows 3-5 artifacts as evidence
- Optional exploration action

### 5. Feed Layout

```
┌─────────────────────────────────────┐
│ weave         [Search]    [@avatar] │
├─────────────────────────────────────┤
│ What interests you? [📷]            │ ← Tap to open chat
├─────────────────────────────────────┤
│ Your Collection                     │
│                                     │
│ [Artifact Card]                     │
│ ↓ 32px                              │
│ [Insight Card]     ← occasional     │
│ ↓ 32px                              │
│ [Artifact Card]                     │
│ ↓ 32px                              │
│ [Artifact Card]                     │
└─────────────────────────────────────┘
```

- Input bar at top: Tap to open chat interface
- Simple vertical scroll
- Artifacts + occasional insight cards
- Generous spacing (32-48px)

---

## Design Principles

1. **Content-first** - Let artifacts shine
2. **Generous whitespace** - Breathing room everywhere
3. **Subtle interactions** - 200ms transitions, slight shadows on hover
4. **Mobile-first** - Touch-friendly targets
5. **Image-heavy** - Book covers, album art as heroes

---

## Metaphor: Weaving

"Weave" refers to weaving threads into tapestry. Use subtle visual language:
- Individual works = threads
- Collection = tapestry
- Copy: "Weave together", "threads in common", "pattern emerging"
- Visual: Subtle connecting lines between related items (not literal textile patterns)

---

## Inspiration

- Substack (clean reading)
- Are.na (minimal curation)
- Notion (content-first)

Keep it simple, warm, and focused on the artifacts.
