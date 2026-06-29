import { useState, useEffect } from 'react'

const API = 'https://fluffy-space-giggle-g44ppvg75qq9hvq6q-5000.app.github.dev'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [threats, setThreats] = useState([])
  const [rules, setRules] = useState([])
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/threats`).then(r => r.json()),
      fetch(`${API}/api/rules`).then(r => r.json()),
    ]).then(([s, t, r]) => { setStats(s); setThreats(t); setRules(r) }).catch(() => {})
  }, [])

  function downloadCSV() {
    if (!stats) return
    const rows = [
      ['Metric', 'Value'],
      ['Total Requests', stats.total],
      ['Allowed', stats.allowed],
      ['Denied', stats.denied],
      ['Suspicious', stats.suspicious],
      ['Threats Detected', stats.threats],
      ['Firewall Health Score', stats.health_score + '%'],
      ['Active Sessions', stats.active_sessions],
      [],
      ['Threat Type', 'Count'],
      ...Object.entries(threats.reduce((acc, t) => { acc[t.type] = (acc[t.type]||0)+1; return acc }, {})),
      [],
      ['Rule ID', 'Rule Name', 'Health', 'Usage', 'Hits', 'Recommendation'],
      ...rules.map(r => [r.id, r.name, r.health+'%', r.usage, r.hits, r.recommendation])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'waf_security_report.csv'; a.click()
  }

  function downloadTXT() {
    if (!stats) return
    const now = new Date().toLocaleString()
    const report = `
WAF ANALYTICS SECURITY REPORT
Generated: ${now}
By: Aanya Chahal & Ayushi Mishra — UPES Dehradun
${'='.repeat(60)}

EXECUTIVE SUMMARY
-----------------
Total Requests Analyzed : ${stats.total}
Allowed Traffic         : ${stats.allowed} (${((stats.allowed/stats.total)*100).toFixed(1)}%)
Denied / Blocked        : ${stats.denied} (${((stats.denied/stats.total)*100).toFixed(1)}%)
Suspicious Activity     : ${stats.suspicious}
Threats Detected        : ${stats.threats}
Firewall Health Score   : ${stats.health_score}%
Active Sessions         : ${stats.active_sessions}

NIST CSF MAPPING
----------------
IDENTIFY  : ${stats.total} assets monitored
PROTECT   : ${stats.denied} requests blocked by firewall rules
DETECT    : ${stats.threats} threats identified via behavioral analysis
RESPOND   : Alerts generated for ${stats.suspicious} suspicious events
RECOVER   : Full traffic audit trail available for incident response

FIREWALL RULE STATUS
--------------------
${rules.map(r => `${r.id.padEnd(14)} ${r.name.padEnd(22)} Health: ${String(r.health+'%').padEnd(6)} ${r.recommendation}`).join('\n')}

THREAT SUMMARY
--------------
${Object.entries(threats.reduce((acc,t)=>{acc[t.type]=(acc[t.type]||0)+1;return acc},{})).map(([k,v]) => `${k.padEnd(20)} : ${v} incidents`).join('\n')}

${'='.repeat(60)}
WAF Analytics System — NETCRYPT 2026 Research Project
    `.trim()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'waf_security_report.txt'; a.click()
    setGenerated(true)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Security Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generate and export security analysis reports</p>
      </div>

      {/* NIST mapping */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 16 }}>NIST Cybersecurity Framework Mapping</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { fn: 'IDENTIFY', desc: 'Asset & traffic analysis', color: 'var(--cyan)', val: `${stats?.total || 0} assets` },
            { fn: 'PROTECT', desc: 'Firewall rule evaluation', color: 'var(--green)', val: `${stats?.denied || 0} blocked` },
            { fn: 'DETECT', desc: 'Threat detection engine', color: 'var(--amber)', val: `${stats?.threats || 0} threats` },
            { fn: 'RESPOND', desc: 'Alerts & notifications', color: 'var(--red)', val: `${stats?.suspicious || 0} alerts` },
            { fn: 'RECOVER', desc: 'Historical analytics', color: 'var(--purple)', val: 'Full audit trail' },
          ].map(item => (
            <div key={item.fn} style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 8, border: `1px solid ${item.color}30`, borderTop: `2px solid ${item.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: item.color, fontFamily: 'var(--mono)', marginBottom: 6 }}>{item.fn}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{item.desc}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Report preview */}
      {stats && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 16 }}>Report Preview</div>
          <div style={{
            background: 'var(--bg2)', borderRadius: 8, padding: 20,
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)',
            lineHeight: 1.8, border: '1px solid var(--border)'
          }}>
            <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 4 }}>WAF ANALYTICS SECURITY REPORT</div>
            <div style={{ color: 'var(--text-muted)' }}>Generated: {new Date().toLocaleString()}</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>By: Aanya Chahal & Ayushi Mishra — UPES Dehradun</div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div>Total Requests  : <span style={{ color: 'var(--cyan)' }}>{stats.total}</span></div>
              <div>Allowed         : <span style={{ color: 'var(--green)' }}>{stats.allowed}</span></div>
              <div>Denied          : <span style={{ color: 'var(--red)' }}>{stats.denied}</span></div>
              <div>Threats         : <span style={{ color: 'var(--amber)' }}>{stats.threats}</span></div>
              <div>Health Score    : <span style={{ color: 'var(--purple)' }}>{stats.health_score}%</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Download buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={downloadCSV} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 8, background: 'var(--green-dim)',
          color: 'var(--green)', border: '1px solid rgba(46,204,113,0.3)',
          cursor: 'pointer', fontSize: 13, fontWeight: 600
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download CSV
        </button>
        <button onClick={downloadTXT} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 8, background: 'var(--cyan-dim)',
          color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.3)',
          cursor: 'pointer', fontSize: 13, fontWeight: 600
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Download Security Report (.txt)
        </button>
        {generated && <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--green)' }}>✓ Report generated!</span>}
      </div>
    </div>
  )
}
