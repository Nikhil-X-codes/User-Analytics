import Link from "next/link";
import { connection } from "next/server";
import { getSessionEvents } from "@/lib/analytics";
import EventTimeline from "@/components/EventTimeline";
import StatusMessage from "@/components/StatusMessage";

export async function generateMetadata({ params }) {
  const { sessionId } = await params;
  const short = decodeURIComponent(sessionId).slice(0, 12);
  return {
    title: `Journey · ${short}…`,
  };
}

export const instant = false;

export default async function SessionJourneyPage({ params }) {
  await connection();
  const { sessionId } = await params;
  const decodedId = decodeURIComponent(sessionId);

  let events;
  let fetchError = false;

  try {
    events = await getSessionEvents(decodedId);
  } catch (err) {
    console.error(`[/dashboard/sessions/${decodedId}] Failed to load events:`, err.message);
    fetchError = true;
  }

  const totalClicks = events?.filter((e) => e.eventType === "click").length ?? 0;
  const totalPageViews = events?.filter((e) => e.eventType === "page_view").length ?? 0;
  const uniquePages = events
    ? [...new Set(events.map((e) => e.pageUrl))].length
    : 0;

  return (
    <div className="p-8 max-w-3xl">
      <Link
        id="back-to-sessions"
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Sessions
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Journey</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Session</span>
          <span
            className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-1 rounded select-all"
            title={decodedId}
          >
            {decodedId}
          </span>
        </div>
      </div>

      {!fetchError && events && events.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <MiniStat id="journey-stat-events" label="Events" value={events.length} />
          <MiniStat id="journey-stat-pageviews" label="Page Views" value={totalPageViews} />
          <MiniStat id="journey-stat-clicks" label="Clicks" value={totalClicks} />
        </div>
      )}

      {fetchError ? (
        <StatusMessage
          type="error"
          title="Could not load events"
          message="There was a problem fetching this session's events. Please check the server logs."
        />
      ) : !events || events.length === 0 ? (
        <StatusMessage
          type="empty"
          title="No events for this session"
          message="This session ID exists but has no recorded events. It may have been cleared from the database."
        />
      ) : (
        <EventTimeline events={events} />
      )}
    </div>
  );
}

function MiniStat({ id, label, value }) {
  return (
    <div
      id={id}
      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
    >
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
