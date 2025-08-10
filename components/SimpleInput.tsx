'use client'

import { useRouter } from 'next/navigation'
import { Camera, Mic } from 'lucide-react'
import { BobbinIcon4 } from './BobbinIcon4'

interface SimpleInputProps {
  placeholder?: string;
}

export default function SimpleInput({ placeholder = "What's on your mind?" }: SimpleInputProps) {
  const router = useRouter()

  const handleInputClick = () => {
    router.push('/chat')
  }

  const handleCameraClick = () => {
    router.push('/chat?mediaType=camera')
  }

  const handleVoiceClick = () => {
    router.push('/chat?mediaType=voice')
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Bobbin Avatar */}
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
            <BobbinIcon4 size={20} className="text-white" />
          </div>
          
          {/* Input Field */}
          <input 
            type="text"
            placeholder={placeholder}
            onClick={handleInputClick}
            readOnly
            className="flex-1 bg-transparent text-lg placeholder-neutral-text-muted border-none outline-none cursor-pointer py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
          />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCameraClick}
              className="p-2 text-neutral-text-secondary hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Add photo"
            >
              <Camera size={20} />
            </button>
            
            <button 
              onClick={handleVoiceClick}
              className="p-2 text-neutral-text-secondary hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Record voice"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}