import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LiveMonitor from './pages/LiveMonitor.jsx'
import ThreatDetection from './pages/ThreatDetection.jsx'
import FirewallRules from './pages/FirewallRules.jsx'
import Reports from './pages/Reports.jsx'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    live: <LiveMonitor />,
    threats: <ThreatDetection />,
    rules: <FirewallRules />,
    reports: <Reports />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar current={page} onChange={setPage} />
      <main style={{ flex: 1, marginLeft: 240, padding: '28px 32px', overflowY: 'auto', minHeight: '100vh' }}>
        {pages[page]}
      </main>
    </div>
  )
}
