import { createElement as h, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import GlassLayout from './components/GlassLayout.jsx'
import AllNotificationsPage from './pages/AllNotificationsPage.jsx'
import PriorityPage from './pages/PriorityPage.jsx'
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
