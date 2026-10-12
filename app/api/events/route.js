import { NextResponse } from "next/server";
import { validateAndNormalizeEvent } from "@/models/Event";
import { getEventsCollection } from "@/lib/mongodb";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_PAYLOAD_BYTES = 32 * 1024;

export async function OPTIONS(request) {
  return handleCorsPreflight(request);
}

export async function POST(request) {
  const corsHeaders = getCorsHeaders(request);

  const rateLimit = checkRateLimit(request, {
    keyPrefix: "events",
    limit: 300,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { success: false, error: "Payload exceeds 32 KB limit." },
      { status: 413, headers: corsHeaders }
    );
  }

  let payload;
  try {
    const raw = await request.text();
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400, headers: corsHeaders }
    );
  }

  const result = validateAndNormalizeEvent(payload);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: result.errors },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const collection = await getEventsCollection();
    const inserted = await collection.insertOne(result.doc);

    return NextResponse.json(
      { success: true, eventId: inserted.insertedId.toString() },
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("[POST /api/events] Database error:", err.message);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
