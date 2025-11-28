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
  const [isSaving, setIsSaving] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle saving conversation as scrap
  const handleSaveConversation = useCallback(async () => {
    if (messages.length === 0) {
      alert('No conversation to save yet');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      const data = await response.json();

      if (data.success) {
        alert('Conversation saved successfully!');
        // Navigate back to feed to see the saved scrap
        router.push('/app');
      } else {
        console.error('Save failed:', data.error);
        alert(`Failed to save conversation: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Failed to save conversation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [messages, router]);

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

    if (initialMessage) {
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
  }, [loading, user, searchParams, hasProcessedInitialMessage, router, handleSendMessage]);

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

  return (
            <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <ChatHeader
        onBack={handleBack}
        onSave={handleSaveConversation}
        isSaving={isSaving}
        canSave={messages.length > 0}
      />

      {/* Error Banner */}
      <ErrorBanner 
        message={error} 
        onRetry={retryMessage ? handleRetry : undefined}
        onDismiss={clearError}
      />

      {/* Messages Container */}
      <ChatContainer messages={messages} isTyping={isTyping} />

      {/* Input Area */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <ConversationalInput
          onSend={handleSendMessage}
          onCameraSelect={handleCameraSelect}
          onVoiceRecord={handleVoiceRecord}
          disabled={isLoading}
          placeholder="What interests you?"
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