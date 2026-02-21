import React, { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useParahitaChat } from '../hooks/useParahitaChat';
import { MessageBubble } from './MessageBubble';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  baseUrl?: string;
  userId?: number;
  onStartChat: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ baseUrl, userId, onStartChat }) => {
  const {
    messages,
    sendMessage,
    sendAction,
    isLoading,
    error,
  } = useParahitaChat({ baseUrl, userId });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-navigate to chat screen after first message exchange
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        onStartChat();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isLoading, onStartChat]);

  const handleSendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      sendMessage(trimmed);
      setInput('');
    },
    [sendMessage, isLoading]
  );

  const handleSendClick = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed) {
      handleSendText(trimmed);
    } else {
      onStartChat();
    }
  }, [input, handleSendText, onStartChat]);

  const handleInputSubmit = useCallback(
    (e: FormEvent) => {
      if (e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        handleSendClick();
      }
    },
    [handleSendClick]
  );

  const handleAction = useCallback(
    (callbackData: string) => {
      sendAction(callbackData);
    },
    [sendAction]
  );

  return (
    <div className="welcome-screen">
      <header className="welcome-header">
        <button className="icon-button" aria-label="Back">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1>Lab Assistant</h1>
        <button className="icon-button" aria-label="More options">
          <span className="material-symbols-rounded">more_vert</span>
        </button>
      </header>

      <main className="welcome-main">
        <div className="welcome-title-section">
          <h2>Asisten Lab Parahita</h2>
          <p className="welcome-subtitle">Cek hasil lab, tanya tentang kesehatan, dan dapatkan rekomendasi dokter</p>
        </div>

        <div className="ai-helper-card">
          <div className="orb-container">
            <div className="orb-glow"></div>
            <div className="orb-border"></div>
          </div>
          <div className="ai-helper-text">
            <h3>
              Halo! Saya asisten lab Anda.{' '}
              <span className="text-muted">Masukkan nomor lab atau tanyakan sesuatu.</span>
            </h3>
          </div>
        </div>

        {/* Chat messages on welcome */}
        {messages.length > 0 && (
          <div className="welcome-messages">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={idx === messages.length - 1}
                onAction={handleAction}
                disabled={isLoading}
              />
            ))}
            {isLoading && (
              <div className="welcome-message-row welcome-message-left">
                <div className="welcome-message-bubble welcome-message-ai welcome-typing">
                  <span className="welcome-typing-dot" />
                  <span className="welcome-typing-dot" />
                  <span className="welcome-typing-dot" />
                </div>
              </div>
            )}
            {error && (
              <div className="welcome-chat-error" role="alert">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <div className="input-section">
        <form onSubmit={handleInputSubmit} className="input-container">
          <button type="button" className="input-icon-btn" aria-label="Link" disabled={isLoading}>
            <span className="material-symbols-rounded">link</span>
          </button>
          <input
            className="welcome-input"
            type="text"
            placeholder="Masukkan nolab atau tanyakan sesuatu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputSubmit}
            disabled={isLoading}
            aria-label="Message"
          />
          <button
            type="submit"
            className="send-button"
            onClick={handleSendClick}
            disabled={isLoading}
            aria-label="Send message"
          >
            <span className="material-symbols-rounded send-icon">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;
