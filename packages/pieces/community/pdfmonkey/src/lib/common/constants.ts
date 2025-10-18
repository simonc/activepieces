/**
 * PDFMonkey API base URL
 */
export const BASE_URL = 'https://api.pdfmonkey.io/api/v1';

/**
 * Webhook event types
 */
export const WEBHOOK_EVENTS = {
  GENERATION_SUCCESS: 'documents.generation.success',
  GENERATION_FAILED: 'documents.generation.failure',
} as const;

/**
 * Document status values
 */
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  FAILURE: 'failure',
  GENERATING: 'generating',
  PENDING: 'pending',
  SUCCESS: 'success',
} as const;

/**
 * Platform identifier for webhook registration
 */
export const PLATFORM_NAME = 'ActivePieces';

/**
 * Polling interval for document generation status check (in ms)
 */
export const POLL_INTERVAL_MS = 1000;

/**
 * Timeout for document generation (in ms)
 */
export const TIMEOUT_MS = 600000; // 10 minutes
