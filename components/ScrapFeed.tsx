'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Search, AlertCircle } from 'lucide-react'
import ScrapCard from './ScrapCard'
import { getScraps, Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import ScrapCardSkeleton from './ScrapCardSkeleton'
import EmptyState from './EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrapFeedProps {
  search: string
  onStartConversation?: () => void
}

function highlight(text: string | undefined, term: string): React.ReactNode {
  if (!text || !term) return text || ''
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${escapedTerm})`, 'gi')).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-yellow-200 text-brand-primary px-0.5 rounded">{part}</mark> : part
  )
}

export default function ScrapFeed({ search, onStartConversation }: ScrapFeedProps) {
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
        const fetchedScraps = await getScraps()
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
          (scrap.observations && scrap.observations.toLowerCase().includes(searchTerm)) ||
          (scrap.creator && scrap.creator.toLowerCase().includes(searchTerm)) ||
          (scrap.tags && scrap.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        )
      })
    : scraps

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 px-4">
        <ScrapCardSkeleton showImage={true} />
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
        icon={MessageCircle}
        title="Sign in to view your conversations"
        message="Create an account to start having conversations with Bobbin about culture."
        action={{
          label: "Sign In",
          onClick: onStartConversation || (() => {})
        }}
      />
    )
  }

  if (scraps.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        message="Start building your cultural journal by having your first conversation with Bobbin."
        action={{
          label: "Start Your First Conversation",
          onClick: onStartConversation || (() => {})
        }}
      />
    )
  }

  if (filteredScraps.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No matching conversations"
        message={`No conversations found matching "${search}". Try a different search term or start a new conversation.`}
        action={{
          label: "Start New Conversation",
          onClick: onStartConversation || (() => {})
        }}
      />
    )
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-8 px-4 py-4 pb-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filteredScraps.map((scrap, i) => {
        const hasSearch = !!searchTerm
        return (
          <ScrapCard
            key={scrap.id}
            scrap={scrap}
            onUpdate={handleScrapUpdate}
            onDelete={handleScrapDelete}
            highlightedTitle={hasSearch && scrap.title ? highlight(scrap.title, searchTerm) : undefined}
            highlightedContent={hasSearch && scrap.observations ? highlight(scrap.observations, searchTerm) : undefined}
            highlightedCreator={hasSearch && scrap.creator ? highlight(scrap.creator, searchTerm) : undefined}
            highlightedTags={hasSearch && scrap.tags ? scrap.tags.map(tag => highlight(tag, searchTerm)) : undefined}
          />
        )
      })}
    </motion.div>
  )
}