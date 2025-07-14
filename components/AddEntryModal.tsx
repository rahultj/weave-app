// components/AddEntryModal.tsx
'use client'

import { useState, useRef } from 'react'
import { Camera, Image as ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image';

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scrap: { 
    type: 'text' | 'image', 
    title?: string, 
    content?: string, 
    creator?: string, 
    medium?: string,
    imageFile?: File 
  }) => void
  isSaving?: boolean
}

export default function AddEntryModal({ isOpen, onClose, onSave, isSaving = false }: AddEntryModalProps) {
  const [contentType, setContentType] = useState<'text' | 'image'>('text')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [creator, setCreator] = useState('')
  const [medium, setMedium] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

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
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const handleSave = async () => {
    if (isSaving) return
    if (contentType === 'text' && !content.trim()) return
    if (contentType === 'image' && !selectedImage) return
    
    await onSave({
      type: contentType,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      creator: creator.trim() || undefined,
      medium: medium.trim() || undefined,
      imageFile: selectedImage || undefined
    })
    
    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setContent('')
    setTitle('')
    setCreator('')
    setMedium('')
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
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>
                <h2 className="text-lg font-semibold text-neutral-text-primary">
                  New Scrap
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving || (contentType === 'text' && !content.trim()) || (contentType === 'image' && !selectedImage)}
                  className={`text-brand-primary font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>

              {/* Content Type Toggle */}
              <div className="px-6 pt-4">
                <div className="flex bg-neutral-bg-card rounded-lg p-1">
                  <button
                    onClick={() => !isSaving && setContentType('text')}
                    disabled={isSaving}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      contentType === 'text'
                        ? 'bg-brand-primary text-white'
                        : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => !isSaving && setContentType('image')}
                    disabled={isSaving}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      contentType === 'image'
                        ? 'bg-brand-primary text-white'
                        : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Image
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Required fields first */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Name of cultural artifact"
                  className="w-full bg-transparent border-none outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base mb-4"
                  disabled={isSaving}
                />

                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="Medium (book, film, artwork, etc.)"
                  className="w-full bg-transparent border-none outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base mb-4"
                  disabled={isSaving}
                />
                
                {contentType === 'text' ? (
                  /* Text Content */
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts and observations about this cultural artifact..."
                    className="flex-1 min-h-[180px] w-full bg-transparent border-none outline-none resize-none text-neutral-text-primary placeholder-neutral-text-muted text-base leading-relaxed"
                    autoFocus
                    disabled={isSaving}
                  />
                ) : (
                  /* Image Content */
                  <div className="flex-1">
                    {!imagePreview ? (
                      <div className="min-h-[180px] border-2 border-dashed border-neutral-border rounded-lg flex flex-col items-center justify-center gap-4">
                        <div className="text-neutral-text-muted text-center">
                          <Camera size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Add a photo</p>
                          <p className="text-sm">Capture or upload an image of the artifact</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => !isSaving && cameraInputRef.current?.click()}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary hover:bg-neutral-bg-hover transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Camera size={16} />
                            Capture
                          </button>
                          <button
                            onClick={() => !isSaving && fileInputRef.current?.click()}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary hover:bg-neutral-bg-hover transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            if (!isSaving) {
                              setSelectedImage(null)
                              setImagePreview(null)
                            }
                          }}
                          disabled={isSaving}
                          className={`absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    
                    {/* Observation for image */}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts about this artifact..."
                      className="mt-4 w-full bg-transparent border-none outline-none resize-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                      disabled={isSaving}
                    />
                  </div>
                )}

                {/* Creator field */}
                <div className="mt-4">
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Creator (author, artist, director, etc.)"
                    className="w-full bg-transparent border-none outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                className="hidden"
                disabled={isSaving}
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileInput}
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={isSaving}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}