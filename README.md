<p align="center">
  <img src="./public/logo.png" width="80" height="80" alt="CausalFunnel Logo" />
</p>

# CausalFunnel — User Analytics Application

A lightweight, production-grade web analytics platform built with **Next.js 16 (App Router)** and **MongoDB Atlas**. Tracks real user interactions (`page_view` and `click` events) and visualizes them through an interactive sessions dashboard, chronological user journey timelines, and click heatmaps.

- 🚀 **Live Production Deployment**: [https://analytics-two-rose.vercel.app](https://analytics-two-rose.vercel.app)
- 📊 **Live Dashboard**: [https://analytics-two-rose.vercel.app/dashboard](https://analytics-two-rose.vercel.app/dashboard)
- 🎯 **Click Heatmap**: [https://analytics-two-rose.vercel.app/dashboard/heatmap](https://analytics-two-rose.vercel.app/dashboard/heatmap)
- 🛍️ **Interactive Demo Page**: [https://analytics-two-rose.vercel.app/demo](https://analytics-two-rose.vercel.app/demo)

---

## 🚀 Core Features

1. **Client-Side Tracking Script (`/tracker.js`)**:
   - Zero-dependency, lightweight (~4 KB) script embeddable on any website.
   - Persistent visitor grouping using `localStorage` (`cf_session_id`).
   - Captures `page_view` and `click` events with document-relative coordinates (`pageX`, `pageY`).
   - Anti-duplicate debounce guard prevents duplicate events during single-page navigations.
   - Respects user privacy signals: honors `Do-Not-Track` (`navigator.doNotTrack === "1"`), `globalPrivacyControl`, and local opt-outs (`cf_opt_out`).
   - Cross-origin simple requests: uses `navigator.sendBeacon` and `fetch(text/plain)` to avoid blocking CORS preflight roundtrips.
   - Dynamic origin resolution: extracts API origin from `data-api` or the script tag's `src` automatically.

2. **Sessions Dashboard (`/dashboard`)**:
   - Metric cards for total sessions, total events, and last recorded activity.
   - Sessions table detailing session IDs, event counts, page views, clicks, and relative timestamps.
   - Direct links to inspect individual user journeys.

3. **User Journey View (`/dashboard/sessions/[sessionId]`)**:
   - Chronological event timeline displaying every action taken during a session.
   - Shows event type, visited URL, timestamps, and exact click coordinates.

4. **Click Heatmap (`/dashboard/heatmap`)**:
   - Dynamic page URL dropdown populated from MongoDB.
   - Visualizes actual click points positioned over the page layout.
   - Interactive hover tooltips showing `(X, Y)` coordinates and event timestamps.
   - Graceful empty states when a page has no recorded clicks.

---

## 🌐 How to Embed the Tracker on External Websites

To track interactions on any third-party or client website, add the following script before `</body>` or in `<head>`:

```html
<script 
  src="https://analytics-two-rose.vercel.app/tracker.js" 
  data-api="https://analytics-two-rose.vercel.app" 
  defer>
</script>
```

### Dynamic Origin Resolution
If `data-api` is omitted, the script inspects its own `<script>` tag `src` attribute (e.g., `https://analytics-two-rose.vercel.app/tracker.js`) and routes events to the originating domain automatically.

---

## 🛠️ Architecture & Design Decisions

### Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Database**: MongoDB Atlas via Native Node.js Driver (`mongodb` v7.7.0)
- **Styling**: Tailwind CSS
- **Connection Strategy**: Cached global connection pool (`global._mongoClientPromise`) across hot-reloads and serverless API invocations to prevent connection exhaustion.

### Cross-Origin Request Strategy (Zero Preflight)
Cross-origin browser requests with `Content-Type: application/json` trigger a blocking HTTP `OPTIONS` preflight request. To optimize performance and ensure 100% cross-origin delivery reliability:
1. `tracker.js` sends payloads as `text/plain` via `navigator.sendBeacon` and `fetch` with `credentials: "omit"`.
2. Under the W3C CORS specification, `text/plain` qualifies as a **simple request**, allowing the browser to skip the preflight check entirely.
3. The server route (`/api/events`) reads the raw text body and parses the JSON payload directly.
4. CORS headers (`Access-Control-Allow-Origin: *`, `POST, OPTIONS`) are scoped strictly to the `/api/events` endpoint in `next.config.mjs` and `lib/cors.js`, preserving same-origin privacy on data-reading endpoints (`/api/sessions`, `/api/heatmap`).

### URL Normalization
To avoid fragmented heatmap listings (such as `page?utm_source=ad` and `page?utm_source=email` appearing as separate pages), the server automatically strips URL query parameters and hash fragments on ingestion, grouping interaction metrics by base path (`origin + pathname`).

### Database Schema & Compound Indexes
Events are stored in the `events` collection:
```json
{
  "_id": "ObjectId(...)",
  "sessionId": "4b9cd160-07c5-4cc5-89b1-0a346351ccb6",
  "eventType": "click",
  "pageUrl": "https://example.com/products",
  "timestamp": "2026-10-12T13:38:42.326Z",
  "x": 420,
  "y": 350,
  "serverReceivedAt": "2026-10-12T13:38:42.376Z"
}
```

The collection leverages compound indexes for optimal query performance:
- `{ sessionId: 1, timestamp: 1 }` — Enables fast, ordered retrieval for session journeys.
- `{ pageUrl: 1, eventType: 1 }` — Accelerates heatmap coordinate queries.
- `{ timestamp: -1 }` — Powers recent session sorting and activity summaries.

---

## 🛡️ Security, Reliability & Privacy

- **Zero PII**: No passwords, form inputs, emails, or personal identifiers are captured or persisted.
- **Payload Guard**: API limits incoming request bodies to 32 KB (`HTTP 413 Payload Too Large`).
- **Timestamp Drift Protection**: Rejects client timestamps drifting > 24 hours into the future or > 30 days into the past; records authoritative `serverReceivedAt` on ingestion.
- **Privacy Signals**: Respects `navigator.doNotTrack === "1"`, `navigator.globalPrivacyControl`, and `cf_opt_out` localStorage flag.
- **Configurable Origins**: Set `CORS_ALLOWED_ORIGIN` in environment variables to restrict event ingestion to specific domains (e.g. `https://shop1.com,https://shop2.com`). Defaults to `*` for open public tracking.

---

## ⚖️ Known Trade-offs & Limitations

1. **In-Memory Rate Limiting**:
   - The current rate limiter uses an in-memory sliding window `Map` per serverless instance.
   - *Enterprise Alternative*: In high-scale multi-region production, back the rate limiter with Redis (e.g., Upstash Redis) to share limits across cold-started serverless instances.
2. **Dashboard Authentication**:
   - The dashboard routes (`/dashboard`, `/dashboard/heatmap`, `/dashboard/sessions`) are publicly accessible to allow frictionless evaluation for this take-home project.
   - *Enterprise Alternative*: Gate dashboard views behind NextAuth / Supabase / Clerk authentication.
3. **Screen Resolution & Responsive Breakpoints**:
   - Heatmap positions use document-relative coordinates (`pageX`, `pageY`). On responsive layouts where DOM elements reflow across mobile and desktop, clicks are plotted on their absolute document coordinates.
   - *Enterprise Alternative*: Segment heatmaps by screen breakpoint (Desktop/Tablet/Mobile) or capture DOM selector paths (`target`).

---

## 💻 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance (MongoDB Atlas cluster or local MongoDB)

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=user
MONGODB_DB=analytics_app
CORS_ALLOWED_ORIGIN=*
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** (redirects to `/dashboard`).

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/events` | `POST` | Validates and stores incoming `page_view` and `click` events (open CORS). |
| `/api/sessions` | `GET` | Returns aggregated sessions with event counts and timestamps (same-origin). |
| `/api/sessions/:sessionId/events` | `GET` | Returns chronological events for a specific session ID (same-origin). |
| `/api/heatmap?url=...` | `GET` | Returns all click coordinates for a given page URL (same-origin). |

---

## 🧪 Verification & Build

```bash
# Run production build
npm run build

# Run linter
npm run lint
```
