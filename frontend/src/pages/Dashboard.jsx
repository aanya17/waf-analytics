import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API = 'https://waf-analytics-60ptpqi6x-aas-projects-48571e8c.vercel.app'

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '20px 24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`
      }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${color}18`, color
        }}>{icon}</div>
      </div>
    </div>
  )
}

const COLORS = ['#00D4FF', '#FF4757', '#FFB340', '#2ECC71', '#A855F7', '#F97316', '#06B6D4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a2235', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, t] = await Promise.all([
          fetch(`${API}/api/stats`).then(r => r.json()),
          fetch(`${API}/api/timeline`).then(r => r.json())
        ])
        setStats(s)
        setTimeline(t)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchAll()
    const interval = setInterval(fetchAll, 5000)
    return () => clearInterval(interval)
  }, [])

  const protocolData = stats ? Object.entries(stats.protocol_dist || {}).map(([name, value]) => ({ name, value })) : []

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Security Dashboard</h1>
          <span style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: 'var(--green-dim)', color: 'var(--green)',
            fontFamily: 'var(--mono)', letterSpacing: 1
          }}>LIVE</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Real-time WAF analytics and traffic monitoring · Auto-refreshes every 5s
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', padding: 40, textAlign: 'center' }}>
          Connecting to monitoring system...
        </div>
      ) : !stats ? (
        <div style={{ color: 'var(--red)', padding: 40, textAlign: 'center' }}>
          ⚠ Could not connect to backend. Make sure <code style={{fontFamily:'var(--mono)'}}>python app.py</code> is running on port 5000.
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="TOTAL REQUESTS" value={stats.total?.toLocaleString()} sub="Last 200 logs" color="var(--cyan)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
            <StatCard label="ALLOWED" value={stats.allowed?.toLocaleString()} sub={`${((stats.allowed/stats.total)*100).toFixed(1)}% of traffic`} color="var(--green)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
            <StatCard label="DENIED" value={stats.denied?.toLocaleString()} sub={`${((stats.denied/stats.total)*100).toFixed(1)}% blocked`} color="var(--red)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>} />
            <StatCard label="THREATS DETECTED" value={stats.threats} sub="All sessions" color="var(--amber)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="FIREWALL HEALTH" value={`${stats.health_score}%`} sub="System integrity" color="var(--purple)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
            <StatCard label="SUSPICIOUS" value={stats.suspicious} sub="Flagged requests" color="#F97316"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>} />
            <StatCard label="ACTIVE SESSIONS" value={stats.active_sessions} sub="Live connections" color="var(--cyan)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
            <StatCard label="TOP SOURCE IP" value={stats.top_ips?.[0]?.ip || '—'} sub={`${stats.top_ips?.[0]?.count || 0} requests`} color="var(--green)"
              icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} />
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Traffic timeline */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, color: 'var(--text-dim)' }}>Traffic Timeline (24h)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeline}>
                  <XAxis dataKey="hour" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="allowed" stroke="var(--green)" strokeWidth={2} dot={false} name="Allowed" />
                  <Line type="monotone" dataKey="denied" stroke="var(--red)" strokeWidth={2} dot={false} name="Denied" />
                  <Line type="monotone" dataKey="suspicious" stroke="var(--amber)" strokeWidth={2} dot={false} name="Suspicious" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[['Allowed','var(--green)'],['Denied','var(--red)'],['Suspicious','var(--amber)']].map(([l,c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ width: 12, height: 2, background: c, display: 'inline-block', borderRadius: 1 }}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol pie */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-dim)' }}>Protocol Distribution</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={protocolData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {protocolData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
                {protocolData.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }}/>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Top source IPs */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, color: 'var(--text-dim)' }}>Top Source IPs</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.top_ips} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="ip" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="var(--cyan)" radius={[0, 4, 4, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Allowed vs denied bar */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, color: 'var(--text-dim)' }}>Traffic Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Allowed', value: stats.allowed, total: stats.total, color: 'var(--green)' },
                  { label: 'Denied', value: stats.denied, total: stats.total, color: 'var(--red)' },
                  { label: 'Suspicious', value: stats.suspicious, total: stats.total, color: 'var(--amber)' },
                ].map(({ label, value, total, color }) => {
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                        <span style={{ color, fontFamily: 'var(--mono)' }}>{value} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>FIREWALL HEALTH SCORE</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: stats.health_score > 70 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>
                  {stats.health_score}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {stats.health_score > 80 ? 'System operating normally' : 'Elevated threat activity detected'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
