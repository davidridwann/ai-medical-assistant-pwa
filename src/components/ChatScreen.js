import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessage as sendMessageApi } from '../api/chatApi';
import './ChatScreen.css';

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatScreen = ({ messages = [], setMessages }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendTextRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';
      recognition.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript?.trim() || '';
        if (transcript && sendTextRef.current) sendTextRef.current(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort?.();
    };
  }, []);

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
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [setMessages]);

  sendTextRef.current = sendText;

  const handleSend = useCallback(() => {
    sendText(message);
  }, [message, sendText]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }
    setIsListening(true);
    setError(null);
    try {
      recognitionRef.current?.start?.();
    } catch (e) {
      setIsListening(false);
      setError('Could not start microphone');
    }
  };

  const handleQuickAction = (label) => {
    sendText(label);
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="header-spacer" aria-hidden="true" />
        <div className="header-center">
          <div className="header-title-row">
            <div className="orb-pulse"></div>
            <h1>AI Helper</h1>
          </div>
          <span className="header-subtitle">Online Assistant</span>
        </div>
        <button className="icon-button">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </header>

      <main className="chat-main">
        <div className="date-badge">
          <span>Today</span>
        </div>

        {messages.map((msg) => {
          const isLeft = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`message-container ${isLeft ? 'message-left' : 'message-right'}`}
            >
              <div className={`message-bubble ${isLeft ? 'message-ai' : 'message-user'}`}>
                <p>{msg.text}</p>
              </div>
              <span className="message-time">{msg.time}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="message-container message-left">
            <div className="message-bubble message-ai message-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error" role="alert">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <div className="input-section">
        <div className="quick-actions">
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
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => handleQuickAction('Dosage info')}
            disabled={isLoading}
          >
            Dosage info
          </button>
        </div>
        <div className="input-container">
          <button type="button" className="input-icon-btn" aria-label="Attach file">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            className="chat-input"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Message"
          />
          <div className="input-right">
            {speechSupported && (
              <button
                type="button"
                className={`input-icon-btn mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleMicClick}
                disabled={isLoading}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                title={isListening ? 'Listening…' : 'Voice input'}
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
            )}
            <button
              type="button"
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
