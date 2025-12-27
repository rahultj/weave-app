'use client'

import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  path: string
  badge?: number
}

interface BottomNavProps {
  patternsBadge?: number
  exploreBadge?: number
}

export default function BottomNav({ patternsBadge = 0, exploreBadge = 0 }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems: NavItem[] = [
    { id: 'collection', label: 'Collection', path: '/feed' },
    { id: 'patterns', label: 'Patterns', path: '/patterns', badge: patternsBadge },
    { id: 'chat', label: 'Bobbin', path: '/weave-chat' },
    { id: 'explore', label: 'Explore', path: '/explore', badge: exploreBadge },
  ]

  const getActiveTab = () => {
    if (pathname === '/feed' || pathname === '/') return 'collection'
    if (pathname === '/patterns') return 'patterns'
    if (pathname === '/weave-chat' || pathname.startsWith('/conversation')) return 'chat'
    if (pathname === '/explore') return 'explore'
    return 'collection'
  }

  const activeTab = getActiveTab()

  const renderIcon = (id: string, isActive: boolean) => {
    const color = isActive ? '#C9A227' : '#888'

    switch (id) {
      case 'collection':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        )
      case 'patterns':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      case 'chat':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )
      case 'explore':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polygon
              points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              fill={isActive ? color : 'none'}
              stroke={color}
              strokeWidth="1.5"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E5E0] z-50">
      <div className="max-w-[480px] mx-auto">
        <div 
          className="flex items-center justify-around pt-2"
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const badgeCount = item.badge || 0
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center py-1.5 px-4 relative bg-transparent border-none cursor-pointer"
              >
                <div className="relative">
                  {renderIcon(item.id, isActive)}
                  {badgeCount > 0 && (
                    <span 
                      className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-[#C85A5A] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      {badgeCount > 99 ? '99' : badgeCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#C9A227]' : 'text-[#888]'}`}
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
