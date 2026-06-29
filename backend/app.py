from flask import Flask, jsonify
from flask_cors import CORS
import random, time, datetime, os

app = Flask(__name__)
CORS(app, origins="*")

PROTOCOLS = ['HTTP', 'HTTPS', 'TCP', 'UDP', 'FTP', 'SSH', 'DNS']
ACTIONS = ['ALLOWED', 'ALLOWED', 'ALLOWED', 'DENIED', 'DENIED', 'SUSPICIOUS']
THREAT_TYPES = ['SQL Injection', 'XSS Attack', 'Brute Force', 'Port Scan', 'DDoS', 'Path Traversal']
SOURCE_IPS = [f"192.168.{random.randint(1,5)}.{random.randint(1,255)}" for _ in range(20)] + [f"10.0.{random.randint(0,3)}.{random.randint(1,255)}" for _ in range(10)] + [f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,255)}" for _ in range(15)]
ENDPOINTS = ['/login', '/api/users', '/admin', '/search', '/upload', '/', '/api/data', '/wp-admin', '/phpmyadmin', '/.env']
FIREWALL_RULES = [
    {'id': 'LAN-WAN-01', 'name': 'LAN to WAN HTTP', 'health': 95, 'usage': 'High', 'hits': 8423},
    {'id': 'DMZ-INT-02', 'name': 'DMZ Internal Access', 'health': 78, 'usage': 'Medium', 'hits': 3201},
    {'id': 'BLOCK-TOR-03', 'name': 'Block TOR Exits', 'health': 88, 'usage': 'High', 'hits': 1205},
    {'id': 'OLD-FTP-04', 'name': 'Legacy FTP Rule', 'health': 12, 'usage': 'Very Low', 'hits': 3},
    {'id': 'SSH-MGMT-05', 'name': 'SSH Management', 'health': 91, 'usage': 'Medium', 'hits': 412},
    {'id': 'DENY-ALL-06', 'name': 'Default Deny All', 'health': 99, 'usage': 'High', 'hits': 12300},
    {'id': 'LEGACY-07', 'name': 'Old VPN Bypass', 'health': 8, 'usage': 'Unused', 'hits': 0},
]
log_store = []
threat_store = []

def generate_log():
    action = random.choice(ACTIONS)
    ip = random.choice(SOURCE_IPS)
    is_threat = action == 'SUSPICIOUS' or (action == 'DENIED' and random.random() < 0.3)
    threat_type = random.choice(THREAT_TYPES) if is_threat else None
    log = {'id': int(time.time() * 1000) + random.randint(0, 999), 'timestamp': datetime.datetime.now().isoformat(), 'source_ip': ip, 'dest_ip': f"10.0.0.{random.randint(1,10)}", 'protocol': random.choice(PROTOCOLS), 'endpoint': random.choice(ENDPOINTS), 'action': action, 'rule': random.choice(FIREWALL_RULES)['id'], 'bytes': random.randint(200, 50000), 'threat_type': threat_type, 'port': random.choice([80, 443, 22, 8080, 3306, 21, 25, 53])}
    if is_threat and threat_type:
        threat_store.append({'id': log['id'], 'timestamp': log['timestamp'], 'source_ip': ip, 'type': threat_type, 'severity': random.choice(['HIGH', 'HIGH', 'MEDIUM', 'LOW']), 'endpoint': log['endpoint'], 'rule': log['rule']})
        if len(threat_store) > 100: threat_store.pop(0)
    return log

for _ in range(50): log_store.append(generate_log())

@app.route('/')
def index(): return jsonify({'status': 'WAF Analytics API running'})

@app.route('/api/stats')
def stats():
    all_logs = log_store[-200:]
    total = len(all_logs)
    allowed = sum(1 for l in all_logs if l['action'] == 'ALLOWED')
    denied = sum(1 for l in all_logs if l['action'] == 'DENIED')
    suspicious = sum(1 for l in all_logs if l['action'] == 'SUSPICIOUS')
    protocols = {}
    for l in all_logs: protocols[l['protocol']] = protocols.get(l['protocol'], 0) + 1
    ip_counts = {}
    for l in all_logs: ip_counts[l['source_ip']] = ip_counts.get(l['source_ip'], 0) + 1
    top_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return jsonify({'total': total, 'allowed': allowed, 'denied': denied, 'suspicious': suspicious, 'threats': len(threat_store), 'health_score': round((allowed/total*100) if total > 0 else 100, 1), 'protocol_dist': protocols, 'top_ips': [{'ip': ip, 'count': c} for ip, c in top_ips], 'active_sessions': random.randint(12, 45)})

@app.route('/api/logs')
def logs():
    log_store.append(generate_log())
    if len(log_store) > 500: log_store.pop(0)
    return jsonify(log_store[-30:])

@app.route('/api/threats')
def threats(): return jsonify(threat_store[-20:][::-1])

@app.route('/api/rules')
def rules():
    result = []
    for r in FIREWALL_RULES:
        rec = 'No changes needed.' if r['health'] > 80 else ('Consider reviewing usage.' if r['health'] > 40 else 'Remove or archive — unused for 90+ days.')
        result.append({**r, 'recommendation': rec})
    return jsonify(result)

@app.route('/api/timeline')
def timeline():
    now = datetime.datetime.now()
    return jsonify([{'hour': (now - datetime.timedelta(hours=23-i)).strftime('%H:00'), 'allowed': random.randint(30, 120), 'denied': random.randint(5, 30), 'suspicious': random.randint(0, 10)} for i in range(24)])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
