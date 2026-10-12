import { NextResponse } from "next/server";
import { getSessions } from "@/lib/analytics";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rateLimit";

export async function OPTIONS(request) {
  return handleCorsPreflight(request);
}

export async function GET(request) {
  const corsHeaders = getCorsHeaders(request);

  const rateLimit = checkRateLimit(request, {
    keyPrefix: "sessions",
    limit: 120,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const sessions = await getSessions({ limit, offset });

    return NextResponse.json(
      {
        sessions,
        count: sessions.length,
        limit: limit ? parseInt(limit, 10) : 100,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("[GET /api/sessions] Database error:", err.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
