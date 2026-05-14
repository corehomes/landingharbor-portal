import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Wrench, Hammer, ShieldCheck, Users, TrendingUp } from 'lucide-react'
import './Dashboard.css'
import './Admin.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [warranty, setWarranty] = useState([])
  const [improvement, setImprovement] = useState([])
  const [insurance, setInsurance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getAllWarranty(),
      api.getAllImprovement(),
      api.getAllInsurance()
    ]).then(([w, i, ins]) => {
      setWarranty(w.records || [])
      setImprovement(i.records || [])
      setInsurance(ins.records || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pendingWarranty = warranty.filter(r => r.fields['Status'] === 'Submitted').length
  const pendingImprovement = improvement.filter(r => r.fields['Status'] === 'Pending Review').length
  const expiringInsurance = insurance.filter(r => {
    if (!r.fields['Insurance Expiration']) return false
    const exp = new Date(r.fields['Insurance Expiration'])
    const now = new Date()
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return exp <= thirtyDays && exp >= now
  }).length

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading admin data…</p></div>

  const stats = [
    { label: 'Total Warranty Requests', value: warranty.length, pending: pendingWarranty, color: '#fff8e1', accent: '#8b6914', to: '/admin/warranty', icon: Wrench },
    { label: 'Improvement Requests', value: improvement.length, pending: pendingImprovement, color: '#e3f2fd', accent: '#1565c0', to: '/admin/improvement', icon: Hammer },
    { label: 'Owners w/ Insurance', value: insurance.filter(r => r.fields['Insurance Provider']).length, pending: expiringInsurance, pendingLabel: 'expiring soon', color: '#fce4ec', accent: '#880e4f', to: '/admin/insurance', icon: ShieldCheck },
  ]

  const recentWarranty = warranty.slice(0, 5)
  const recentImprovement = improvement.slice(0, 5)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Overview</h1>
          <p>LandingHarbor Community Portal — Management Dashboard</p>
        </div>
      </div>

      <div className="admin-stats">
        {stats.map(({ label, value, pending, pendingLabel, color, accent, to, icon: Icon }) => (
          <button key={to} className="stat-card" style={{ '--card-bg': color, '--card-accent': accent }} onClick={() => navigate(to)}>
            <div className="stat-icon"><Icon size={24} color={accent} /></div>
            <div className="stat-content">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              {pending > 0 && (
                <div className="stat-pending">⚠️ {pending} {pendingLabel || 'pending'}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="admin-two-col">
        <div className="card">
          <div className="admin-section-header">
            <h2>Recent Warranty Requests</h2>
            <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => navigate('/admin/warranty')}>View All</button>
          </div>
          {recentWarranty.length === 0 ? (
            <p className="empty-state">No warranty requests yet.</p>
          ) : (
            <div className="admin-mini-list">
              {recentWarranty.map(r => (
                <div key={r.id} className="admin-mini-item">
                  <div>
                    <strong>{r.fields['Last Name']}, {r.fields['First Name']}</strong>
                    <span className="admin-mini-sub">{r.fields['Property']} — #{r.fields['Site Number']}</span>
                  </div>
                  <span className={`badge ${statusClass(r.fields['Status'])}`}>{r.fields['Status'] || 'Submitted'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="admin-section-header">
            <h2>Recent Improvement Requests</h2>
            <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => navigate('/admin/improvement')}>View All</button>
          </div>
          {recentImprovement.length === 0 ? (
            <p className="empty-state">No improvement requests yet.</p>
          ) : (
            <div className="admin-mini-list">
              {recentImprovement.map(r => (
                <div key={r.id} className="admin-mini-item">
                  <div>
                    <strong>{r.fields['Last Name']}</strong>
                    <span className="admin-mini-sub">{r.fields['Property']} — #{r.fields['Site Number']}</span>
                  </div>
                  <span className={`badge ${statusClass(r.fields['Status'])}`}>{r.fields['Status'] || 'Pending'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function statusClass(status) {
  const map = {
    'Submitted': 'badge-submitted',
    'Under Review': 'badge-review',
    'Pending Review': 'badge-pending',
    'Approved': 'badge-approved',
    'Denied': 'badge-denied',
  }
  return map[status] || 'badge-pending'
}
