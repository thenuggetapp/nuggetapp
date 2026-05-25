const ALLOWED_PROTOCOLS = ["http:", "https:"] as const;

const ALLOWED_SCHEME_NAMES = new Set(
  ALLOWED_PROTOCOLS.map((protocol) => protocol.replace(":", ""))
);

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

function parseAndValidateUrl(
  normalized: string
): WebsiteUrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, sanitized: null, error: "Invalid URL format" };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (
    !ALLOWED_PROTOCOLS.includes(
      protocol as (typeof ALLOWED_PROTOCOLS)[number]
    )
  ) {
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

export function validateWebsiteUrl(
  rawUrl: string
): WebsiteUrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: true, sanitized: null };
  }

  const firstColonIndex = trimmed.indexOf(":");
  if (firstColonIndex === -1) {
    return parseAndValidateUrl(`https://${trimmed}`);
  }

  const beforeColon = trimmed.slice(0, firstColonIndex);
  const afterColon = trimmed.slice(firstColonIndex + 1);
  const schemeName = beforeColon.toLowerCase();

  if (ALLOWED_SCHEME_NAMES.has(schemeName)) {
    const normalized = afterColon.startsWith("//")
      ? trimmed
      : `${schemeName}://${afterColon}`;
    return parseAndValidateUrl(normalized);
  }

  if (afterColon.startsWith("//")) {
    return {
      valid: false,
      sanitized: null,
      error: "Only HTTP and HTTPS links are allowed",
    };
  }

  if (!/^\d+$/.test(afterColon)) {
    return { valid: false, sanitized: null, error: "Invalid URL format" };
  }

  const port = Number(afterColon);
  if (port < 1 || port > 65535) {
    return { valid: false, sanitized: null, error: "Invalid port number" };
  }

  return parseAndValidateUrl(`https://${beforeColon}:${afterColon}`);
}
