'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraCaptureProps } from '@/lib/types/chat';

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from camera or gallery
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Store file for later use
    setCapturedFile(file);
  }, []);

  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  // Trigger camera/gallery selection
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle sending the captured image
  const handleSend = () => {
    if (capturedFile) {
      onCapture(capturedFile, caption.trim() || undefined);
    }
  };

  // Handle retaking photo
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setCaption('');
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-neutral-bg-main"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-border safe-top">
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-bg-hover transition-colors"
            aria-label="Cancel"
          >
            <X size={20} className="text-neutral-text-primary" />
          </button>
          <h1 className="text-h3 font-semibold text-neutral-text-primary">Add Photo</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {!capturedImage ? (
            // Camera selection view
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center mb-6">
                <Camera size={32} className="text-white" />
              </div>
              
              <h2 className="text-h2 font-semibold text-neutral-text-primary mb-2 text-center">
                Share a photo with Bobbin
              </h2>
              
              <p className="text-body text-neutral-text-secondary text-center mb-8 max-w-sm">
                Take a photo or choose from your gallery to share with your AI companion
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleCameraClick}
                className="bg-brand-primary text-white px-8 py-4 rounded-full text-body font-medium hover:bg-brand-hover transition-colors"
              >
                Choose Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            // Image preview and caption view
            <div className="flex-1 flex flex-col">
              {/* Image preview */}
              <div className="flex-1 flex items-center justify-center p-4 bg-black">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              {/* Caption input */}
              <div className="p-4 border-t border-neutral-border bg-neutral-bg-main">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption (optional)..."
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg resize-none text-body placeholder:text-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={handleRetake}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm">Retake</span>
                  </button>
                  
                  <button
                    onClick={handleSend}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 rounded-full hover:bg-brand-hover transition-colors"
                  >
                    <Check size={16} />
                    <span className="text-sm font-medium">Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}