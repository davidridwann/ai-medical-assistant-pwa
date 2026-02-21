import React from 'react';
import type { ChatMessage } from '../types/parahita';
import { parseTelegramMarkdown } from '../utils/telegramMarkdown';
import { InlineKeyboard } from './InlineKeyboard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  onAction: (callbackData: string) => void;
  disabled?: boolean;
}

/**
 * Renders a chat message bubble with markdown formatting and optional inline keyboard
 * Only the latest assistant message shows buttons (FE_INTEGRATION_GUIDE §4)
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest,
  onAction,
  disabled = false,
}) => {
  const isUser = message.role === 'user';
  const formattedContent = parseTelegramMarkdown(message.content);
  const showKeyboard = !isUser && isLatest && message.keyboard;

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`message-container ${isUser ? 'message-right' : 'message-left'}`}
      role={isUser ? 'user' : 'assistant'}
    >
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-ai'}`}>
        <div className="message-content">{formattedContent}</div>
        {showKeyboard && (
          <InlineKeyboard
            keyboard={message.keyboard!}
            onAction={onAction}
            disabled={disabled}
          />
        )}
      </div>
      <span className="message-time" aria-label={`Sent at ${formatTime(message.timestamp)}`}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};
