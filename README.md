# Notification System — Monorepo

A full-stack notification system with heap-based priority ranking, glassmorphism UI, and shared logging middleware.

## 📁 Project Structure

```
shivayya/
├── logging_middleware/          # Shared logging library (FE + BE)
│   ├── logger.js
│   ├── package.json
│   └── README.md
│
├── notification_app_fe/         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, GlassLayout
│   │   │   ├── notifications/   # NotificationCard, Notifications, EmptyState, Tabs
│   │   │   └── styles/          # glass.module.css
│   │   ├── pages/notifications/ # AllNotificationsPage, PriorityPage
│   │   ├── services/            # API calls (notifications.js)
│   │   └── utils/               # logger, priority, notificationContent
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── notification_app_be/         # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── models/
│   └── package.json
│
└── notification_system_design.md
```

## 🚀 Quick Start

### Frontend

```bash
cd notification_app_fe
npm install
npm run dev
```

### Backend

```bash
cd notification_app_be
npm install
npm run dev
```

### Logging Middleware

```bash
cd logging_middleware
npm install
```

## 📖 Documentation

See [notification_system_design.md](./notification_system_design.md) for architecture details, priority logic, and API design.
