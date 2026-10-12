import { NextResponse } from "next/server";

function parseAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGIN || "*";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function getCorsHeaders(request) {
  const origin = (request?.headers?.get("origin") || "").replace(/\/+$/, "");
  const allowed = parseAllowedOrigins();

  let allowOrigin = "*";
  if (allowed.includes("*")) {
    allowOrigin = "*";
  } else if (origin && allowed.includes(origin)) {
    allowOrigin = origin;
  } else if (allowed.length > 0) {
    allowOrigin = allowed[0];
  }

  const headers = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  if (allowOrigin !== "*") {
    headers["Vary"] = "Origin";
  }

  return headers;
}

export function handleCorsPreflight(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
