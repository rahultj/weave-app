'use client'

import { useEffect, useState } from 'react'
import ScrapCard from './ScrapCard'
import { getScraps, Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import ScrapCardSkeleton from './ScrapCardSkeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrapFeedProps {
  search: string
}

function highlight(text: string, term: string) {
  if (!term) return text
  // Escape special regex characters in the term
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${escapedTerm})`, 'gi')).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-yellow-200 text-brand-primary px-0.5 rounded">{part}</mark> : part
  )
}

export default function ScrapFeed({ search }: ScrapFeedProps) {
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

  // Filter scraps by search term
  const searchTerm = search.trim().toLowerCase()
  const filteredScraps = searchTerm
    ? scraps.filter(scrap => {
        return (
          (scrap.title && scrap.title.toLowerCase().includes(searchTerm)) ||
          (scrap.content && scrap.content.toLowerCase().includes(searchTerm)) ||
          (scrap.source && scrap.source.toLowerCase().includes(searchTerm)) ||
          (scrap.tags && scrap.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        )
      })
    : scraps

  if (loading) {
    return (
      <div className="space-y-6">
        <ScrapCardSkeleton showImage={false} />
        <ScrapCardSkeleton showImage={true} />
        <ScrapCardSkeleton showImage={false} />
      </div>
    )
  }

  if (!filteredScraps || filteredScraps.length === 0) {
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
            No scraps found
          </h3>
          <p className="text-neutral-text-secondary max-w-md mx-auto">
            Try a different search term or add new scraps to your collection.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6 mt-6"
      initial="hidden"
      animate="visible"
      variants={{}}
    >
      {filteredScraps.map((scrap, i) => {
        const hasSearch = !!searchTerm
        return (
          <motion.div
            key={scrap.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ delay: i * 0.08, duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            layout
          >
            <ScrapCard
              scrap={scrap}
              onUpdate={handleScrapUpdate}
              onDelete={handleScrapDelete}
              highlightedTitle={hasSearch && scrap.title ? highlight(scrap.title, searchTerm) : undefined}
              highlightedContent={hasSearch && scrap.content ? highlight(scrap.content, searchTerm) : undefined}
              highlightedSource={hasSearch && scrap.source ? highlight(scrap.source, searchTerm) : undefined}
              highlightedTags={hasSearch && scrap.tags ? scrap.tags.map(tag => highlight(tag, searchTerm)) : undefined}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}