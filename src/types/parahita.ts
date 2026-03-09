/**
 * Parahita API types (FE_INTEGRATION_GUIDE §2, §10).
 *
 * API contract (must match backend):
 * - POST /api/parahita/message  body: MessageRequest  → ParahitaResponse { text, keyboard?, data? }
 * - POST /api/parahita/action   body: ActionRequest   → ParahitaResponse { text, keyboard?, data? }
 * - POST /api/parahita/xray     multipart file        → XrayUploadResponse { message, data }
 *
 * If message/action "don't work", check: (1) backend has both endpoints, (2) REACT_APP_API_BASE_URL
 * or proxy points at the API server, (3) CORS allows the PWA origin.
 */

export interface MessageRequest {
  text: string;
  chatId: number;
  userId?: number;
}

export interface ActionRequest {
  action: string;
  chatId: number;
  userId?: number;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineButton[][];
}

export interface Promo {
  nama_pemeriksaan: string; // Package examination name
  nama_alias: string; // Promo alias/name
  banner: string; // URL or base64 image
  tgl_mulai_promo: string; // Promo start date (ISO date string)
  tgl_selesai_promo: string; // Promo end date (ISO date string)
}

export interface ParahitaResponse {
  text: string;
  keyboard?: InlineKeyboard;
  data?: {
    promos?: Promo[];
    [key: string]: any;
  };
}

export type ActionType =
  | "VIEW_RESULTS"
  | "INTERPRET_RESULTS"
  | "TO_DOCTOR"
  | "TO_FRONT_OFFICE"
  | "SCHEDULE_APPOINTMENT"
  | "VIEW_HISTORY"
  | "VERIFY_PHONE"
  | "NEW_QUERY"
  | "BACK";

export interface XrayConclusionResponse {
  kesimpulan: string;
  hasil: string;
  confidence_level: string;
}

export interface XrayPredictionResponse {
  prediction: string; // "NORMAL" or "ABNORMAL"
  confidence: number;
  model_type: string;
  model_inspection: string;
  conclusion: XrayConclusionResponse;
  heatmap_base64: string; // Base64 encoded image with Grad-CAM overlay
}

export interface XrayAnalysisResult {
  inspection: 'THORAX_PA' | 'PANORAMIC';
  prediction: XrayPredictionResponse;
  aiInterpretation: string; // AI-generated interpretation in Indonesian
}

export interface XrayUploadResponse {
  message: string;
  data: XrayAnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  keyboard?: InlineKeyboard;
  data?: {
    promos?: Promo[];
    xrayAnalysis?: XrayAnalysisResult;
    [key: string]: any;
  };
  timestamp: string;
}

/**
 * Session state machine states as per FE_INTEGRATION_GUIDE §3
 */
export type SessionState =
  | "IDLE"
  | "NOLAB_VERIFIED"
  | "VIEWING_RESULTS"
  | "AWAITING_PHONE"
  | "PHONE_VERIFIED"
  | "ACTIVE_CHAT";

/**
 * Session activity tracking for expiry detection
 */
export interface SessionActivity {
  lastActivity: number;
  chatId: number;
}

/**
 * Utility type for retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Type guard to check if an action is an AI-intensive call that may need retry
 */
export function isAIAction(action: string): boolean {
  return action === "INTERPRET_RESULTS" || action.startsWith("INTERPRET_RESULTS");
}

/**
 * Type guard to check if response indicates an error
 */
export function isLikelyError(response: ParahitaResponse): boolean {
  const patterns = ["tidak ditemukan", "terjadi kesalahan", "coba lagi", "tidak tersedia"];
  const lower = response.text.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}
