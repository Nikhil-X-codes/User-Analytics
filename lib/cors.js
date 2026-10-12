import { NextResponse } from "next/server";

export function getCorsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  const configuredOrigin = process.env.CORS_ALLOWED_ORIGIN;

  let allowOrigin = "*";
  if (configuredOrigin) {
    if (configuredOrigin === "*" || configuredOrigin === origin) {
      allowOrigin = origin;
    } else {
      allowOrigin = configuredOrigin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleCorsPreflight(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
