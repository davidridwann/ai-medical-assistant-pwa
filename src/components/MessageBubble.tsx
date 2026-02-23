import React from 'react';
import type { ChatMessage } from '../types/parahita';
import { parseTelegramMarkdown } from '../utils/telegramMarkdown';
import { InlineKeyboard } from './InlineKeyboard';
import { PromoSlide } from './PromoSlide';
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
  // Only show keyboard on latest assistant message (FE_INTEGRATION_GUIDE §4)
  const showKeyboard = !isUser && isLatest && message.keyboard;

  // Check if TO_FRONT_OFFICE action is present in keyboard buttons
  const hasFrontOfficeAction = showKeyboard && message.keyboard?.inline_keyboard?.some(
    row => row.some(button => button.callback_data === 'TO_FRONT_OFFICE')
  );

  // Check if promos are available
  const promos = message.data?.promos;
  const showPromos = !isUser && isLatest && hasFrontOfficeAction && promos && promos.length > 0;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development' && message.keyboard) {
    console.log('MessageBubble - Keyboard detected:', {
      isUser,
      isLatest,
      hasKeyboard: !!message.keyboard,
      showKeyboard,
      hasFrontOfficeAction,
      hasPromos: !!promos,
      promosCount: promos?.length || 0,
      keyboard: message.keyboard,
    });
  }

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
        {showKeyboard && message.keyboard && (
          <InlineKeyboard
            keyboard={message.keyboard}
            onAction={onAction}
            disabled={disabled}
          />
        )}
        {showPromos && promos && (
          <PromoSlide promos={promos} />
        )}
      </div>
      <span className="message-time" aria-label={`Sent at ${formatTime(message.timestamp)}`}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};
