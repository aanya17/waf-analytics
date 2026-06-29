import { useState, useEffect } from 'react'

const API = 'http://localhost:5000'

const severityColor = { HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--green)' }
const severityBg = { HIGH: 'var(--red-dim)', MEDIUM: 'var(--amber-dim)', LOW: 'var(--green-dim)' }

const threatIcons = {
  'SQL Injection': '💉',
  'XSS Attack': '🔀',
  'Brute Force': '🔨',
  'Port Scan': '🔍',
  'DDoS': '🌊',
  'Path Traversal': '📂',
}

export default function ThreatDetection() {
  const [threats, setThreats] = useState([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    async function fetch_() {
      try {
        const data = await fetch(`${API}/api/threats`).then(r => r.json())
        setThreats(data)
      } catch {}
    }
    fetch_()
    const interval = setInterval(fetch_, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'ALL' ? threats : threats.filter(t => t.severity === filter)
  const counts = { HIGH: threats.filter(t => t.severity === 'HIGH').length, MEDIUM: threats.filter(t => t.severity === 'MEDIUM').length, LOW: threats.filter(t => t.severity === 'LOW').length }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Threat Detection</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Detected security events and attack patterns · updates every 3s</p>
      </div>

      {/* Severity summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {['HIGH', 'MEDIUM', 'LOW'].map(s => (
          <div key={s} onClick={() => setFilter(filter === s ? 'ALL' : s)}
            style={{
              background: 'var(--panel)', border: `1px solid ${filter === s ? severityColor[s] : 'var(--border)'}`,
              borderRadius: 12, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.15s',
              position: 'relative', overflow: 'hidden'
            }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: severityColor[s] }}/>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>
              {s} SEVERITY
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: severityColor[s], fontFamily: 'var(--mono)' }}>
              {counts[s]}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>threats detected</div>
          </div>
        ))}
      </div>

      {/* Threat type breakdown */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 16 }}>Attack Type Distribution</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(
            threats.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc }, {})
          ).map(([type, count]) => (
            <div key={type} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: 20 }}>{threatIcons[type] || '⚠'}</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{type}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--mono)',
            background: filter === f ? (severityBg[f] || 'var(--cyan-dim)') : 'var(--panel)',
            color: filter === f ? (severityColor[f] || 'var(--cyan)') : 'var(--text-muted)',
            border: '1px solid var(--border)', cursor: 'pointer'
          }}>{f}</button>
        ))}
      </div>

      {/* Threat list */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 130px 120px 100px 100px 1fr',
          padding: '10px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, fontFamily: 'var(--mono)'
        }}>
          <span>TIMESTAMP</span><span>SOURCE IP</span><span>ATTACK TYPE</span>
          <span>SEVERITY</span><span>RULE</span><span>ENDPOINT</span>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No threats detected with current filter
            </div>
          ) : filtered.map(t => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '150px 130px 120px 100px 100px 1fr',
              padding: '11px 20px', borderBottom: '1px solid rgba(30,45,69,0.5)',
              fontSize: 11, fontFamily: 'var(--mono)', alignItems: 'center',
              borderLeft: `3px solid ${severityColor[t.severity]}`
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
              <span style={{ color: 'var(--cyan)' }}>{t.source_ip}</span>
              <span style={{ color: 'var(--text-dim)' }}>{threatIcons[t.type]} {t.type}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                background: severityBg[t.severity], color: severityColor[t.severity],
                display: 'inline-block', letterSpacing: 0.5
              }}>{t.severity}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{t.rule}</span>
              <span style={{ color: 'var(--text-dim)' }}>{t.endpoint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
