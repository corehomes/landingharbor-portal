import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { ExternalLink } from 'lucide-react'
import './Admin.css'

export default function AdminInsurance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.getAllInsurance().then(({ records }) => {
      setRecords(records || [])
      setLoading(false)
    })
  }, [])

  const today = new Date()
  const in30 = new Date(); in30.setDate(today.getDate() + 30)

  const categorize = (r) => {
    const exp = r.fields['Insurance Expiration'] ? new Date(r.fields['Insurance Expiration']) : null
    if (!r.fields['Insurance Provider']) return 'missing'
    if (!exp) return 'no-date'
    if (exp < today) return 'expired'
    if (exp <= in30) return 'expiring'
    return 'current'
  }

  const filtered = filter === 'all' ? records : records.filter(r => categorize(r) === filter)

  const counts = {
    all: records.length,
    current: records.filter(r => categorize(r) === 'current').length,
    expiring: records.filter(r => categorize(r) === 'expiring').length,
    expired: records.filter(r => categorize(r) === 'expired').length,
    missing: records.filter(r => categorize(r) === 'missing').length,
  }

  const catLabel = { current: '✅ Current', expiring: '⚠️ Expiring Soon', expired: '🔴 Expired', missing: '❓ No Record', 'no-date': 'No Date' }
  const catBadge = { current: 'badge-approved', expiring: 'badge-pending', expired: 'badge-denied', missing: 'badge-pending', 'no-date': 'badge-pending' }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="admin-table-page">
      <div className="admin-table-header">
        <div>
          <h1>Insurance Records</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: 4 }}>{records.length} owner profiles</p>
        </div>
        <div className="admin-filters">
          {[['all', 'All'], ['current', 'Current'], ['expiring', 'Expiring'], ['expired', 'Expired'], ['missing', 'Missing']].map(([val, label]) => (
            <button
              key={val}
              className={`filter-btn ${filter === val ? 'active' : ''}`}
              onClick={() => setFilter(val)}
            >
              {label} ({counts[val]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No records in this category.</p></div>
      ) : (
        <div className="admin-record-list">
          {filtered.map(r => {
            const f = r.fields
            const cat = categorize(r)
            return (
              <div key={r.id} className="admin-record-card">
                <div className="admin-record-top">
                  <div>
                    <div className="admin-record-name">{f['Last Name']}, {f['First Name']}</div>
                    <div className="admin-record-meta">
                      {f['Property']} — Site #{f['Site Number']} &nbsp;·&nbsp; {f['Email']}
                    </div>
                  </div>
                  <span className={`badge ${catBadge[cat]}`}>{catLabel[cat]}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: '0.87rem', color: 'var(--text-mid)' }}>
                  <div>
                    <strong>Provider</strong>
                    <p style={{ marginTop: 4 }}>{f['Insurance Provider'] || <em style={{ color: 'var(--error)' }}>None on file</em>}</p>
                  </div>
                  <div>
                    <strong>Expiration</strong>
                    <p style={{ marginTop: 4, color: cat === 'expired' ? 'var(--error)' : cat === 'expiring' ? '#856404' : 'inherit' }}>
                      {f['Insurance Expiration'] || <em>Not provided</em>}
                    </p>
                  </div>
                  <div>
                    <strong>Document</strong>
                    <p style={{ marginTop: 4 }}>
                      {f['Insurance Doc Link'] ? (
                        <a href={f['Insurance Doc Link']} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--pine)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={13} /> View Doc
                        </a>
                      ) : <em style={{ color: 'var(--text-light)' }}>Not linked yet</em>}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
