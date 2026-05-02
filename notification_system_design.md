# Notification System — Production Documentation

> **Project:** Notification Platform  
> **Version:** 1.0.0  
> **Status:** Production  

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Component Breakdown](#5-component-breakdown)
6. [Data Flow](#6-data-flow)
7. [Priority Engine](#7-priority-engine)
8. [API Reference](#8-api-reference)
9. [Logging Middleware](#9-logging-middleware)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Problem Statement

Modern applications generate a high volume of notifications across multiple categories — placement updates, results, and events. The core challenges were:

- **Signal vs. noise:** Users receive too many notifications and cannot easily identify what matters most.
- **No intelligent ranking:** Notifications were delivered in raw, unordered form with no sense of urgency or priority.
- **Lack of observability:** There was no unified logging pipeline to trace errors or monitor behavior across the frontend and backend layers.
- **Tight coupling:** Frontend and backend had no clean separation, making maintenance and scaling difficult.
- **No structured data contract:** The external API returned inconsistent response shapes (plain array, `{ notifications: [] }`, or `{ data: [] }`), causing fragile parsing logic.

---

## 2. Solution Overview

We built a **full-stack notification platform** that:

1. **Fetches** notifications from an external evaluation-service API and normalizes the response regardless of its shape.
2. **Ranks** notifications intelligently using a **heap-based priority engine** — surfacing the most important ones first.
3. **Presents** two distinct views: a **Top Priority** view (top-N via min-heap) and an **All Notifications** view (full sorted list).
4. **Logs** every meaningful event (HTTP requests, API calls, component activity) through a **shared fire-and-forget logging middleware** used by both the frontend and backend.
5. **Decouples** concerns cleanly with a monorepo layout — shared libraries, isolated frontend, isolated backend.

---

## 3. Tech Stack

| Layer              | Technology                              | Purpose                                     |
|--------------------|-----------------------------------------|---------------------------------------------|
| **Frontend**       | React 19, Vite 8, React Router 7        | UI rendering, routing, fast HMR dev server  |
| **Backend**        | Node.js, Express 5                      | REST API server, proxy to external services |
| **Styling**        | CSS Modules (Glassmorphism theme)       | Scoped styles, modern translucent UI        |
| **HTTP Client**    | Axios                                   | API calls from frontend to backend          |
| **Logging**        | Custom middleware (shared package)      | Unified FE + BE observability               |
| **Data Structure** | Min-Heap (custom implementation)        | Efficient top-N notification selection      |

---

## 4. System Architecture

### Monorepo Layout

```
NOTIFICATION/
├── logging_middleware/         # Shared logging library (used by FE + BE)
├── notification_app_fe/        # React + Vite frontend
├── notification_app_be/        # Node.js + Express backend
└── notification_system_design.md
```

The monorepo enforces **clear separation of concerns** while allowing the `logging_middleware` package to be consumed by both the frontend and backend without duplication.

### High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (User)                  │
│                                                   │
│   ┌─────────────────────────────────────────┐    │
│   │          React Frontend (Vite)          │    │
│   │                                         │    │
│   │  GlassLayout → AppLayout → Tabs/Pages   │    │
│   │         ↓                               │    │
│   │   Priority Engine (Min-Heap / Sort)     │    │
│   │         ↓                               │    │
│   │     NotificationCard × N               │    │
│   └────────────────┬────────────────────────┘    │
└────────────────────│─────────────────────────────┘
                     │ Axios HTTP
                     ▼
┌──────────────────────────────────────────────────┐
│             Node.js / Express Backend             │
│                                                   │
│   GET /health                                     │
│   GET /api/notifications                          │
│   GET /api/notifications/:id                      │
└────────────────────┬─────────────────────────────┘
                     │ GET /evaluation-service/notifications
                     ▼
┌──────────────────────────────────────────────────┐
│           External Evaluation Service API         │
│       http://20.207.122.201/evaluation-service    │
└──────────────────────────────────────────────────┘
```

---

## 5. Component Breakdown

### Frontend Component Hierarchy

```
<BrowserRouter>
  <App>
    <GlassLayout>
      <Routes>
        <Route path="/" element={<AppLayout>}>
          <Route path="priority" element={<PriorityPage>} />
          <Route path="all"      element={<AllNotificationsPage>} />
        </Route>
      </Routes>
    </GlassLayout>
  </App>
</BrowserRouter>
```

| Component                  | Responsibility                                                  |
|----------------------------|-----------------------------------------------------------------|
| `GlassLayout`              | Full-viewport gradient shell with glassmorphism theme           |
| `AppLayout`                | Fetches data once on mount; passes it via React Router `Outlet` context |
| `NotificationTabs`         | Routed tab navigation between Priority and All views            |
| `Notifications`            | Applies the priority engine; renders the ranked card list       |
| `NotificationCard`         | Individual card: rank badge, tier indicator, formatted timestamp|
| `NotificationsEmptyState`  | "All caught up" placeholder when no notifications exist         |

### Backend API Structure

The backend serves as a clean proxy + REST layer, designed for future extension:

```
GET  /health                     → Health check
GET  /api/notifications          → All notifications (normalized)
GET  /api/notifications/:id      → Single notification by ID
POST /api/notifications          → (Future) Create notification
PATCH /api/notifications/:id     → (Future) Mark as read / update
DELETE /api/notifications/:id    → (Future) Delete notification
```

---

## 6. Data Flow

```
1. FETCH
   AppLayout calls fetchNotifications()
   → Axios GET to backend /api/notifications
   → Backend calls external evaluation-service with JWT auth

2. NORMALIZE
   Response shape varies: object[] | { notifications: [] } | { data: [] }
   → Normalized to a flat array before processing

3. PRIORITIZE
   Flat array passed to the Priority Engine
   → Top Priority view: Min-Heap selects top-N (default 10)
   → All view: Full O(n log n) sort, best-first

4. RENDER
   Ranked items → NotificationCard × N
   Each card displays: rank badge, type tier, title, description, timestamp
```

---

## 7. Priority Engine

The priority engine is the core algorithmic contribution of this system. It avoids naïve sorting for the common case of "show me the top 10."

### Notification Type Ranking

| Type          | Rank | Tier   |
|---------------|------|--------|
| `placement`   | 3    | High   |
| `result`      | 2    | Medium |
| `event`       | 1    | Low    |
| *(unknown)*   | 0    | Low    |

### Goodness Score

Each notification is assigned a **composite goodness tuple**: `(typeRank, timestampMs)`

Comparison is **lexicographic**:
- Higher `typeRank` always wins.
- If `typeRank` is equal, the **newer timestamp** wins.

### Top-N via Min-Heap — `O(n log k)`

For the **Top Priority** view, instead of sorting all `n` items, we maintain a min-heap of capacity `k = N` (default 10):

```
selectTopN(items, N):
  1. Create min-heap keyed by goodness (root = worst of the best-N)
  2. For each item:
     a. If heap.size < N  → push item
     b. Else if item beats heap.peek() → pop + push item
  3. Return heap contents sorted best-first
```

**Why this matters:** For large notification payloads, this runs in `O(n log k)` rather than `O(n log n)` — significantly faster when `k << n`.

### All Notifications — `O(n log n)`

The **All Notifications** view uses a standard sort with the same comparator, producing a fully-ranked best-first list.

---

## 8. API Reference

### External API (Evaluation Service)

```
GET http://20.207.122.201/evaluation-service/notifications

Headers:
  Authorization: Bearer <JWT>
  Accept: application/json

Response (one of):
  object[]
  { notifications: object[] }
  { data: object[] }
```

### Internal Backend API

```
GET /health
  Response: { status: "ok", timestamp: "ISO8601" }

GET /api/notifications
  Response: { notifications: [ { id, type, title, description, timestamp } ] }

GET /api/notifications/:id
  Response: { notification: { id, type, title, description, timestamp } }
```

### Notification Object Schema

```json
{
  "id": "string",
  "type": "placement | result | event",
  "title": "string",
  "description": "string",
  "timestamp": "ISO 8601 datetime string"
}
```

---

## 9. Logging Middleware

The `logging_middleware` package is a **shared, stack-agnostic logging factory** consumed by both the frontend and backend.

### Factory Pattern

```js
createLogger(baseUrl, token) → Log(stack, level, pkg, message)
```

- **Fire-and-forget:** All log calls are non-blocking (`.catch(() => {})`) — they never interrupt the main application flow.
- **Stack-agnostic:** The same package runs in both the browser (`stack: 'frontend'`) and Node.js (`stack: 'backend'`).
- **Express integration:** `requestLogger(Log)` middleware auto-logs every incoming HTTP request on the backend.

### Log Payload Schema

```json
{
  "stack": "frontend | backend",
  "level": "debug | info | warn | error | fatal",
  "package": "api | component | page | state | http",
  "message": "Human-readable log message",
  "clientTimestamp": "2026-05-02T12:00:00.000Z"
}
```

Logs are delivered via HTTP POST to a remote logging endpoint, centralizing observability across both application layers.

---

## 10. Future Roadmap

| Feature                             | Priority | Notes                                      |
|-------------------------------------|----------|--------------------------------------------|
| Database persistence                | High     | PostgreSQL or MongoDB for durable storage  |
| WebSocket / SSE real-time push      | High     | Eliminate polling; live notification feed  |
| User authentication                 | High     | Per-user notification streams              |
| Read / unread state management      | Medium   | Track and persist read state per user      |
| Notification preferences & filters | Medium   | User-controlled type/tier filtering        |
| Rate limiting & pagination          | Medium   | Protect API under load                     |
| Email / SMS channels                | Low      | Extend delivery beyond the web UI          |

---

*Documentation generated from the internal design specification. Keep in sync with code changes.*
