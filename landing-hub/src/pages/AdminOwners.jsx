import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import './Admin.css'

export default function AdminOwners() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [propFilter, setPropFilter] = useState('All')

  useEffect(() => {
    api.getAllInsurance().then(({ records }) => {
      setRecords(records || [])
      setLoading(false)
    })
  }, [])

  const properties = ['All', ...Array.from(new Set(records.map(r => r.fields['Property']).filter(Boolean)))]

  const filtered = records.filter(r => {
    const f = r.fields
    const name = `${f['First Name'] || ''} ${f['Last Name'] || ''}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || (f['Email'] || '').includes(search.toLowerCase()) || (f['Site Number'] || '').includes(search)
    const matchProp = propFilter === 'All' || f['Property'] === propFilter
    return matchSearch && matchProp
  })

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="admin-table-page">
      <div className="admin-table-header">
        <div>
          <h1>Owner Profiles</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: 4 }}>{records.length} registered owners</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ padding: '8px 16px', border: '1.5px solid var(--cream-dark)', borderRadius: 8, fontSize: '0.9rem', minWidth: 220 }}
          placeholder="Search by name, email, site…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="admin-filters">
          {properties.map(p => (
            <button key={p} className={`filter-btn ${propFilter === p ? 'active' : ''}`} onClick={() => setPropFilter(p)}>{p}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No owner profiles found.</p></div>
      ) : (
        <div className="admin-record-list">
          {filtered.map(r => {
            const f = r.fields
            return (
              <div key={r.id} className="admin-record-card">
                <div className="admin-record-top">
                  <div>
                    <div className="admin-record-name">{f['Last Name']}, {f['First Name']}</div>
                    <div className="admin-record-meta">
                      {f['Email']}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="meta-chip" style={{ background: 'var(--cream)', color: 'var(--pine)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                      {f['Property']}
                    </span>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>Site #{f['Site Number']}</div>
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
