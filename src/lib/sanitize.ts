/**
 * Utility functions for input sanitization and XSS prevention.
 */

// Regex to detect script tags, dangerous HTML elements, and event handler attributes
const HTML_TAG_REGEX = /<[^>]*>/g;
const JAVASCRIPT_PROTOCOL_REGEX = /javascript\s*:/gi;
const DATA_PROTOCOL_SCRIPT_REGEX = /data\s*:\s*text\/html/gi;
const ON_EVENT_ATTRIBUTES = /\bon\w+\s*=/gi;

/**
 * Strips HTML tags and harmful JavaScript execution vectors.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  
  return text
    .replace(HTML_TAG_REGEX, "")
    .replace(JAVASCRIPT_PROTOCOL_REGEX, "")
    .replace(DATA_PROTOCOL_SCRIPT_REGEX, "")
    .replace(ON_EVENT_ATTRIBUTES, "")
    .trim();
}

/**
 * Encodes special characters to prevent HTML injection in rendered output.
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") return "";

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Recursively sanitizes all string fields in an object or array.
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    return sanitizeText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (input !== null && typeof input === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj as T;
  }

  return input;
}

/**
 * Sanitizes file names to prevent path traversal and null byte injection.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\0/g, "")
    .replace(/(\.\.[\/\\])+/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}
