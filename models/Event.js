export const EVENT_TYPES = ["page_view", "click"];

const SESSION_ID_MAX_LENGTH = 128;
const PAGE_URL_MAX_LENGTH = 2048;
const COORDINATE_MAX_VALUE = 30000;
const MAX_PAST_DRIFT_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_DRIFT_MS = 24 * 60 * 60 * 1000;

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "file:";
  } catch {
    return false;
  }
}

function normalizeUrl(str) {
  try {
    const url = new URL(str);
    return `${url.origin}${url.pathname}`;
  } catch {
    return str.trim();
  }
}

export function validateAndNormalizeEvent(payload) {
  const errors = [];

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const { sessionId, eventType, pageUrl, timestamp, x, y } = payload;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    errors.push("sessionId must be a non-empty string.");
  } else if (sessionId.length > SESSION_ID_MAX_LENGTH) {
    errors.push(`sessionId must not exceed ${SESSION_ID_MAX_LENGTH} characters.`);
  }

  if (!EVENT_TYPES.includes(eventType)) {
    errors.push(`eventType must be one of: ${EVENT_TYPES.join(", ")}.`);
  }

  if (typeof pageUrl !== "string" || !isValidUrl(pageUrl)) {
    errors.push("pageUrl must be a valid URL.");
  } else if (pageUrl.length > PAGE_URL_MAX_LENGTH) {
    errors.push(`pageUrl must not exceed ${PAGE_URL_MAX_LENGTH} characters.`);
  }

  let parsedTimestamp;
  const now = Date.now();
  if (!timestamp) {
    errors.push("timestamp is required.");
  } else {
    parsedTimestamp = new Date(timestamp);
    const tsTime = parsedTimestamp.getTime();
    if (isNaN(tsTime)) {
      errors.push("timestamp must be a valid ISO 8601 date string.");
    } else if (tsTime > now + MAX_FUTURE_DRIFT_MS) {
      errors.push("timestamp cannot be more than 24 hours in the future.");
    } else if (tsTime < now - MAX_PAST_DRIFT_MS) {
      errors.push("timestamp cannot be older than 30 days.");
    }
  }

  let parsedX;
  let parsedY;
  if (eventType === "click") {
    if (typeof x !== "number" || !isFinite(x) || x < 0 || x > COORDINATE_MAX_VALUE) {
      errors.push(`x must be a number between 0 and ${COORDINATE_MAX_VALUE}.`);
    } else {
      parsedX = Math.round(x);
    }
    if (typeof y !== "number" || !isFinite(y) || y < 0 || y > COORDINATE_MAX_VALUE) {
      errors.push(`y must be a number between 0 and ${COORDINATE_MAX_VALUE}.`);
    } else {
      parsedY = Math.round(y);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const doc = {
    sessionId: sessionId.trim(),
    eventType,
    pageUrl: normalizeUrl(pageUrl),
    timestamp: parsedTimestamp,
    serverReceivedAt: new Date(now),
  };

  if (eventType === "click") {
    doc.x = parsedX;
    doc.y = parsedY;
  }

  return { ok: true, doc };
}
