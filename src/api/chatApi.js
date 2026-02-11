/**
 * Chat API client. Sends user text to the backend and returns the assistant reply.
 * @see .env.example for REACT_APP_API_BASE_URL
 */

const REQUEST_TIMEOUT_MS = 30000;

/**
 * @param {string} text - User message text
 * @returns {Promise<{ reply: string }>} - API response (reply or message field)
 * @throws {Error} On network error, non-2xx, or invalid JSON
 */
export async function sendMessage(text) {
  // On HTTPS (e.g. Vercel): use relative /api/message so vercel.json rewrite proxies to external HTTP API (browser blocks direct HTTP).
  // On HTTP or when REACT_APP_API_BASE_URL is an HTTPS URL: use it. Otherwise use relative for local proxy.
  let baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  if (
    typeof window !== 'undefined' &&
    window.location?.protocol === 'https:' &&
    baseUrl.toLowerCase().startsWith('http:')
  ) {
    baseUrl = '';
  }
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
