'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp?: string;
}

interface Scrap {
  id: string;
  title: string | null;
  observations?: string | null;
  image_url?: string | null;
  creator?: string | null;
  medium?: string | null;
  created_at: string;
}

interface BobinChatDialogProps {
  scrap: Scrap;
  isOpen: boolean;
  onClose: () => void;
}

export function BobinChatDialog({ scrap, isOpen, onClose }: BobinChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { 
      id: Date.now(), 
      content: input.trim(), 
      sender: 'user' 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          scrap: scrap,
          chatHistory: messages
        })
      });

      if (!response.ok) throw new Error('Chat API error');

      const data = await response.json();
      const aiMessage: ChatMessage = { 
        id: Date.now() + 1, 
        content: data.response || 'Sorry, I had trouble responding to that.', 
        sender: 'ai' 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chat with Bobbin</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex max-h-[calc(85vh-120px)]">
          {/* Context Sidebar */}
          <div className="w-1/3 border-r border-gray-100 p-6 bg-gray-50 overflow-y-auto hidden md:block">
            <div className="sticky top-0">
              <h3 className="font-medium text-gray-900 mb-4">About this scrap</h3>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                {scrap.image_url && (
                  <div className="mb-3">
                    <Image 
                      src={scrap.image_url} 
                      alt={scrap.title || 'Scrap image'}
                      width={300}
                      height={200}
                      className="w-full aspect-video object-cover rounded-lg"
                      unoptimized={true}
                    />
                  </div>
                )}
                
                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                  {scrap.title || 'Untitled'}
                </h4>
                
                {scrap.observations && (
                  <p className="text-gray-600 text-sm line-clamp-4 mb-3">
                    {scrap.observations}
                  </p>
                )}
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 space-y-1">
                    {scrap.creator && <div><span className="font-medium">Creator:</span> {scrap.creator}</div>}
                    {scrap.medium && <div><span className="font-medium">Type:</span> {scrap.medium}</div>}
                    <div><span className="font-medium">Added:</span> {formatDate(scrap.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Mobile context header - only visible on small screens */}
            <div className="md:hidden border-b border-gray-100 p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                {scrap.title || 'Untitled'}
              </h4>
              {scrap.creator && (
                <p className="text-xs text-gray-500 mt-1">by {scrap.creator}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <p className="text-gray-600 mb-2 font-medium">Start a conversation with Bobbin</p>
                  <p className="text-gray-500 text-sm">Ask about connections, deeper meanings, or cultural context</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-[#C85A5A] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="text-xs font-semibold text-[#C85A5A] mb-2">BOBBIN</div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-content">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl max-w-[85%]">
                    <div className="text-xs font-semibold text-[#C85A5A] mb-2">BOBBIN</div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C85A5A]" />
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-6">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Bobbin about this scrap..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85A5A]/50 focus:border-[#C85A5A] resize-none text-content"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 bg-[#C85A5A] text-white rounded-xl hover:bg-[#B64A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}