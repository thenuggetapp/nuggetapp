const BLOCKED_PROTOCOLS = new Set([
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
]);

export interface WebsiteUrlValidationResult {
  valid: boolean;
  sanitized: string | null;
  error?: string;
}

export function validateWebsiteUrl(
  rawUrl: string
): WebsiteUrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: true, sanitized: null };
  }

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, sanitized: null, error: "Invalid URL format" };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (!["http:", "https:"].includes(protocol)) {
    return {
      valid: false,
      sanitized: null,
      error: "Only HTTP and HTTPS links are allowed",
    };
  }

  if (BLOCKED_PROTOCOLS.has(`${protocol}//`)) {
    return {
      valid: false,
      sanitized: null,
      error: "This URL type is not allowed",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      sanitized: null,
      error: "URLs with embedded credentials are not allowed",
    };
  }

  if (!parsed.hostname) {
    return { valid: false, sanitized: null, error: "Invalid URL hostname" };
  }

  return { valid: true, sanitized: parsed.href };
}
