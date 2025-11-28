export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bobbin';
  timestamp: Date;
  media?: {
    type: 'image' | 'audio';
    url: string;
    caption?: string;
  };
  isLoading?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface ChatPageProps {
  initialMessages?: Message[];
}

export interface ChatMessageProps {
  message: Message;
}

export interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
  isTyping?: boolean;
}

export interface ChatHeaderProps {
  onBack: () => void;
  title?: string;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

export interface MediaCaptureProps {
  onCapture: (file: File, caption?: string) => void;
  onCancel: () => void;
  type: 'camera' | 'voice';
}

export interface CameraCaptureProps {
  onCapture: (file: File, caption?: string) => void;
  onCancel: () => void;
}

export interface VoiceRecordProps {
  onRecord: (file: File, caption?: string) => void;
  onCancel: () => void;
}

export interface MediaMessageProps {
  message: Message;
}