"use client";

import Link from "next/link";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function durationLabel(firstIso, lastIso) {
  if (!firstIso || !lastIso) return "—";
  const ms = new Date(lastIso) - new Date(firstIso);
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

function ShortId({ id }) {
  const short = id.length > 12 ? id.slice(0, 12) + "…" : id;
  return (
    <span
      title={id}
      className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-1 rounded cursor-default select-all"
    >
      {short}
    </span>
  );
}

export default function SessionsTable({ sessions }) {
  if (!sessions || sessions.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm" id="sessions-table">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Session ID
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
              Events
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              First Seen
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Last Active
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Duration
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
              Journey
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, i) => (
            <tr
              key={session.sessionId}
              id={`session-row-${i}`}
              className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors group"
            >
              <td className="px-5 py-4">
                <ShortId id={session.sessionId} />
              </td>
              <td className="px-5 py-4 text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {session.totalEvents}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">
                {formatDate(session.firstEventAt)}
              </td>
              <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">
                {formatDate(session.lastEventAt)}
              </td>
              <td className="px-5 py-4 text-gray-500 text-xs hidden md:table-cell">
                {durationLabel(session.firstEventAt, session.lastEventAt)}
              </td>
              <td className="px-5 py-4 text-right">
                <Link
                  id={`view-journey-${i}`}
                  href={`/dashboard/sessions/${encodeURIComponent(session.sessionId)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-gray-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-600/10 transition-all"
                >
                  View
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
