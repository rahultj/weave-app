'use client';

import { motion } from 'framer-motion';
import { Loader2, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { ChatMessageProps } from '@/lib/types/chat';
import MediaMessage from './MediaMessage';

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isBobbin = message.sender === 'bobbin';

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar for Bobbin */}
        {isBobbin && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🐰</span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl relative ${
              isUser
                ? 'bg-brand-primary text-white rounded-br-md'
                : 'bg-neutral-bg-card border border-neutral-border text-neutral-text-primary rounded-bl-md'
            }`}
          >
            {/* Loading state for Bobbin */}
            {message.isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span className="text-neutral-text-secondary">Bobbin is thinking...</span>
              </div>
            ) : (
              <>
                {message.content && (
                  <p className="text-body leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
                <MediaMessage message={message} />
              </>
            )}
          </div>

          {/* Timestamp and Status */}
          {!message.isLoading && (
            <div className={`mt-1 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className="text-caption text-neutral-text-muted">
                {formatTime(message.timestamp)}
              </span>
              {/* Status indicator for user messages */}
              {isUser && message.status && (
                <div className="flex items-center">
                  {message.status === 'sending' && (
                    <Loader2 className="w-3 h-3 text-neutral-text-muted animate-spin" />
                  )}
                  {message.status === 'sent' && (
                    <Check className="w-3 h-3 text-neutral-text-muted" />
                  )}
                  {message.status === 'delivered' && (
                    <CheckCheck className="w-3 h-3 text-neutral-text-muted" />
                  )}
                  {message.status === 'failed' && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}