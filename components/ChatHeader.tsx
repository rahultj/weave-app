'use client';

import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ChatHeaderProps } from '@/lib/types/chat';

export default function ChatHeader({
  onBack,
  title = "Chat with Bobbin",
  onSave,
  isSaving = false,
  canSave = false
}: ChatHeaderProps) {
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

        {/* Save button */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={!canSave || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            aria-label="Save conversation"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}