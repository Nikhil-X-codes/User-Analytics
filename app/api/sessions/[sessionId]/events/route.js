import { NextResponse } from "next/server";
import { getSessionEvents } from "@/lib/analytics";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rateLimit";

export async function OPTIONS(request) {
  return handleCorsPreflight(request);
}

export async function GET(request, { params }) {
  const corsHeaders = getCorsHeaders(request);
  const { sessionId } = await params;

  const rateLimit = checkRateLimit(request, {
    keyPrefix: "session-events",
    limit: 120,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: corsHeaders }
    );
  }

  if (
    !sessionId ||
    typeof sessionId !== "string" ||
    sessionId.trim() === "" ||
    sessionId.length > 128
  ) {
    return NextResponse.json(
      { error: "Invalid session ID." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const events = await getSessionEvents(sessionId, { limit, offset });
    return NextResponse.json(
      {
        sessionId,
        events,
        count: events.length,
        limit: limit ? parseInt(limit, 10) : 500,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error(
      `[GET /api/sessions/${sessionId}/events] Database error:`,
      err.message
    );
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
