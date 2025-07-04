'use client'

import { useEffect, useState } from 'react'
import ScrapCard from './ScrapCard'
import { getScraps, Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'

export default function ScrapFeed() {
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchScraps() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const fetchedScraps = await getScraps(user.id)
        setScraps(fetchedScraps || [])
      } catch (error) {
        console.error('Error fetching scraps:', error)
        setScraps([])
      } finally {
        setLoading(false)
      }
    }

    fetchScraps()
  }, [user])

  const handleScrapUpdate = (updatedScrap: Scrap) => {
    setScraps(prev => 
      prev.map(scrap => 
        scrap.id === updatedScrap.id ? updatedScrap : scrap
      )
    )
  }

  const handleScrapDelete = (scrapId: string) => {
    setScraps(prev => prev.filter(scrap => scrap.id !== scrapId))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-neutral-text-muted">
          Loading your scraps...
        </div>
      </div>
    )
  }

  if (!scraps || scraps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-neutral-text-muted">
          No scraps yet. Create your first one!
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {scraps.map((scrap) => (
        <ScrapCard 
          key={scrap.id} 
          scrap={scrap} 
          onUpdate={handleScrapUpdate}
          onDelete={handleScrapDelete}
        />
      ))}
    </div>
  )
}