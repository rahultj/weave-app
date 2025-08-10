'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type MediaType = 'camera' | 'voice';

/**
 * Navigate to the chat page with optional initial message or media type
 */
export function navigateToChat(
  router: AppRouterInstance,
  options?: {
    message?: string;
    mediaType?: MediaType;
  }
) {
  const params = new URLSearchParams();
  
  if (options?.message) {
    params.set('message', options.message);
  }
  
  if (options?.mediaType) {
    params.set('mediaType', options.mediaType);
  }

  const url = params.toString() ? `/chat?${params.toString()}` : '/chat';
  router.push(url);
}

/**
 * Parse chat URL parameters
 */
export function parseChatParams(searchParams: URLSearchParams) {
  const message = searchParams.get('message');
  const mediaType = searchParams.get('mediaType') as MediaType | null;
  
  return {
    initialMessage: message || undefined,
    mediaType: mediaType || undefined,
  };
}

/**
 * Helper to navigate to chat with a message
 */
export function navigateToChatWithMessage(router: AppRouterInstance, message: string) {
  navigateToChat(router, { message });
}

/**
 * Helper to navigate to chat with camera intent
 */
export function navigateToChatWithCamera(router: AppRouterInstance) {
  navigateToChat(router, { mediaType: 'camera' });
}

/**
 * Helper to navigate to chat with voice intent
 */
export function navigateToChatWithVoice(router: AppRouterInstance) {
  navigateToChat(router, { mediaType: 'voice' });
}