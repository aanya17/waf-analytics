import { useState, useEffect, useRef } from 'react'

const API = 'https://fluffy-space-giggle-g44ppvg75qq9hvq6q-5000.app.github.dev'

function actionColor(action) {
  if (action === 'ALLOWED') return 'var(--green)'
  if (action === 'DENIED') return 'var(--red)'
  return 'var(--amber)'
}

function actionBg(action) {
  if (action === 'ALLOWED') return 'var(--green-dim)'
  if (action === 'DENIED') return 'var(--red-dim)'
  return 'var(--amber-dim)'
}

export default function LiveMonitor() {
  const [logs, setLogs] = useState([])
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const bottomRef = useRef(null)
  const [newIds, setNewIds] = useState(new Set())

  useEffect(() => {
    if (paused) return
    async function fetchLogs() {
      try {
        const data = await fetch(`${API}/api/logs`).then(r => r.json())
        setLogs(prev => {
          const existingIds = new Set(prev.map(l => l.id))
          const newOnes = data.filter(l => !existingIds.has(l.id))
          setNewIds(new Set(newOnes.map(l => l.id)))
          setTimeout(() => setNewIds(new Set()), 1500)
          const merged = [...prev, ...newOnes].slice(-200)
          return merged
        })
      } catch {}
    }
    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [paused])

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, paused])

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Live Monitor</h1>
            {!paused && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 1s step-end infinite' }}/>
                STREAMING
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'ALLOWED', 'DENIED', 'SUSPICIOUS'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--mono)',
                background: filter === f ? (f === 'ALLOWED' ? 'var(--green-dim)' : f === 'DENIED' ? 'var(--red-dim)' : f === 'SUSPICIOUS' ? 'var(--amber-dim)' : 'var(--cyan-dim)') : 'var(--panel)',
                color: filter === f ? (f === 'ALLOWED' ? 'var(--green)' : f === 'DENIED' ? 'var(--red)' : f === 'SUSPICIOUS' ? 'var(--amber)' : 'var(--cyan)') : 'var(--text-muted)',
                border: '1px solid var(--border)', cursor: 'pointer', letterSpacing: 0.5
              }}>{f}</button>
            ))}
            <button onClick={() => setPaused(p => !p)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 11,
              background: paused ? 'var(--green-dim)' : 'var(--red-dim)',
              color: paused ? 'var(--green)' : 'var(--red)',
              border: `1px solid ${paused ? 'rgba(46,204,113,0.3)' : 'rgba(255,71,87,0.3)'}`,
              cursor: 'pointer', fontFamily: 'var(--mono)'
            }}>{paused ? '▶ RESUME' : '⏸ PAUSE'}</button>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Firewall logs streamed in real-time · {filtered.length} entries</p>
      </div>

      {/* Radar pulse visual */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12,
        padding: '18px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24
      }}>
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.3)', animation: 'radar 2s ease-out infinite' }}/>
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.2)', animation: 'radar 2s ease-out 0.5s infinite' }}/>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}/>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 2 }}>MONITORING ACTIVE</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>All firewall events are being captured and analyzed. Logs auto-update every 2 seconds.</div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          <div style={{ color: 'var(--green)' }}>{logs.filter(l => l.action === 'ALLOWED').length} allowed</div>
          <div style={{ color: 'var(--red)' }}>{logs.filter(l => l.action === 'DENIED').length} denied</div>
          <div style={{ color: 'var(--amber)' }}>{logs.filter(l => l.action === 'SUSPICIOUS').length} suspicious</div>
        </div>
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '140px 130px 130px 80px 100px 90px 80px 90px',
          padding: '10px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, fontFamily: 'var(--mono)'
        }}>
          <span>TIMESTAMP</span><span>SOURCE IP</span><span>ENDPOINT</span>
          <span>PROTOCOL</span><span>RULE</span><span>PORT</span>
          <span>BYTES</span><span>ACTION</span>
        </div>

        {/* Scrollable log rows */}
        <div style={{ height: 460, overflowY: 'auto' }}>
          {filtered.slice().reverse().map((log) => {
            const isNew = newIds.has(log.id)
            return (
              <div key={log.id} style={{
                display: 'grid', gridTemplateColumns: '140px 130px 130px 80px 100px 90px 80px 90px',
                padding: '9px 16px', borderBottom: '1px solid rgba(30,45,69,0.5)',
                fontSize: 11, fontFamily: 'var(--mono)',
                background: isNew ? 'rgba(0,212,255,0.04)' : 'transparent',
                transition: 'background 0.3s',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ color: 'var(--cyan)' }}>{log.source_ip}</span>
                <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.endpoint}</span>
                <span style={{ color: 'var(--purple)' }}>{log.protocol}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{log.rule}</span>
                <span style={{ color: 'var(--text-muted)' }}>{log.port}</span>
                <span style={{ color: 'var(--text-muted)' }}>{(log.bytes / 1024).toFixed(1)}kb</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: actionBg(log.action), color: actionColor(log.action),
                  display: 'inline-block', letterSpacing: 0.5
                }}>
                  {log.action === 'SUSPICIOUS' && '⚠ '}{log.action}
                </span>
              </div>
            )
          })}
          <div ref={bottomRef}/>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes radar {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
