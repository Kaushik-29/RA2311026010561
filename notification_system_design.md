# Notification System — Design Document

## 1. Architecture Overview

The notification system follows a **monorepo** layout with clear separation of concerns:

```
shivayya/
├── logging_middleware/         # Shared logging library (FE + BE)
├── notification_app_fe/        # React + Vite frontend
├── notification_app_be/        # Node.js + Express backend
└── notification_system_design.md
```

### Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8, React Router 7   |
| Backend    | Node.js, Express 5                  |
| Styling    | CSS Modules (glassmorphism theme)   |
| HTTP       | Axios                               |
| Logging    | Custom middleware → remote POST     |

---

## 2. Notification Flow

```
┌──────────────┐       GET /notifications       ┌──────────────────┐
│              │ ──────────────────────────────► │                  │
│   React UI   │                                 │  External API /  │
│  (Frontend)  │ ◄────────────────────────────── │  Backend Server  │
│              │       JSON [ ...items ]         │                  │
└──────┬───────┘                                 └──────────────────┘
       │
       │  Raw notification array
       ▼
┌──────────────┐
│  Priority    │  ← Min-heap (top-N) or full sort (all view)
│  Engine      │
└──────┬───────┘
       │
       │  Ranked items with type, tier, content
       ▼
┌──────────────┐
│  UI Render   │  ← NotificationCard × N
│  (Cards)     │
└──────────────┘
```

### Data Flow Steps

1. **Fetch** — `fetchNotifications()` calls the external evaluation-service API
2. **Normalize** — Response is normalized to a flat array regardless of wrapper shape
3. **Prioritize** — The priority engine ranks items by type + timestamp
4. **Render** — Cards are rendered with rank badges, tier indicators, and formatted timestamps

---

## 3. Priority Logic (Heap-Based)

### Type Ranking

Each notification has a `type` field mapped to a numeric rank:

| Type        | Rank | Tier   |
|-------------|------|--------|
| `placement` | 3    | High   |
| `result`    | 2    | Medium |
| `event`     | 1    | Low    |
| *(unknown)* | 0    | Low    |

### Composite Goodness Score

A notification's "goodness" is a tuple `(typeRank, timestampMs)`.
Comparison is **lexicographic**: higher type rank wins; ties broken by newer timestamp.

### Top-N Selection (Min-Heap)

For the **Top Priority** view, we use a **min-heap of capacity N** (default 10):

```
Algorithm:  selectTopN(items, N)

1.  Create a min-heap (keyed by goodness — root = worst among best-N)
2.  For each item in the input:
    a.  If heap.size < N  → push(item)
    b.  Else if item is better than heap.peek():
        - pop() the worst item
        - push(item)
3.  Return heap contents sorted best-first

Complexity:  O(n log k)  where k = N
```

### All Notifications Sort

For the **All Notifications** view, a standard `O(n log n)` sort is used with the
same comparison function, producing best-first ordering.

---

## 4. API Design

### Current (External API)

```
GET  http://20.207.122.201/evaluation-service/notifications
Headers:
  Authorization: Bearer <JWT>
  Accept: application/json

Response: object[] | { notifications: object[] } | { data: object[] }
```

### Future Backend API (notification_app_be)

```
GET   /health
  → { status: "ok", timestamp: "..." }

GET   /api/notifications
  → { notifications: [ { id, type, title, description, timestamp } ] }

GET   /api/notifications/:id
  → { notification: { id, type, title, description, timestamp } }

POST  /api/notifications         (future)
  → Create a new notification

PATCH /api/notifications/:id     (future)
  → Update notification (e.g., mark as read)

DELETE /api/notifications/:id    (future)
  → Delete a notification
```

---

## 5. Logging Middleware Design

### Architecture

The `logging_middleware/` package provides a **factory pattern**:

```js
createLogger(baseUrl, token) → Log(stack, level, pkg, message)
```

- **Fire-and-forget**: Log calls are non-blocking (`.catch(() => {})`)
- **Stack-agnostic**: Used by both frontend (`stack: 'frontend'`) and backend (`stack: 'backend'`)
- **Express integration**: `requestLogger(Log)` middleware auto-logs HTTP requests

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

---

## 6. Frontend Component Hierarchy

```
<BrowserRouter>
  <App>
    <GlassLayout>                          ← Full-viewport gradient shell
      <Routes>
        <Route path="/" element={<AppLayout>}>  ← Data fetcher + tabs
          <Route path="priority" element={<PriorityPage>} />
          <Route path="all" element={<AllNotificationsPage>} />
        </Route>
      </Routes>
    </GlassLayout>
  </App>
</BrowserRouter>
```

### Component Responsibilities

| Component                | Role                                         |
|--------------------------|----------------------------------------------|
| `GlassLayout`            | Gradient background + max-width container    |
| `AppLayout`              | Fetches data once, provides via Outlet context |
| `NotificationTabs`       | Routed tab navigation (Priority / All)       |
| `Notifications`          | Applies priority engine, renders card list   |
| `NotificationCard`       | Individual glass-style notification card     |
| `NotificationsEmptyState`| "All caught up" placeholder                  |

---

## 7. Future Enhancements

- [ ] Database persistence (PostgreSQL / MongoDB)
- [ ] WebSocket / SSE for real-time push notifications
- [ ] User authentication and per-user notification streams
- [ ] Read/unread state management
- [ ] Notification preferences and filtering
- [ ] Rate limiting and pagination on the API
- [ ] Email / SMS notification channels
