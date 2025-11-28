// Weave Design System Tokens

export const colors = {
  // Base colors
  background: '#FAF8F5',
  card: '#F7F5F1',
  border: '#E8E5E0',
  text: '#2A2A2A',
  textSecondary: '#666',
  textMuted: '#888',

  // Type-specific colors
  crimson: '#A4243B',  // Music (Album/Podcast)
  indigo: '#1E3A5F',   // Books (Novel/Essay)
  forest: '#2D6A4F',   // Film
  ochre: '#C9A227',    // Insights/Actions

  // Insight card
  insightBg: '#FDF9F3',
  insightBorder: '#E8E0D4',
} as const

export const typeColors = {
  album: colors.crimson,
  podcast: colors.crimson,
  book: colors.indigo,
  novel: colors.indigo,
  essay: colors.indigo,
  article: colors.indigo,
  film: colors.forest,
  artwork: colors.indigo,
  other: colors.indigo,
} as const

export const typeIcons = {
  album: '♫',
  podcast: '♫',
  book: '◎',
  novel: '◎',
  essay: '◎',
  article: '◎',
  film: '▷',
  artwork: '◉',
  other: '◎',
} as const

export const typography = {
  // Font families
  serif: 'var(--font-cormorant)',
  sans: 'var(--font-dm-sans)',

  // Font sizes
  xs: '12px',
  sm: '13px',
  base: '14px',
  md: '15px',
  lg: '16px',
  xl: '17px',
  '2xl': '18px',
  '3xl': '22px',

  // Line heights
  tight: 1.4,
  normal: 1.5,
  relaxed: 1.6,
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
} as const

export const borderRadius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const

// Helper function to get type color
export function getTypeColor(type: string): string {
  const normalizedType = type.toLowerCase() as keyof typeof typeColors
  return typeColors[normalizedType] || typeColors.other
}

// Helper function to get type icon
export function getTypeIcon(type: string): string {
  const normalizedType = type.toLowerCase() as keyof typeof typeIcons
  return typeIcons[normalizedType] || typeIcons.other
}
