import { useState, useEffect } from 'react'

const API = 'https://waf-analytics-93i70o9v1-aas-projects-48571e8c.vercel.app'

function HealthBar({ value }) {
  const color = value > 80 ? 'var(--green)' : value > 40 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }}/>
      </div>
      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color, minWidth: 36, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

export default function FirewallRules() {
  const [rules, setRules] = useState([])

  useEffect(() => {
    fetch(`${API}/api/rules`).then(r => r.json()).then(setRules).catch(() => {})
  }, [])

  const avgHealth = rules.length ? Math.round(rules.reduce((s, r) => s + r.health, 0) / rules.length) : 0
  const critical = rules.filter(r => r.health < 20).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Firewall Rule Health</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Health scoring for every active firewall rule · unique feature</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>TOTAL RULES</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>{rules.length}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>AVERAGE HEALTH</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: avgHealth > 70 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>{avgHealth}%</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', borderTop: '2px solid var(--red)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>CRITICAL (HEALTH &lt; 20%)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{critical}</div>
        </div>
      </div>

      {/* Rules table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rules.map(rule => {
          const color = rule.health > 80 ? 'var(--green)' : rule.health > 40 ? 'var(--amber)' : 'var(--red)'
          const status = rule.health > 80 ? 'HEALTHY' : rule.health > 40 ? 'REVIEW' : 'CRITICAL'
          return (
            <div key={rule.id} style={{
              background: 'var(--panel)', border: '1px solid var(--border)',
              borderLeft: `3px solid ${color}`,
              borderRadius: 12, padding: '20px 24px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 200px', gap: 20, alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)' }}>{rule.id}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--mono)',
                      background: color + '18', color, letterSpacing: 0.5, fontWeight: 600
                    }}>{status}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{rule.name}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>USAGE</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>{rule.usage}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>TOTAL HITS</div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{rule.hits.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>HEALTH SCORE</div>
                  <HealthBar value={rule.health} />
                </div>
              </div>

              <div style={{
                padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8,
                border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: 10
              }}>
                <svg width="14" height="14" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  <strong style={{ color }}>Recommendation: </strong>{rule.recommendation}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
