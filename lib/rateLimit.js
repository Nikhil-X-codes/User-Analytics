const rateLimitStore = new Map();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(request, options = {}) {
  const {
    keyPrefix = "global",
    limit = 120,
    windowMs = 60 * 1000,
  } = options;

  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;

  if (record.count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
