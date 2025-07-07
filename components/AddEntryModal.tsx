// components/AddEntryModal.tsx
'use client'

import { useState, useRef } from 'react'
import { Camera, Image as ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image';

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scrap: { type: 'text' | 'image', title?: string, content?: string, source?: string, imageFile?: File }) => void
}

export default function AddEntryModal({ isOpen, onClose, onSave }: AddEntryModalProps) {
  const [contentType, setContentType] = useState<'text' | 'image'>('text')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleSave = async () => {
    if (contentType === 'text' && !content.trim()) return
    if (contentType === 'image' && !selectedImage) return
    
    setIsSaving(true)
    await onSave({
      type: contentType,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      source: source.trim() || undefined,
      imageFile: selectedImage || undefined
    })
    
    // Reset form
    resetForm()
    setIsSaving(false)
    onClose()
  }

  const resetForm = () => {
    setContent('')
    setTitle('')
    setSource('')
    setSelectedImage(null)
    setImagePreview(null)
    setContentType('text')
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleCancel}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-bg-main w-full max-w-md max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="bg-neutral-bg-card px-4 py-4 border-b border-neutral-border flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="text-brand-primary font-medium"
                >
                  Cancel
                </motion.button>
                <h2 className="text-lg font-semibold text-neutral-text-primary">
                  New Scrap
                </h2>
                <div className="text-xs text-neutral-text-muted">
                  {isSaving ? 'Saving...' : ''}
                </div>
              </div>

              {/* Content Type Toggle */}
              <div className="px-6 pt-4">
                <div className="flex bg-neutral-bg-card rounded-lg p-1">
                  <button
                    onClick={() => setContentType('text')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      contentType === 'text'
                        ? 'bg-brand-primary text-white'
                        : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentType('image')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      contentType === 'image'
                        ? 'bg-brand-primary text-white'
                        : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                    }`}
                  >
                    Image
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
                
                {contentType === 'text' ? (
                  /* Text Content */
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 min-h-[180px] w-full bg-transparent border-none outline-none resize-none text-neutral-text-primary placeholder-neutral-text-muted text-base leading-relaxed"
                    autoFocus
                  />
                ) : (
                  /* Image Content */
                  <div className="flex-1">
                    {!imagePreview ? (
                      <div className="min-h-[180px] border-2 border-dashed border-neutral-border rounded-lg flex flex-col items-center justify-center gap-4">
                        <div className="text-neutral-text-muted text-center">
                          <Camera size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Add a photo</p>
                          <p className="text-sm">Capture or upload an image</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary hover:bg-neutral-bg-hover transition-colors"
                          >
                            <ImageIcon size={16} />
                            Upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
  src={imagePreview}
  alt="Preview"
  width={400}
  height={192}
  className="w-full h-48 object-cover rounded-lg"
  unoptimized={true}
/>
                        <button
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    
                    {/* Caption for image */}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Add a caption (optional)"
                      className="mt-4 w-full h-20 bg-neutral-bg-card border border-neutral-border rounded-lg px-3 py-2 text-neutral-text-primary placeholder-neutral-text-muted outline-none focus:border-brand-primary transition-colors resize-none"
                    />
                  </div>
                )}
                
                {/* Source Input */}
                <div className="mt-4">
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Source (e.g., Author, Book, Movie)"
                    className="w-full bg-neutral-bg-card border border-neutral-border rounded-lg px-3 py-2.5 text-neutral-text-primary placeholder-neutral-text-muted outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                
                {/* Title Input */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a title (optional)"
                    className="w-full bg-neutral-bg-card border border-neutral-border rounded-lg px-3 py-2.5 text-neutral-text-primary placeholder-neutral-text-muted outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={
                    (contentType === 'text' && !content.trim()) ||
                    (contentType === 'image' && !selectedImage) ||
                    isSaving
                  }
                  className="mt-6 w-full bg-brand-primary text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-hover transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Scrap'}
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}