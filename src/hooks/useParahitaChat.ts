import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ParahitaClient } from '../api/parahitaClient';
import { SessionManager } from '../utils/sessionManager';
import type { ChatMessage, InlineKeyboard, ParahitaResponse } from '../types/parahita';

export interface UseParahitaChatOptions {
  baseUrl?: string;
  userId?: number;
  storageKey?: string;
}

export function useParahitaChat(options: UseParahitaChatOptions = {}) {
  const { baseUrl = '', userId } = options;
  const client = useMemo(() => new ParahitaClient(baseUrl), [baseUrl]);
  const [chatId, setChatId] = useState(() => SessionManager.getChatId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const inflightRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // Check session expiry on mount and periodically
  useEffect(() => {
    const checkExpiry = () => {
      if (SessionManager.isExpired()) {
        // Session expired - reset
        const newActivity = SessionManager.resetSession();
        setChatId(newActivity.chatId);
        setMessages([]);
        setError('Sesi telah berakhir. Memulai sesi baru...');
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string, keyboard?: InlineKeyboard, data?: ParahitaResponse['data']) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role,
          content,
          ...(keyboard && { keyboard }),
          ...(data && { data }),
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || inflightRef.current) return;

      // Check session expiry before sending
      if (SessionManager.isExpired()) {
        const newActivity = SessionManager.resetSession();
        setChatId(newActivity.chatId);
        setMessages([]);
        setError('Sesi telah berakhir. Silakan kirim pesan lagi.');
        return;
      }

      inflightRef.current = true;
      setError(null);
      setIsLoading(true);
      setRetryCount(0);
      SessionManager.touchActivity();
      lastActivityRef.current = Date.now();
      addMessage('user', trimmed);

      try {
        const res = await client.sendMessage(trimmed, chatId, userId);
        SessionManager.touchActivity();
        lastActivityRef.current = Date.now();
        addMessage('assistant', res.text, res.keyboard, res.data);
      } catch (err) {
        const errorMessage = ParahitaClient.getErrorMessage(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        inflightRef.current = false;
      }
    },
    [client, chatId, userId, addMessage]
  );

  const sendAction = useCallback(
    async (callbackData: string, retryAttempt = 0) => {
      if (!callbackData || inflightRef.current) return;

      // Check session expiry before sending
      if (SessionManager.isExpired()) {
        const newActivity = SessionManager.resetSession();
        setChatId(newActivity.chatId);
        setMessages([]);
        setError('Sesi telah berakhir. Silakan klik tombol lagi.');
        return;
      }

      inflightRef.current = true;
      setError(null);
      setIsLoading(true);
      SessionManager.touchActivity();
      lastActivityRef.current = Date.now();

      try {
        const res = await client.sendAction(callbackData, chatId, userId, retryAttempt === 0);
        SessionManager.touchActivity();
        lastActivityRef.current = Date.now();

        if (callbackData === 'NEW_QUERY') {
          const newActivity = SessionManager.resetSession();
          setChatId(newActivity.chatId);
          setMessages([]);
        }
        addMessage('assistant', res.text, res.keyboard, res.data);
        setRetryCount(0);
      } catch (err) {
        const errorMessage = ParahitaClient.getErrorMessage(err);
        setError(errorMessage);
        setRetryCount(retryAttempt + 1);
      } finally {
        setIsLoading(false);
        inflightRef.current = false;
      }
    },
    [client, chatId, userId, addMessage]
  );

  const resetChat = useCallback(() => {
    const newActivity = SessionManager.resetSession();
    setChatId(newActivity.chatId);
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setRetryCount(0);
    inflightRef.current = false;
    lastActivityRef.current = Date.now();
  }, []);

  const retryLastAction = useCallback(() => {
    // Find the last assistant message with a keyboard to retry its action
    // This is a simplified retry - in practice, you might want to track the last action
    if (retryCount > 0 && messages.length > 0) {
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg?.keyboard) {
        // For now, just clear error and let user click button again
        setError(null);
        setRetryCount(0);
      }
    }
  }, [retryCount, messages]);

  return {
    messages,
    sendMessage,
    sendAction,
    isLoading,
    error,
    resetChat,
    chatId,
    retryCount,
    retryLastAction,
  };
}
