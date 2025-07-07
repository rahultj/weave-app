'use client'

import { useEffect, useState } from 'react'
import { FileText, Search, AlertCircle, Plus } from 'lucide-react'
import ScrapCard from './ScrapCard'
import { getScraps, Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import ScrapCardSkeleton from './ScrapCardSkeleton'
import EmptyState from './EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrapFeedProps {
  search: string
  onAddClick?: () => void
}

function highlight(text: string, term: string) {
  if (!term) return text
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${escapedTerm})`, 'gi')).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-yellow-200 text-brand-primary px-0.5 rounded">{part}</mark> : part
  )
}

export default function ScrapFeed({ search, onAddClick }: ScrapFeedProps) {
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchScraps() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        const fetchedScraps = await getScraps(user.id)
        setScraps(fetchedScraps || [])
      } catch (error) {
        console.error('Error fetching scraps:', error)
        setError('Failed to load your scraps. Please try again.')
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

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Something went wrong"
        message={error}
        action={{
          label: "Try Again",
          onClick: () => window.location.reload()
        }}
        variant="error"
      />
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon={FileText}
        title="Sign in to view your scraps"
        message="Create an account to start saving and organizing your cultural discoveries."
        action={{
          label: "Sign In",
          onClick: onAddClick || (() => {})
        }}
      />
    )
  }

  if (scraps.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No scraps yet"
        message="Start building your cultural journal by adding your first scrap."
        action={{
          label: "Add Your First Scrap",
          onClick: onAddClick || (() => {})
        }}
      />
    )
  }

  if (filteredScraps.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No matching scraps"
        message={`No scraps found matching "${search}". Try a different search term or add a new scrap.`}
        action={{
          label: "Add New Scrap",
          onClick: onAddClick || (() => {})
        }}
      />
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