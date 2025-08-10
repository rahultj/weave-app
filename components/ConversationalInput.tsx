'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, Send } from 'lucide-react';
import { navigateToChatWithMessage, navigateToChatWithCamera, navigateToChatWithVoice } from '@/lib/navigation';

interface ConversationalInputProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Legacy props for backward compatibility (optional)
  onSend?: (message: string) => void;
  onCameraSelect?: () => void;
  onVoiceRecord?: () => void;
}

export default function ConversationalInput({
  onSend,
  onCameraSelect,
  onVoiceRecord,
  placeholder = "Ask Bobbin anything or share what's on your mind...",
  disabled = false,
  className = "",
}: ConversationalInputProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height equivalent to about 6 lines (18px * 1.5 line-height * 6 + padding)
      const maxHeight = 162;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, []);

  // Handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send message
  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    const trimmedMessage = message.trim();
    
    // Use legacy callback if provided, otherwise use new navigation
    if (onSend) {
      onSend(trimmedMessage);
    } else {
      navigateToChatWithMessage(router, trimmedMessage);
    }
    
    setMessage('');
    
    // Reset textarea height after clearing
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 0);
  };

  // Auto-resize on message change
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const hasMessage = message.trim().length > 0;

  return (
    <div className={`bg-neutral-bg-card border border-neutral-border rounded-card p-4 ${className}`}>
      {/* Main Input Area */}
      <div className="flex gap-3 mb-3">
        {/* Bobbin Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🐰</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none bg-transparent border-none outline-none text-lg text-neutral-text-primary placeholder-neutral-text-muted leading-relaxed min-h-[27px] overflow-hidden focus:ring-0"
            style={{ fontSize: '18px' }}
            rows={1}
            aria-label="Message input"
            autoComplete="off"
            spellCheck="true"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Left side - Tool buttons */}
        <div className="flex items-center gap-2">
          {/* Camera Button */}
          <button
            type="button"
            onClick={() => {
              if (onCameraSelect) {
                onCameraSelect();
              } else {
                navigateToChatWithCamera(router);
              }
            }}
            disabled={disabled}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-text-secondary hover:text-brand-primary hover:bg-neutral-bg-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add photo"
          >
            <Camera size={18} strokeWidth={2} />
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={() => {
              if (onVoiceRecord) {
                onVoiceRecord();
              } else {
                navigateToChatWithVoice(router);
              }
            }}
            disabled={disabled}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-text-secondary hover:text-brand-primary hover:bg-neutral-bg-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Record voice message"
          >
            <Mic size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Right side - Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!hasMessage || disabled}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            hasMessage && !disabled
              ? 'bg-brand-primary text-white hover:bg-brand-hover opacity-100'
              : 'bg-brand-primary text-white opacity-50 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}