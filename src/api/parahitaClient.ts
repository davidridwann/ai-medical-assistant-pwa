import type {
  MessageRequest,
  ActionRequest,
  ParahitaResponse,
  RetryConfig,
} from '../types/parahita';
import { isAIAction } from '../types/parahita';

const REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_STORAGE_KEY = 'parahita_chat_id';
const CLIENT_SESSION_TTL_MS = 55 * 60 * 1000; // 55 minutes (5 min buffer before server TTL)

// Default retry config for AI calls
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export class ParahitaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ParahitaApiError';
  }
}

function getBaseUrl(): string {
  let baseUrl = process.env.REACT_APP_API_BASE_URL ?? '';
  
  // Always use relative paths when on HTTPS to avoid mixed content blocking
  // This allows Vercel rewrites (vercel.json) to proxy the request
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
    // Force relative paths on HTTPS - Vercel will proxy via rewrites
    return '';
  }
  
  // For HTTP (local development), use the baseUrl if provided
  // Otherwise return empty string to use relative paths (package.json proxy)
  return baseUrl ? baseUrl.replace(/\/$/, '') : '';
}

export function generateChatId(): number {
  return Math.trunc(Date.now() / 1000) * 1000 + Math.trunc(Math.random() * 1000);
}

export function loadOrCreateChatId(storageKey: string = DEFAULT_STORAGE_KEY): number {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && Number(stored) > 0) return Number(stored);
  } catch {
    /* ignore */
  }
  const id = generateChatId();
  try {
    localStorage.setItem(storageKey, String(id));
  } catch {
    /* ignore */
  }
  return id;
}

export function resetChatId(storageKey: string = DEFAULT_STORAGE_KEY): number {
  const id = generateChatId();
  try {
    localStorage.setItem(storageKey, String(id));
  } catch {
    /* ignore */
  }
  return id;
}

export class ParahitaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retryConfig: RetryConfig;

  constructor(
    baseUrlOrEmpty?: string,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
    retryConfig?: Partial<RetryConfig>
  ) {
    this.baseUrl = baseUrlOrEmpty ?? getBaseUrl();
    this.timeoutMs = timeoutMs;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  async sendMessage(text: string, chatId: number, userId?: number): Promise<ParahitaResponse> {
    const body: MessageRequest = { text: text.trim(), chatId };
    if (userId !== undefined) body.userId = userId;
    return this.post('/api/parahita/message', body);
  }

  async sendAction(
    action: string,
    chatId: number,
    userId?: number,
    retry?: boolean
  ): Promise<ParahitaResponse> {
    const body: ActionRequest = { action, chatId };
    if (userId !== undefined) body.userId = userId;

    // Apply retry logic for AI-intensive actions
    const shouldRetry = retry !== false && isAIAction(action);
    if (shouldRetry) {
      return this.postWithRetry('/api/parahita/action', body);
    }
    return this.post('/api/parahita/action', body);
  }

  /**
   * Check if session has expired based on last activity timestamp
   */
  static isSessionExpired(lastActivity: number): boolean {
    return Date.now() - lastActivity > CLIENT_SESSION_TTL_MS;
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof ParahitaApiError) {
      if (error.status === 0) {
        return 'Koneksi terputus. Periksa koneksi internet Anda dan coba lagi.';
      }
      if (error.status >= 500) {
        return 'Server sedang mengalami masalah. Silakan coba lagi dalam beberapa saat.';
      }
      if (error.status === 404) {
        return 'Endpoint tidak ditemukan. Pastikan API URL benar.';
      }
      return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
  }

  private async post(path: string, body: unknown): Promise<ParahitaResponse> {
    const url = this.baseUrl ? `${this.baseUrl}${path}` : path;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => {
        throw new ParahitaApiError('Invalid response from server', res.status);
      });

      if (!res.ok) {
        const msg = (data?.message ?? data?.detail ?? res.statusText ?? 'Request failed') as string;
        throw new ParahitaApiError(msg, res.status);
      }

      const text = typeof data?.text === 'string' ? data.text.replace(/\\n/g, '\n') : '';
      const keyboard = data?.keyboard;
      const responseData = data?.data;
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development' && keyboard) {
        console.log('ParahitaClient - Received keyboard:', {
          hasKeyboard: !!keyboard,
          hasInlineKeyboard: !!keyboard?.inline_keyboard,
          rows: keyboard?.inline_keyboard?.length || 0,
          keyboard,
        });
      }
      
      // Validate keyboard structure
      const validKeyboard = keyboard && 
        typeof keyboard === 'object' && 
        Array.isArray(keyboard.inline_keyboard) &&
        keyboard.inline_keyboard.length > 0
          ? keyboard
          : undefined;
      
      return { 
        text, 
        ...(validKeyboard && { keyboard: validKeyboard }),
        ...(responseData && { data: responseData }),
      };
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ParahitaApiError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ParahitaApiError(`Request timed out after ${this.timeoutMs}ms`, 0);
      }
      throw new ParahitaApiError(
        err instanceof Error ? err.message : 'Network error',
        0
      );
    }
  }

  /**
   * Post with exponential backoff retry for AI-intensive calls
   */
  private async postWithRetry(path: string, body: unknown): Promise<ParahitaResponse> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.post(path, body);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');

        // Don't retry on client errors (4xx) or if we've exhausted retries
        if (
          err instanceof ParahitaApiError &&
          err.status >= 400 &&
          err.status < 500 &&
          attempt < this.retryConfig.maxRetries
        ) {
          // Still retry once for 4xx errors (might be transient)
        } else if (attempt >= this.retryConfig.maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.retryConfig.maxRetries) {
          // Capture delay value to avoid unsafe reference in closure
          const currentDelay = delay;
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          delay = Math.min(
            delay * this.retryConfig.backoffMultiplier,
            this.retryConfig.maxDelayMs
          );
        }
      }
    }

    throw lastError || new ParahitaApiError('Request failed after retries', 0);
  }
}
