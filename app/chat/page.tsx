'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ConversationalInput from '@/components/ConversationalInput';
import CameraCapture from '@/components/CameraCapture';
import VoiceRecord from '@/components/VoiceRecord';
import ErrorBanner from '@/components/ErrorBanner';
import { Message } from '@/lib/types/chat';
import { parseChatParams } from '@/lib/navigation';
import { createConversationScrap, updateConversationScrap, getScraps, Scrap } from '@/lib/scraps';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showVoiceRecord, setShowVoiceRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [hasCreatedScrap, setHasCreatedScrap] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Debounced save to avoid too frequent updates
  const debouncedSaveRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback((conversationId: string, sender: 'user' | 'bobbin', message: string) => {
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    
    debouncedSaveRef.current = setTimeout(() => {
      updateConversationScrap(conversationId, sender, message);
    }, 1000); // Save after 1 second of inactivity
  }, []);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Load existing conversation if conversation_id is provided
  const loadExistingConversation = useCallback(async (existingConversationId: string) => {
    setIsLoadingConversation(true);
    try {
      const scraps = await getScraps();
      const conversationScrap = scraps?.find(s => 
        s.type === 'conversation' && (s as any).conversation_id === existingConversationId
      );
      
      if (conversationScrap && (conversationScrap as any).content) {
        const conversationArray = JSON.parse((conversationScrap as any).content);
        const loadedMessages: Message[] = conversationArray.map((msg: any, index: number) => ({
          id: `${msg.sender}_${index}_${Date.now()}`,
          content: msg.message,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(loadedMessages);
        setConversationId(existingConversationId);
        setHasCreatedScrap(true);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || isLoading) return;

    // Create user message with unique ID
    const userMessage: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Create conversation scrap on first message
    if (!hasCreatedScrap) {
      await createConversationScrap(conversationId, content);
      setHasCreatedScrap(true);
    } else {
      // Update existing conversation scrap (debounced)
      debouncedSave(conversationId, 'user', content);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          // For general chat, we'll create a mock scrap object
          scrap: {
            id: 'general-chat',
            title: 'General Conversation',
            type: 'text'
          },
          chatHistory: messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender === 'user' ? 'user' : 'ai',
            timestamp: msg.timestamp
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        // Update user message status to delivered
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        ));

        // Create Bobbin response message
        const bobbinMessage: Message = {
          id: `bobbin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: data.response,
          sender: 'bobbin',
          timestamp: new Date(),
          status: 'delivered',
        };

        setMessages(prev => [...prev, bobbinMessage]);
        
        // Update conversation scrap with Bobbin's response (debounced)
        debouncedSave(conversationId, 'bobbin', data.response);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update user message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ));
      
      setError('Failed to send message. Please check your connection and try again.');
      setRetryMessage(content);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, isLoading, messages]);

  // Retry failed message
  const handleRetry = useCallback(() => {
    if (retryMessage) {
      setError(null);
      setRetryMessage(null);
      handleSendMessage(retryMessage);
    }
  }, [retryMessage, handleSendMessage]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setRetryMessage(null);
  }, []);

  // Handle initial message from URL parameters
  useEffect(() => {
    if (loading || !user || hasProcessedInitialMessage) return;

    const { initialMessage, mediaType } = parseChatParams(searchParams);
    const existingConversationId = searchParams.get('conversation_id');
    
    if (existingConversationId) {
      // Load existing conversation
      loadExistingConversation(existingConversationId);
      setHasProcessedInitialMessage(true);
      // Clean up URL parameters after processing
      router.replace('/chat', { scroll: false });
    } else if (initialMessage) {
      // Auto-send the initial message
      handleSendMessage(initialMessage);
      setHasProcessedInitialMessage(true);
      
      // Clean up URL parameters after processing
      router.replace('/chat', { scroll: false });
    } else if (mediaType) {
      // Handle media type intents by showing capture interface
      if (mediaType === 'camera') {
        setShowCameraCapture(true);
      } else if (mediaType === 'voice') {
        setShowVoiceRecord(true);
      }
      
      setHasProcessedInitialMessage(true);
      
      // Clean up URL parameters after processing
      router.replace('/chat', { scroll: false });
    } else {
      setHasProcessedInitialMessage(true);
    }
  }, [loading, user, searchParams, hasProcessedInitialMessage, router, handleSendMessage, loadExistingConversation]);

  // Upload media file to create a URL (placeholder - you'd typically upload to Supabase Storage)
  const uploadMediaFile = async (file: File): Promise<string> => {
    // For now, create a blob URL for local testing
    // In production, you'd upload to Supabase Storage and return the public URL
    return URL.createObjectURL(file);
  };

  // Handle camera capture
  const handleCameraCapture = async (file: File, caption?: string) => {
    try {
      const mediaUrl = await uploadMediaFile(file);
      
      const userMessage: Message = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: caption || '',
        sender: 'user',
        timestamp: new Date(),
        media: {
          type: 'image',
          url: mediaUrl,
          caption
        }
      };

      setMessages(prev => [...prev, userMessage]);
      setShowCameraCapture(false);

      // Update conversation scrap with media message
      const mediaContext = `[Image shared] ${caption || ''}`.trim();
      if (!hasCreatedScrap) {
        await createConversationScrap(conversationId, mediaContext);
        setHasCreatedScrap(true);
      } else {
        await updateConversationScrap(conversationId, 'user', mediaContext);
      }

      // Send to API for Bobbin's response
      await handleMediaMessage(userMessage);
    } catch (error) {
      console.error('Error handling camera capture:', error);
    }
  };

  // Handle voice recording
  const handleVoiceCapture = async (file: File, caption?: string) => {
    try {
      const mediaUrl = await uploadMediaFile(file);
      
      const userMessage: Message = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: caption || '',
        sender: 'user',
        timestamp: new Date(),
        media: {
          type: 'audio',
          url: mediaUrl,
          caption
        }
      };

      setMessages(prev => [...prev, userMessage]);
      setShowVoiceRecord(false);

      // Update conversation scrap with voice message
      const voiceContext = `[Voice message] ${caption || ''}`.trim();
      if (!hasCreatedScrap) {
        await createConversationScrap(conversationId, voiceContext);
        setHasCreatedScrap(true);
      } else {
        await updateConversationScrap(conversationId, 'user', voiceContext);
      }

      // Send to API for Bobbin's response
      await handleMediaMessage(userMessage);
    } catch (error) {
      console.error('Error handling voice capture:', error);
    }
  };

  // Handle media message API call
  const handleMediaMessage = async (message: Message) => {
    setIsLoading(true);
    try {
      // Create context message for API
      let contextMessage = '';
      if (message.media?.type === 'image') {
        contextMessage = `I'm sharing an image with you. ${message.content ? `Caption: ${message.content}` : ''}`;
      } else if (message.media?.type === 'audio') {
        contextMessage = `I'm sharing a voice message with you. ${message.content ? `Note: ${message.content}` : ''}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextMessage,
          scrap: {
            id: 'general-chat',
            title: 'General Conversation',
            type: 'text'
          },
          chatHistory: messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender === 'user' ? 'user' : 'ai',
            timestamp: msg.timestamp
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        const bobbinMessage: Message = {
          id: `bobbin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: data.response,
          sender: 'bobbin',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, bobbinMessage]);
        
        // Update conversation scrap with Bobbin's response to media
        await updateConversationScrap(conversationId, 'bobbin', data.response);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending media message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your media. Please try again.',
        sender: 'bobbin',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle camera functionality (for ConversationalInput)
  const handleCameraSelect = () => {
    setShowCameraCapture(true);
  };

  // Handle voice functionality (for ConversationalInput)
  const handleVoiceRecord = () => {
    setShowVoiceRecord(true);
  };

  // Handle authentication redirect
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading or redirect if not authenticated
  if (!user) {
    return null;
  }

  // Show loading state while loading conversation
  if (isLoadingConversation) {
    return (
              <div className="min-h-screen bg-white flex flex-col">
        <ChatHeader onBack={handleBack} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-text-secondary">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
            <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <ChatHeader onBack={handleBack} />

      {/* Error Banner */}
      <ErrorBanner 
        message={error} 
        onRetry={retryMessage ? handleRetry : undefined}
        onDismiss={clearError}
      />

      {/* Messages Container */}
      <ChatContainer messages={messages} isLoading={isLoadingConversation} isTyping={isTyping} />

      {/* Input Area */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <ConversationalInput
          onSend={handleSendMessage}
          onCameraSelect={handleCameraSelect}
          onVoiceRecord={handleVoiceRecord}
          disabled={isLoading}
          placeholder="Ask Bobbin anything or share what's on your mind..."
        />
      </div>

      {/* Media Capture Overlays */}
      {showCameraCapture && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCameraCapture(false)}
        />
      )}

      {showVoiceRecord && (
        <VoiceRecord
          onRecord={handleVoiceCapture}
          onCancel={() => setShowVoiceRecord(false)}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
              <div className="min-h-screen bg-white flex flex-col">
        <ChatHeader onBack={() => window.history.back()} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-text-secondary">Loading chat...</p>
          </div>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}