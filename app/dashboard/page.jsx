import { Suspense } from "react";
import { connection } from "next/server";
import { getSessions } from "@/lib/analytics";
import SessionsTable from "@/components/SessionsTable";
import StatusMessage from "@/components/StatusMessage";
import LoadingState from "@/components/LoadingState";

export const metadata = {
  title: "Sessions",
};

export const instant = false;

async function SessionsContent() {
  await connection();
  let sessions;

  try {
    sessions = await getSessions();
  } catch (err) {
    console.error("[/dashboard] Failed to load sessions:", err.message);
    return (
      <StatusMessage
        type="error"
        title="Could not load sessions"
        message="There was a problem connecting to the database. Check server logs for details."
      />
    );
  }

  if (sessions.length === 0) {
    return (
      <StatusMessage
        type="empty"
        title="No sessions yet"
        message="Visit the demo page and interact with it to start generating tracked events. They will appear here automatically."
      />
    );
  }

  return <SessionsTable sessions={sessions} />;
}

export default async function DashboardPage() {
  await connection();

  let sessions = [];
  let statsError = false;

  try {
    sessions = await getSessions();
  } catch {
    statsError = true;
  }

  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce((sum, s) => sum + s.totalEvents, 0);
  const lastActive = sessions[0]?.lastEventAt ?? null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">
          All recorded browser sessions, sorted by most recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          id="stat-sessions"
          label="Total Sessions"
          value={statsError ? "—" : totalSessions}
          icon="👤"
          accent="violet"
        />
        <StatCard
          id="stat-events"
          label="Total Events"
          value={statsError ? "—" : totalEvents}
          icon="⚡"
          accent="blue"
        />
        <StatCard
          id="stat-last-active"
          label="Last Activity"
          value={lastActive ? formatRelative(lastActive) : (statsError ? "—" : "Never")}
          icon="🕐"
          accent="emerald"
        />
      </div>

      <Suspense fallback={<LoadingState rows={5} label="Loading sessions…" />}>
        <SessionsContent />
      </Suspense>
    </div>
  );
}

function StatCard({ id, label, value, icon, accent }) {
  const accentStyles = {
    violet: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
    emerald: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
  };

  return (
    <div
      id={id}
      className={`rounded-xl border bg-gradient-to-br p-5 ${accentStyles[accent] ?? accentStyles.violet}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function formatRelative(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.round(ms / 3600000)}h ago`;
  return `${Math.round(ms / 86400000)}d ago`;
}
