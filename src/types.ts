export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  modelId?: string;
  senderName?: string;
  senderAvatar?: string;
  views?: number;
}

export interface Chat {
  id: string;
  type: 'PRIVATE' | 'GROUP' | 'CHANNEL';
  name: string;
  avatar?: string;
  lastMessage?: Message;
  participants: string[]; // Model IDs or 'user'
  unreadCount: number;
  subscribers?: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openrouter' | 'huggingface' | 'gemini';
  description: string;
  systemPrompt?: string;
}
