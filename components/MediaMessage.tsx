'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediaMessageProps } from '@/lib/types/chat';

export default function MediaMessage({ message }: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { media } = message;
  if (!media) return null;

  // Handle audio playback
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Handle audio events
  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioEnded = () => setIsPlaying(false);

  if (media.type === 'image') {
    return (
      <div className="mt-2">
        {!imageError ? (
          <div className="relative rounded-lg overflow-hidden bg-neutral-bg-hover max-w-sm">
            {!isImageLoaded && (
              <div className="aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-neutral-text-muted">
                  <ImageIcon size={24} />
                  <span className="text-sm">Loading image...</span>
                </div>
              </div>
            )}
            <img
              src={media.url}
              alt={media.caption || 'Shared image'}
              className={`w-full h-auto max-w-sm rounded-lg transition-opacity ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setIsImageLoaded(true);
              }}
            />
            {media.caption && isImageLoaded && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                <p className="text-sm">{media.caption}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-neutral-bg-hover rounded-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 text-neutral-text-muted">
              <ImageIcon size={20} />
              <span className="text-sm">Image could not be loaded</span>
            </div>
            {media.caption && (
              <p className="text-sm text-neutral-text-secondary mt-2">{media.caption}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (media.type === 'audio') {
    return (
      <div className="mt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-bg-card border border-neutral-border rounded-lg p-3 max-w-xs"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isPlaying 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-neutral-bg-hover text-neutral-text-primary hover:bg-brand-primary hover:text-white'
              }`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 size={14} className="text-neutral-text-muted" />
                <span className="text-sm text-neutral-text-secondary">Voice message</span>
              </div>
              
              {/* Simple audio waveform visualization */}
              <div className="flex items-center gap-1 h-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-colors ${
                      isPlaying && i < 8
                        ? 'bg-brand-primary'
                        : 'bg-neutral-border'
                    }`}
                    style={{
                      height: `${Math.random() * 16 + 4}px`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {media.caption && (
            <p className="text-sm text-neutral-text-secondary mt-2 pt-2 border-t border-neutral-border">
              {media.caption}
            </p>
          )}

          <audio
            ref={audioRef}
            src={media.url}
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </motion.div>
      </div>
    );
  }

  return null;
}