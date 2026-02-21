import React, { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useParahitaChat } from '../hooks/useParahitaChat';
import { MessageBubble } from './MessageBubble';
import './ChatScreen.css';

// Type definitions for Web Speech API
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  new (): SpeechRecognitionInterface;
} | undefined;

declare var webkitSpeechRecognition: {
  new (): SpeechRecognitionInterface;
} | undefined;

interface ChatScreenProps {
  baseUrl?: string;
  userId?: number;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ baseUrl, userId }) => {
  const {
    messages,
    sendMessage,
    sendAction,
    isLoading,
    error,
    resetChat,
  } = useParahitaChat({ baseUrl, userId });

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const sendTextRef = useRef<((text: string) => void) | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognitionClass);
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0]?.[0]?.transcript?.trim() || '';
        if (transcript && sendTextRef.current) {
          sendTextRef.current(transcript);
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort?.();
      }
    };
  }, []);

  const handleSendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      sendMessage(trimmed);
      setInput('');
    },
    [sendMessage, isLoading]
  );

  sendTextRef.current = handleSendText;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      handleSendText(input);
    },
    [input, isLoading, handleSendText]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleMicClick = useCallback(() => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }
    setIsListening(true);
    try {
      recognitionRef.current?.start?.();
    } catch (e) {
      setIsListening(false);
    }
  }, [speechSupported, isListening]);

  const handleAction = useCallback(
    (callbackData: string) => {
      sendAction(callbackData);
    },
    [sendAction]
  );

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="header-spacer" aria-hidden="true" />
        <div className="header-center">
          <div className="header-title-row">
            <div className="orb-pulse"></div>
            <h1>Lab Assistant</h1>
          </div>
          <span className="header-subtitle">Parahita Medical Lab</span>
        </div>
        <button
          className="icon-button"
          onClick={resetChat}
          aria-label="Reset session"
          title="Mulai sesi baru"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="chat-main">
        <div className="date-badge">
          <span>Today</span>
        </div>

        {messages.length === 0 && !isLoading && (
          <div className="welcome-message">
            <p>Masukkan nomor lab atau ketik pertanyaan untuk memulai.</p>
          </div>
        )}

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
            <div className="error-content">
              <span>{error}</span>
              {error.includes('timeout') || error.includes('Network') ? (
                <button
                  className="error-retry-btn"
                  onClick={() => {
                    // Clear error and let user retry
                    if (messages.length > 0) {
                      const lastMsg = messages[messages.length - 1];
                      if (lastMsg.role === 'user') {
                        handleSendText(lastMsg.content);
                      }
                    }
                  }}
                >
                  Coba Lagi
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <div className="input-section">
        <form onSubmit={handleSubmit} className="input-container">
          <button
            type="button"
            className="input-icon-btn"
            aria-label="Attach file"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            className="chat-input"
            type="text"
            placeholder="Masukkan nolab atau pertanyaan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
