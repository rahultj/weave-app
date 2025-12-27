import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomNav from '@/components/BottomNav'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/feed',
}))

describe('BottomNav', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders all navigation items', () => {
    render(<BottomNav />)
    
    expect(screen.getByText('Collection')).toBeInTheDocument()
    expect(screen.getByText('Patterns')).toBeInTheDocument()
    expect(screen.getByText('Bobbin')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
  })

  it('navigates to correct routes when clicked', () => {
    render(<BottomNav />)
    
    fireEvent.click(screen.getByText('Patterns'))
    expect(mockPush).toHaveBeenCalledWith('/patterns')
    
    fireEvent.click(screen.getByText('Bobbin'))
    expect(mockPush).toHaveBeenCalledWith('/weave-chat')
    
    fireEvent.click(screen.getByText('Explore'))
    expect(mockPush).toHaveBeenCalledWith('/explore')
  })

  it('shows badge when exploreBadge > 0', () => {
    render(<BottomNav exploreBadge={5} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('hides badge when count is 0', () => {
    render(<BottomNav exploreBadge={0} />)
    
    // Badge should not be rendered
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows 99 for large badge counts', () => {
    render(<BottomNav exploreBadge={150} />)
    
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})

