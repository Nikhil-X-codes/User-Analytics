import { getDb } from "./mongodb";

export async function getSessions(options = {}) {
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 100, 1), 500);
  const offset = Math.max(parseInt(options.offset, 10) || 0, 0);

  const db = await getDb();

  const pipeline = [
    {
      $group: {
        _id: "$sessionId",
        totalEvents: { $sum: 1 },
        firstEventAt: { $min: "$timestamp" },
        lastEventAt: { $max: "$timestamp" },
      },
    },
    { $sort: { lastEventAt: -1 } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        sessionId: "$_id",
        totalEvents: 1,
        firstEventAt: 1,
        lastEventAt: 1,
      },
    },
  ];

  const sessions = await db.collection("events").aggregate(pipeline).toArray();

  return sessions.map((s) => ({
    ...s,
    firstEventAt: s.firstEventAt instanceof Date ? s.firstEventAt.toISOString() : (s.firstEventAt ?? null),
    lastEventAt: s.lastEventAt instanceof Date ? s.lastEventAt.toISOString() : (s.lastEventAt ?? null),
  }));
}

export async function getSessionEvents(sessionId, options = {}) {
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 500, 1), 2000);
  const offset = Math.max(parseInt(options.offset, 10) || 0, 0);

  const db = await getDb();

  const events = await db
    .collection("events")
    .find({ sessionId })
    .sort({ timestamp: 1, _id: 1 })
    .skip(offset)
    .limit(limit)
    .project({ _id: 0, sessionId: 0 })
    .toArray();

  return events.map((e) => ({
    ...e,
    timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : (e.timestamp ?? null),
  }));
}

export async function getClicksForPage(pageUrl, options = {}) {
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 2000, 1), 5000);

  const db = await getDb();

  const clicks = await db
    .collection("events")
    .find({ pageUrl, eventType: "click" })
    .sort({ timestamp: 1 })
    .limit(limit)
    .project({ _id: 0, x: 1, y: 1, timestamp: 1 })
    .toArray();

  return clicks.map((c) => ({
    ...c,
    timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : (c.timestamp ?? null),
  }));
}

export async function getTrackedPages() {
  const db = await getDb();
  const pages = await db.collection("events").distinct("pageUrl");
  return pages.filter(Boolean).sort();
}
