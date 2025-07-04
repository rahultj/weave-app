'use client'

import { useState } from 'react'
import HomeHeader from '@/components/HomeHeader'
import ScrapFeed from '@/components/ScrapFeed'
import FloatingAddButton from '@/components/FloatingAddButton'
import AddEntryModal from '@/components/AddEntryModal'
import { createScrap } from '@/lib/scraps'

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaveScrap = async (scrapData: {
    type: 'text' | 'image',
    title?: string,
    content?: string,
    source?: string,
    imageFile?: File
  }) => {
    try {
      await createScrap({
        type: scrapData.type,
        title: scrapData.title,
        content: scrapData.content,
        source: scrapData.source
      }, scrapData.imageFile)
      
      console.log('✅ Successfully saved scrap!')
    } catch (error) {
      console.error('❌ Error saving scrap:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-bg-main">
      <HomeHeader />
      <ScrapFeed />
      <FloatingAddButton onClick={() => setIsModalOpen(true)} />
      
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveScrap}
      />
    </div>
  )
}