import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import './Admin.css'

const STATUSES = ['Submitted', 'Under Review', 'Resolved', 'Denied']
const FILTERS = ['All', 'Submitted', 'Under Review', 'Resolved', 'Denied']

export default function AdminWarranty() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [updates, setUpdates] = useState({}) // { id: { status, notes } }
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})

  useEffect(() => {
    api.getAllWarranty().then(({ records }) => {
      setRecords(records || [])
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'All' ? records : records.filter(r => r.fields['Status'] === filter)

  const getUpdate = (id, field, fallback) => updates[id]?.[field] ?? fallback

  const setUpdate = (id, field, value) => {
    setUpdates(u => ({ ...u, [id]: { ...u[id], [field]: value } }))
  }

  const handleSave = async (id, currentStatus, currentNotes) => {
    const status = getUpdate(id, 'status', currentStatus)
    const notes = getUpdate(id, 'notes', currentNotes)
    setSaving(s => ({ ...s, [id]: true }))
    try {
      await api.updateWarrantyStatus(id, status, notes)
      setSaved(s => ({ ...s, [id]: true }))
      setRecords(rs => rs.map(r => r.id === id ? { ...r, fields: { ...r.fields, Status: status, 'Admin Notes': notes } } : r))
      setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2500)
    } catch {}
    setSaving(s => ({ ...s, [id]: false }))
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="admin-table-page">
      <div className="admin-table-header">
        <div>
          <h1>Warranty Requests</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: 4 }}>{records.length} total requests</p>
        </div>
        <div className="admin-filters">
          {FILTERS.map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No {filter !== 'All' ? filter.toLowerCase() : ''} warranty requests.</p></div>
      ) : (
        <div className="admin-record-list">
          {filtered.map(r => {
            const f = r.fields
            const status = getUpdate(r.id, 'status', f['Status'])
            const notes = getUpdate(r.id, 'notes', f['Admin Notes'] || '')
            return (
              <div key={r.id} className="admin-record-card">
                <div className="admin-record-top">
                  <div>
                    <div className="admin-record-name">{f['Last Name']}, {f['First Name']}</div>
                    <div className="admin-record-meta">
                      {f['Property']} — Site #{f['Site Number']} &nbsp;·&nbsp; {f['Email']} &nbsp;·&nbsp; {f['Phone']}
                    </div>
                    <div className="admin-record-meta">Serial/VIN: {f['Serial / VIN']} &nbsp;·&nbsp; Submitted: {f['Submission Date']}</div>
                  </div>
                  <span className={`badge ${statusClass(f['Status'])}`}>{f['Status'] || 'Submitted'}</span>
                </div>
                <div className="admin-record-body">{f['Issue Description']}</div>
                <div className="admin-record-actions">
                  <select
                    className="admin-status-select"
                    value={status}
                    onChange={e => setUpdate(r.id, 'status', e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    className="admin-notes-input"
                    placeholder="Add management note (visible to owner)…"
                    value={notes}
                    onChange={e => setUpdate(r.id, 'notes', e.target.value)}
                  />
                  <button
                    className="admin-save-btn"
                    onClick={() => handleSave(r.id, f['Status'], f['Admin Notes'])}
                    disabled={saving[r.id]}
                  >
                    {saving[r.id] ? 'Saving…' : saved[r.id] ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function statusClass(status) {
  const map = { 'Submitted': 'badge-submitted', 'Under Review': 'badge-review', 'Resolved': 'badge-approved', 'Denied': 'badge-denied' }
  return map[status] || 'badge-pending'
}
