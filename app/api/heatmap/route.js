import { NextResponse } from "next/server";
import { getClicksForPage, getTrackedPages } from "@/lib/analytics";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rateLimit";

export async function OPTIONS(request) {
  return handleCorsPreflight(request);
}

export async function GET(request) {
  const corsHeaders = getCorsHeaders(request);

  const rateLimit = checkRateLimit(request, {
    keyPrefix: "heatmap",
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

    if (searchParams.get("pages") === "true") {
      const pages = await getTrackedPages();
      return NextResponse.json({ pages }, { headers: corsHeaders });
    }

    const pageUrl = searchParams.get("url");

    if (!pageUrl || !pageUrl.trim()) {
      return NextResponse.json(
        { error: "Missing required query parameter: 'url'" },
        { status: 400, headers: corsHeaders }
      );
    }

    const limit = searchParams.get("limit");
    const clicks = await getClicksForPage(pageUrl.trim(), { limit });

    return NextResponse.json(
      {
        pageUrl: pageUrl.trim(),
        clicks,
        totalClicks: clicks.length,
        limit: limit ? parseInt(limit, 10) : 2000,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("[GET /api/heatmap] Database error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve heatmap click data" },
      { status: 500, headers: corsHeaders }
    );
  }
}
