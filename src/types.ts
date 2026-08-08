export type Role = 'user' | 'assistant';

export interface AttachedImage {
  data: string; // base64 string without data URL prefix
  mediaType: string; // e.g. "image/jpeg", "image/png"
  name: string;
  preview: string; // data URL for <img> src
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  imagePreview?: string | null;
  timestamp: number;
  provider?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  subject?: string;
}

export interface QuickAction {
  id: string;
  iconName: string;
  label: string;
  hint: string;
  prompt: string;
  category: 'correction' | 'method' | 'planning' | 'mindset';
}

export interface ConfigStatus {
  hasGeminiKey: boolean;
  hasAnthropicKey: boolean;
  activeProvider: string;
}
