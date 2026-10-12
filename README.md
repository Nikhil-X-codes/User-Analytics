<p align="center">
  <img src="./public/logo.png" width="80" height="80" alt="CausalFunnel Logo" />
</p>

# CausalFunnel — User Analytics Application

A lightweight, production-grade web analytics platform built with **Next.js 16 (App Router)** and **MongoDB**. Tracks real user interactions (`page_view` and `click` events) and visualizes them through an interactive sessions dashboard, chronological user journey timelines, and click heatmaps.

---

## 🚀 Core Features

1. **Client-Side Tracking Script (`/tracker.js`)**:
   - Zero-dependency, lightweight script embeddable on any website.
   - Persistent visitor grouping using `localStorage` (`cf_session_id`).
   - Captures `page_view` and `click` events with document-relative coordinates (`pageX`, `pageY`).
   - Anti-duplicate debounce guard prevents duplicate events during single-page navigations.
   - Respects user privacy signals: honors `Do-Not-Track` (`navigator.doNotTrack === "1"`) and local opt-outs (`cf_opt_out`).
   - Asynchronous and resilient delivery (`keepalive: true` + `navigator.sendBeacon` fallback).
   - Auto-detects script origin to route events to the correct backend across external domains.

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

5. **Demo Webpage (`/demo`)**:
   - Interactive landing page with clickable cards and navigation to generate tracked events in real time.

---

## 🛠️ Architecture & Design Decisions

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB Atlas via Native Node.js Driver (`mongodb` v7.7.0)
- **Styling**: Tailwind CSS
- **Connection Strategy**: Cached global connection pool (`global._mongoClientPromise`) across hot-reloads and serverless API invocations to prevent connection exhaustion.

### Database Schema & Compound Indexes
Events are stored in the `events` collection with the following document structure:
```json
{
  "_id": "ObjectId(...)",
  "sessionId": "session_1740000000_abc123",
  "eventType": "click",
  "pageUrl": "http://localhost:3000/demo",
  "timestamp": "2026-10-12T10:00:00.000Z",
  "clickCoordinates": { "x": 420, "y": 350 },
  "serverReceivedAt": "2026-10-12T10:00:00.050Z"
}
```

The collection leverages compound indexes for optimal query performance:
- `{ sessionId: 1, timestamp: 1 }` — Enables fast, ordered retrieval for session journeys.
- `{ pageUrl: 1, eventType: 1 }` — Accelerates heatmap coordinate queries.
- `{ timestamp: -1 }` — Powers recent session sorting and activity summaries.

---

## 📐 Heatmap Coordinate System & Trade-offs

### Coordinate Convention
The tracker uses **document-relative coordinates** (`pageX`, `pageY`) with a fallback to `clientX + window.scrollX` and `clientY + window.scrollY`.

### Why `pageX` / `pageY`?
- **Scroll Stability**: When a visitor scrolls down a page and clicks an element, `pageX`/`pageY` preserves the absolute location relative to the top-left of the document. Viewport coordinates (`clientX`/`clientY`) reset upon scrolling, causing clicks lower down the page to incorrectly stack at the top of the viewport.

### Trade-offs & Production Considerations
1. **Responsive Reflow & Screen Sizes**:
   - If a user clicks an element on mobile (390px width) and another on desktop (1440px width), elements reflow into different positions. Raw pixel coordinates assume a consistent document canvas.
   - *Production Solution*: Record viewport width/height alongside click coordinates, segment heatmaps by device breakpoint (Mobile, Tablet, Desktop), or attach CSS selectors / DOM XPath identifiers (`event.target`) to anchor clicks to DOM elements.
2. **Dynamic Content**:
   - Collapsible accordions, carousels, or dynamic modal popups shift content vertically.
   - *Production Solution*: Capture DOM snapshots / session replay trees (similar to rrweb) at the moment of interaction.

---

## 🛡️ Security, Reliability & Privacy

- **Zero PII**: No passwords, form inputs, emails, or personal identifiers are captured or persisted.
- **Payload Guard**: API limits incoming request bodies to 32 KB (`HTTP 413 Payload Too Large`).
- **Rate Limiting**: Sliding-window rate limiter prevents flooding (`HTTP 429 Too Many Requests`).
- **Timestamp Drift Protection**: Rejects client timestamps drifting > 24 hours into the future or > 30 days into the past; records authoritative `serverReceivedAt` on ingestion.
- **CORS Support**: Full `OPTIONS` preflight handling and configurable allowed origins via `CORS_ALLOWED_ORIGIN`.
- **Sanitized Errors**: Database credentials and stack traces remain server-side only.

---

## 💻 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance (MongoDB Atlas cluster or local MongoDB on `mongodb://localhost:27017`)

### 2. Environment Variables
Ensure `.env.local` exists in the root of `analytics-app/`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=user
MONGODB_DB=analytics_app
```

### 3. Installation & Run
```bash
cd analytics-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** (redirects directly to `/dashboard`).

---

## 🌐 External Website Tracking

To track interactions on any external website, include the tracking script before `</body>` or in `<head>`:

```html
<script src="https://your-domain.com/tracker.js" defer></script>
```

The script will automatically detect the host domain, stream events cross-origin to `/api/events`, and populate your dashboard with the external page's metrics and heatmaps.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/events` | `POST` | Validates and stores incoming `page_view` and `click` events. |
| `/api/sessions` | `GET` | Returns aggregated sessions with event counts and timestamps. |
| `/api/sessions/:sessionId/events` | `GET` | Returns all chronological events for a specific session ID. |
| `/api/heatmap?url=...` | `GET` | Returns all click coordinates for a given page URL. |

---

## 🧪 Verification & Build

```bash
# Run production build
npm run build

# Run linter
npm run lint
```
