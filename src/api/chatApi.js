/**
 * Chat API client. Sends user text to the backend and returns the assistant reply.
 * @see .env.example for REACT_APP_API_BASE_URL
 */

const DEFAULT_BASE_URL = 'http://103.20.90.115';
const REQUEST_TIMEOUT_MS = 30000;

/**
 * @param {string} text - User message text
 * @returns {Promise<{ reply: string }>} - API response (reply or message field)
 * @throws {Error} On network error, non-2xx, or invalid JSON
 */
export async function sendMessage(text) {
  // In development, use relative URL so the CRA proxy forwards to the API (avoids CORS)
  const baseUrl = DEFAULT_BASE_URL;
  const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/message` : '/api/message';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: String(text).trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => {
      throw new Error('Invalid response from server');
    });

    if (!res.ok) {
      const message = data?.message || data?.detail || res.statusText || 'Request failed';
      throw new Error(message);
    }

    // Support { text }, { reply }, and { message } response shapes
    let reply = data.text ?? data.reply ?? data.message ?? (typeof data === 'string' ? data : '');
    reply = String(reply)
      // Normalize literal "\n" (backslash-n) to real newlines so they render as line breaks
      .replace(/\\n/g, '\n');
    return { reply };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  }
}
