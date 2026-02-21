import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessage as sendMessageApi } from '../api/chatApi';
import './WelcomeScreen.css';

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WelcomeScreen = ({ messages, setMessages, onStartChat }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendText = useCallback(async (text) => {
    const trimmed = String(text).trim();
    if (!trimmed) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const { reply } = await sendMessageApi(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: reply,
          time: formatTime(),
        },
      ]);
      // After first successful exchange, go to ChatScreen to continue the conversation
      onStartChat();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [setMessages, onStartChat]);

  const handleSendClick = () => {
    const trimmed = message.trim();
    if (trimmed) {
      sendText(trimmed);
    } else {
      onStartChat();
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleQuickAction = (label) => {
    sendText(label);
  };

  return (
    <div className="welcome-screen">
      <header className="welcome-header">
        <button className="icon-button">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1>AI helper</h1>
        <button className="icon-button">
          <span className="material-symbols-rounded">more_vert</span>
        </button>
      </header>

      <main className="welcome-main">
        <div className="welcome-title-section">
          <h2>Your smart assistant for medicine dose</h2>
        </div>

        <div className="category-buttons">
          <button className="category-btn">
            <span className="emoji">🧠</span>
            <span>Painkillers</span>
          </button>
          <button className="category-btn">
            <span className="emoji">💊</span>
            <span>Antibiotics</span>
          </button>
          <button className="category-btn">
            <span className="emoji">🫀</span>
            <span>Cardiovascular</span>
          </button>
        </div>

        <div className="ai-helper-card">
          <div className="orb-container">
            <div className="orb-glow"></div>
            <div className="orb-border"></div>
          </div>
          <div className="ai-helper-text">
            <h3>
              Hi! I'm your medication helper ready{' '}
              <span className="text-muted">to keep you on track.</span>
            </h3>
          </div>
          <button className="mic-button" type="button">
            <span className="material-symbols-rounded">mic</span>
          </button>
        </div>

        {/* Chat messages on welcome */}
        {messages.length > 0 && (
          <div className="welcome-messages">
            {messages.map((msg) => {
              const isLeft = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`welcome-message-row ${isLeft ? 'welcome-message-left' : 'welcome-message-right'}`}
                >
                  <div className={`welcome-message-bubble ${isLeft ? 'welcome-message-ai' : 'welcome-message-user'}`}>
                    <p>{msg.text}</p>
                  </div>
                  <span className="welcome-message-time">{msg.time}</span>
                </div>
              );
            })}
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
        {/* <div className="quick-actions">
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => handleQuickAction('Generate summary')}
            disabled={isLoading}
          >
            Generate summary
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => handleQuickAction('Check compatibility')}
            disabled={isLoading}
          >
            Check compatibility
          </button>
        </div> */}
        <div className="input-container">
          <button type="button" className="input-icon-btn">
            <span className="material-symbols-rounded">link</span>
          </button>
          <input
            className="welcome-input"
            type="text"
            placeholder="Ask me anything"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleInputSubmit}
            disabled={isLoading}
            aria-label="Message"
          />
          <button
            type="button"
            className="send-button"
            onClick={handleSendClick}
            disabled={isLoading}
            aria-label="Send message"
          >
            <span className="material-symbols-rounded send-icon">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
