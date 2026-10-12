const EVENT_STYLES = {
  page_view: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    label: "PAGE VIEW",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  click: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "CLICK",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
      </svg>
    ),
  },
};

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatFullDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function PathFromUrl(url) {
  try {
    return new URL(url).pathname || url;
  } catch {
    return url;
  }
}

export default function EventTimeline({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <ol id="event-timeline" className="relative">
      {events.map((event, i) => {
        const style = EVENT_STYLES[event.eventType] ?? EVENT_STYLES.page_view;
        const path = PathFromUrl(event.pageUrl);
        const isLast = i === events.length - 1;

        return (
          <li
            key={i}
            id={`event-${i}`}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!isLast && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10" />
            )}

            <div className="relative z-10 mt-1 shrink-0">
              <div className={`w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center ${style.dot}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              </div>
            </div>

            <div className="flex-1 min-w-0 bg-white/3 border border-white/8 rounded-xl px-4 py-3 hover:border-white/15 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide ${style.badge}`}>
                  {style.icon}
                  {style.label}
                </span>

                <time
                  dateTime={event.timestamp}
                  title={formatFullDate(event.timestamp)}
                  className="font-mono text-xs text-gray-500"
                >
                  {formatTime(event.timestamp)}
                </time>

                {event.eventType === "click" && event.x != null && event.y != null && (
                  <span className="font-mono text-xs text-gray-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded">
                    ({event.x}, {event.y})
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-300 truncate" title={event.pageUrl}>
                {path}
                {path !== event.pageUrl && (
                  <span className="text-gray-600 text-xs ml-1" title={event.pageUrl}>
                    ({event.pageUrl.replace(/^https?:\/\/[^/]+/, "…")})
                  </span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
