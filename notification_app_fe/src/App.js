import { createElement as h, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import GlassLayout from './components/layout/GlassLayout.jsx'
import AllNotificationsPage from './pages/notifications/AllNotificationsPage.jsx'
import PriorityPage from './pages/notifications/PriorityPage.jsx'
import { Log } from './utils/logger.js'
import './App.css'

export default function App() {
  useEffect(() => {
    Log('frontend', 'info', 'page', 'App mounted')
  }, [])

  return h(
    GlassLayout,
    null,
    h(
      Routes,
      null,
      h(
        Route,
        { path: '/', element: h(AppLayout) },
        h(Route, { index: true, element: h(Navigate, { to: '/priority', replace: true }) }),
        h(Route, { path: 'priority', element: h(PriorityPage) }),
        h(Route, { path: 'all', element: h(AllNotificationsPage) }),
      ),
      h(Route, { path: '*', element: h(Navigate, { to: '/priority', replace: true }) }),
    ),
  )
}
