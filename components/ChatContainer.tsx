'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { ChatContainerProps } from '@/lib/types/chat';

export default function ChatContainer({ messages, isLoading = false, isTyping = false }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Performance optimization: only render visible messages for very long conversations
  const shouldVirtualize = messages.length > 50;
  const visibleMessages = shouldVirtualize ? messages.slice(-50) : messages;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-h3 font-semibold text-neutral-text-primary mb-2">
            Start a conversation
          </h2>
          <p className="text-body text-neutral-text-secondary leading-relaxed">
            Ask Bobbin about culture, books, art, or anything that inspires you. I'm here to help explore and discuss your interests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Show truncation indicator if virtualizing */}
      {shouldVirtualize && (
        <div className="text-center py-2 mb-4">
          <span className="text-sm text-neutral-text-muted bg-neutral-bg-card px-3 py-1 rounded-full border border-neutral-border">
            Showing recent 50 messages of {messages.length}
          </span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {visibleMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </AnimatePresence>
      
      {/* Typing indicator */}
      {isTyping && (
        <TypingIndicator />
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}