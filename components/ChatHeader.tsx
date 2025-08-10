'use client';

import { ArrowLeft } from 'lucide-react';
import { ChatHeaderProps } from '@/lib/types/chat';

export default function ChatHeader({ onBack, title = "Chat with Bobbin" }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-neutral-bg-main/90 backdrop-blur-xl border-b border-neutral-border">
      <div className="flex items-center px-4 py-3 safe-top">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-bg-hover transition-colors mr-3"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-neutral-text-primary" />
        </button>

        {/* Title and subtitle */}
        <div className="flex-1">
          <h1 className="text-h3 font-semibold text-neutral-text-primary">{title}</h1>
          <p className="text-caption text-neutral-text-secondary">Your AI cultural companion</p>
        </div>

        {/* Bobbin avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🐰</span>
          </div>
        </div>
      </div>
    </div>
  );
}