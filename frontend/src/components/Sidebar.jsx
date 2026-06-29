import { useState, useEffect } from 'react'

const icons = {
  dashboard: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  live: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17"/>
    </svg>
  ),
  threats: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  rules: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'live', label: 'Live Monitor' },
  { id: 'threats', label: 'Threat Detection' },
  { id: 'rules', label: 'Firewall Rules' },
  { id: 'reports', label: 'Reports' },
]

export default function Sidebar({ current, onChange }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, width: 240, height: '100vh',
      background: 'var(--panel)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg,#00D4FF,#A855F7)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>WAF Analytics</div>
            <div style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>SECURITY MONITOR</div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
            boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s infinite',
            display: 'inline-block'
          }}/>
          <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>SYSTEM ACTIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 8, paddingLeft: 8 }}>NAVIGATION</div>
        {navItems.map(item => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: active ? 'var(--cyan-dim)' : 'transparent',
                border: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                color: active ? 'var(--cyan)' : 'var(--text-dim)',
                cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
                fontFamily: 'var(--sans)'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)' }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}}
            >
              {icons[item.id]}
              {item.label}
              {item.id === 'live' && <span style={{
                marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                background: 'var(--green)', boxShadow: '0 0 4px var(--green)'
              }}/>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Built by</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>Aanya Chahal & Ayushi Mishra</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>UPES Dehradun · 2025</div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </aside>
  )
}
