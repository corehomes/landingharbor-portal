import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { UserPlus, Mail, CheckCircle, XCircle } from 'lucide-react'
import './Admin.css'
import './AdminOwners.css'

export default function AdminOwners() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [propFilter, setPropFilter] = useState('All')
  const [selected, setSelected] = useState(new Set())

  useEffect(() => {
    api.getAllOwnerProfiles().then(({ records }) => {
      setRecords(records || [])
      setLoading(false)
    })
  }, [])

  const properties = ['All', ...Array.from(new Set(records.map(r => r.fields['Property']).filter(Boolean))).sort()]

  const filtered = records.filter(r => {
    const f = r.fields
    const name = `${f['First Name'] || ''} ${f['Last Name'] || ''} ${f['Co-Owner First Name'] || ''} ${f['Co-Owner Last Name'] || ''}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      (f['Email'] || '').toLowerCase().includes(search.toLowerCase()) ||
      (f['Site Number'] || '').includes(search)
    const matchProp = propFilter === 'All' || f['Property'] === propFilter
    return matchSearch && matchProp
  })

  const toggleSelect = (id) => {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(r => r.id)))
    }
  }

  const openSingleEmail = (record) => {
    const f = record.fields
    const to = encodeURIComponent(f['Email'] || '')
    const subject = encodeURIComponent(`Message from ELS Cottage Management`)
    window.location.href = `mailto:${to}?subject=${subject}`
  }

  const openBulkEmail = () => {
    const selectedRecords = filtered.filter(r => selected.has(r.id))
    const emails = selectedRecords.map(r => r.fields['Email']).filter(Boolean)
    const bcc = encodeURIComponent(emails.join(','))
    const to = encodeURIComponent('jen_lacour@equitylifestyle.com')
    const subject = encodeURIComponent('Message from ELS Cottage Management')
    window.location.href = `mailto:${to}?bcc=${bcc}&subject=${subject}`
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="admin-table-page">
      <div className="admin-table-header">
        <div>
          <h1>Owner Profiles</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: 4 }}>{records.length} registered owners</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/admin/owners/new')}>
          <UserPlus size={16} /> Add New Owner
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="owner-search"
          placeholder="Search by name, email, or site #…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="admin-filters">
          {properties.map(p => (
            <button key={p} className={`filter-btn ${propFilter === p ? 'active' : ''}`} onClick={() => setPropFilter(p)}>{p}</button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulk-email-bar">
          <span>{selected.size} owner{selected.size !== 1 ? 's' : ''} selected</span>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }} onClick={openBulkEmail}>
            <Mail size={15} /> Email Selected (BCC)
          </button>
          <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No owner profiles found.</p></div>
      ) : (
        <div className="owners-table">
          <div className="owners-table-head">
            <div className="owners-col-check">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
            </div>
            <div className="owners-col-name">Owner</div>
            <div className="owners-col-property">Property / Site</div>
            <div className="owners-col-contact">Contact</div>
            <div className="owners-col-bgcheck">BG Check</div>
            <div className="owners-col-actions">Actions</div>
          </div>
          {filtered.map(r => {
            const f = r.fields
            const isSelected = selected.has(r.id)
            return (
              <div key={r.id} className={`owners-table-row ${isSelected ? 'selected' : ''}`}>
                <div className="owners-col-check">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(r.id)} />
                </div>
                <div className="owners-col-name">
                  <div className="owner-name">{f['First Name']} {f['Last Name']}</div>
                  {(f['Co-Owner First Name'] || f['Co-Owner Last Name']) && (
                    <div className="owner-coowner">& {f['Co-Owner First Name']} {f['Co-Owner Last Name']}</div>
                  )}
                </div>
                <div className="owners-col-property">
                  <div className="owner-property">{f['Property']}</div>
                  <div className="owner-site">Site #{f['Site Number']}</div>
                </div>
                <div className="owners-col-contact">
                  <div>{f['Email']}</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{f['Phone']}</div>
                </div>
                <div className="owners-col-bgcheck">
                  {f['Background Check Complete'] ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 600, fontSize: '0.82rem' }}>
                      <CheckCircle size={15} /> Complete
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-light)', fontSize: '0.82rem' }}>
                      <XCircle size={15} /> Pending
                    </span>
                  )}
                </div>
                <div className="owners-col-actions">
                  <button className="owner-email-btn" onClick={() => openSingleEmail(r)} title="Send email">
                    <Mail size={15} /> Email
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
