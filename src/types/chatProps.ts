import type { ChatMessage } from './parahita';

/**
 * Shared chat props interface for components that use Parahita chat functionality
 * This ensures type consistency when passing chat state between components
 */
export interface ChatProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  sendAction: (callbackData: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetChat: () => void;
  chatId: number;
}
