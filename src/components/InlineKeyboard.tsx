import React from 'react';
import type { InlineKeyboard as InlineKeyboardType, InlineButton } from '../types/parahita';
import './InlineKeyboard.css';

interface InlineKeyboardProps {
  keyboard: InlineKeyboardType;
  onAction: (callbackData: string) => void;
  disabled?: boolean;
}

/**
 * Renders inline keyboard buttons from Parahita API response
 * Follows FE_INTEGRATION_GUIDE §4 button handling rules
 */
export const InlineKeyboard: React.FC<InlineKeyboardProps> = ({
  keyboard,
  onAction,
  disabled = false,
}) => {
  if (!keyboard?.inline_keyboard || keyboard.inline_keyboard.length === 0) {
    return null;
  }

  const handleButtonClick = (button: InlineButton) => {
    if (disabled) return;
    onAction(button.callback_data);
  };

  return (
    <div className="inline-keyboard-container">
      {keyboard.inline_keyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="inline-keyboard-row">
          {row.map((button) => (
            <button
              key={button.callback_data}
              type="button"
              className="inline-keyboard-button"
              onClick={() => handleButtonClick(button)}
              disabled={disabled}
              aria-label={button.text}
            >
              {button.text}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
