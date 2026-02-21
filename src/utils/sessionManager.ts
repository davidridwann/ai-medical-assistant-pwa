import { loadOrCreateChatId, resetChatId } from '../api/parahitaClient';
import type { SessionActivity } from '../types/parahita';

const CLIENT_SESSION_TTL_MS = 55 * 60 * 1000; // 55 minutes (5 min buffer before server TTL of 60 min)
const ACTIVITY_STORAGE_KEY = 'parahita_session_activity';
const CHAT_ID_STORAGE_KEY = 'parahita_chat_id';

/**
 * Session manager utilities for tracking activity and detecting expiry
 */
export class SessionManager {
  /**
   * Get or create session activity tracking
   */
  static getActivity(): SessionActivity {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        const activity: SessionActivity = JSON.parse(stored);
        // Validate stored activity
        if (
          typeof activity.lastActivity === 'number' &&
          typeof activity.chatId === 'number' &&
          activity.chatId > 0
        ) {
          return activity;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Create new activity
    const chatId = loadOrCreateChatId(CHAT_ID_STORAGE_KEY);
    const activity: SessionActivity = {
      lastActivity: Date.now(),
      chatId,
    };
    this.saveActivity(activity);
    return activity;
  }

  /**
   * Update last activity timestamp
   */
  static touchActivity(): void {
    const activity = this.getActivity();
    activity.lastActivity = Date.now();
    this.saveActivity(activity);
  }

  /**
   * Check if session has expired
   */
  static isExpired(): boolean {
    const activity = this.getActivity();
    return Date.now() - activity.lastActivity > CLIENT_SESSION_TTL_MS;
  }

  /**
   * Reset session (new chatId and fresh activity)
   */
  static resetSession(): SessionActivity {
    const newChatId = resetChatId(CHAT_ID_STORAGE_KEY);
    const activity: SessionActivity = {
      lastActivity: Date.now(),
      chatId: newChatId,
    };
    this.saveActivity(activity);
    return activity;
  }

  /**
   * Get current chatId from activity
   */
  static getChatId(): number {
    return this.getActivity().chatId;
  }

  /**
   * Save activity to localStorage
   */
  private static saveActivity(activity: SessionActivity): void {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
      localStorage.setItem(CHAT_ID_STORAGE_KEY, String(activity.chatId));
    } catch {
      // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
  }
}
