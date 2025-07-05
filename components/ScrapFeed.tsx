'use client'

import { useEffect, useState } from 'react'
import ScrapCard from './ScrapCard'
import { getScraps, Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import ScrapCardSkeleton from './ScrapCardSkeleton'

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
        <ScrapCardSkeleton showImage={false} />
        <ScrapCardSkeleton showImage={true} />
        <ScrapCardSkeleton showImage={false} />
      </div>
    )
  }

  if (!scraps || scraps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-neutral-text-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-text-primary mb-2">
            Your scrapbook is empty
          </h3>
          <p className="text-neutral-text-secondary max-w-md mx-auto">
            Start collecting your cultural discoveries. Save quotes, thoughts, and images that inspire you.
          </p>
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