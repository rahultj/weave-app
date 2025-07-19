// components/AddEntryModal.tsx
'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scrap: { 
    type: 'text' | 'image', 
    title?: string, 
    observations?: string, 
    creator?: string, 
    medium?: string,
    imageFile?: File 
  }) => void
  isSaving?: boolean
}

export default function AddEntryModal({ isOpen, onClose, onSave, isSaving = false }: AddEntryModalProps) {
  const [contentType, setContentType] = useState<'text' | 'image'>('text')
  const [observations, setObservations] = useState('')
  const [title, setTitle] = useState('')
  const [creator, setCreator] = useState('')
  const [medium, setMedium] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [titleError, setTitleError] = useState('')
  
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

  const validateForm = () => {
    if (!title.trim()) {
      setTitleError('Name of cultural artifact is required')
      return false
    }
    setTitleError('')
    return true
  }

  const handleSave = async () => {
    if (isSaving) return
    
    // Validate required fields
    if (!validateForm()) return
    
    await onSave({
      type: contentType,
      title: title.trim(),
      observations: observations.trim() || undefined,
      creator: creator.trim() || undefined,
      medium: medium.trim() || undefined,
      imageFile: selectedImage || undefined
    })
    
    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setObservations('')
    setTitle('')
    setCreator('')
    setMedium('')
    setSelectedImage(null)
    setImagePreview(null)
    setContentType('text')
    setTitleError('')
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const removeImage = () => {
    if (!isSaving) {
      setSelectedImage(null)
      setImagePreview(null)
    }
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
              <div className="px-6 py-4 flex items-center justify-between">
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
                  disabled={isSaving}
                  className={`text-brand-primary font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 flex-1 flex flex-col min-h-0 overflow-y-auto space-y-6">
                
                {/* Toggle Buttons */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => !isSaving && setContentType('text')}
                    disabled={isSaving}
                    className={`flex-1 py-3 px-8 rounded-lg font-medium text-sm transition-colors ${
                      contentType === 'text'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => !isSaving && setContentType('image')}
                    disabled={isSaving}
                    className={`flex-1 py-3 px-8 rounded-lg font-medium text-sm transition-colors ${
                      contentType === 'image'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Image
                  </button>
                </div>

                {contentType === 'text' ? (
                  /* TEXT SCRAP LAYOUT */
                  <>
                    {/* Title - REQUIRED */}
                    <div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          if (titleError) setTitleError('')
                        }}
                        placeholder="Name of cultural artifact"
                        className={`w-full bg-transparent border-0 border-b pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base ${
                          titleError ? 'border-red-500' : 'border-neutral-border'
                        }`}
                        style={{ borderBottomWidth: '1px', borderBottomColor: titleError ? '#ef4444' : '#E8E5E0' }}
                        disabled={isSaving}
                      />
                      {titleError && (
                        <p className="text-red-500 text-sm mt-1">{titleError}</p>
                      )}
                    </div>

                    {/* Medium - Optional */}
                    <div>
                      <input
                        type="text"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        placeholder="Medium (book, film, artwork, etc.)"
                        className="w-full bg-transparent border-0 border-b border-neutral-border pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                        style={{ borderBottomWidth: '1px', borderBottomColor: '#E8E5E0' }}
                        disabled={isSaving}
                      />
                    </div>

                    {/* Observations - Optional */}
                    <div>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Share your thoughts and observations about this cultural artifact..."
                        className="w-full bg-neutral-bg-card border border-neutral-border rounded-lg p-4 outline-none resize-none text-neutral-text-primary placeholder-neutral-text-muted text-base leading-relaxed min-h-[120px]"
                        disabled={isSaving}
                      />
                    </div>

                    {/* Creator - Optional */}
                    <div>
                      <input
                        type="text"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                        placeholder="Creator (author, artist, etc.)"
                        className="w-full bg-transparent border-0 border-b border-neutral-border pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                        style={{ borderBottomWidth: '1px', borderBottomColor: '#E8E5E0' }}
                        disabled={isSaving}
                      />
                    </div>
                  </>
                ) : (
                  /* IMAGE SCRAP LAYOUT */
                  <>
                    {/* Image Upload Section */}
                    {!imagePreview ? (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Camera size={48} className="text-neutral-text-muted" />
                        </div>
                        <div>
                          <p className="text-neutral-text-primary font-medium">Add a photo</p>
                          <p className="text-neutral-text-muted text-sm">Capture or upload an image of the artifact</p>
                        </div>
                        <div className="flex gap-4 justify-center">
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
                            <Upload size={16} />
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
                          height={200}
                          className="w-full h-48 object-cover rounded-lg"
                          unoptimized={true}
                        />
                        <button
                          onClick={removeImage}
                          disabled={isSaving}
                          className={`absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Title - REQUIRED */}
                    <div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          if (titleError) setTitleError('')
                        }}
                        placeholder="Name of cultural artifact"
                        className={`w-full bg-transparent border-0 border-b pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base ${
                          titleError ? 'border-red-500' : 'border-neutral-border'
                        }`}
                        style={{ borderBottomWidth: '1px', borderBottomColor: titleError ? '#ef4444' : '#E8E5E0' }}
                        disabled={isSaving}
                      />
                      {titleError && (
                        <p className="text-red-500 text-sm mt-1">{titleError}</p>
                      )}
                    </div>

                    {/* Medium - Optional */}
                    <div>
                      <input
                        type="text"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        placeholder="Medium (book, film, artwork, etc.)"
                        className="w-full bg-transparent border-0 border-b border-neutral-border pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                        style={{ borderBottomWidth: '1px', borderBottomColor: '#E8E5E0' }}
                        disabled={isSaving}
                      />
                    </div>

                    {/* Observations - Optional */}
                    <div>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Share your thoughts about this artifact..."
                        className="w-full bg-neutral-bg-card border border-neutral-border rounded-lg p-4 outline-none resize-none text-neutral-text-primary placeholder-neutral-text-muted text-base leading-relaxed min-h-[100px]"
                        disabled={isSaving}
                      />
                    </div>

                    {/* Creator - Optional */}
                    <div>
                      <input
                        type="text"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                        placeholder="Creator (author, artist, etc.)"
                        className="w-full bg-transparent border-0 border-b border-neutral-border pb-2 outline-none text-neutral-text-primary placeholder-neutral-text-muted text-base"
                        style={{ borderBottomWidth: '1px', borderBottomColor: '#E8E5E0' }}
                        disabled={isSaving}
                      />
                    </div>
                  </>
                )}
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