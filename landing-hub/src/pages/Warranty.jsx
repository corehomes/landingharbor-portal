import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Send, CheckCircle, AlertTriangle, Mail } from 'lucide-react'
import './FormPage.css'

const PROPERTIES = ['Live Oak Landing', 'Pigeon Forge Landing', "Catherine's Landing", 'Gulf Shores']

export default function Warranty() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', property: '', siteNumber: '',
    serialVin: '', issueDescription: ''
  })
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [profile, history] = await Promise.all([
          api.getProfile(user.email),
          api.getWarranty(user.email)
        ])
        if (profile.profile) {
          setForm(f => ({
            ...f,
            firstName: profile.profile['First Name'] || '',
            lastName: profile.profile['Last Name'] || '',
            phone: profile.profile['Phone'] || '',
            property: profile.profile['Property'] || '',
            siteNumber: profile.profile['Site Number'] || '',
            serialVin: profile.profile['Serial / VIN'] || '',
          }))
        }
        setSubmissions(history.records || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.email])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.submitWarranty({ email: user.email, ...form })
      setSuccess(true)
      setForm(f => ({ ...f, issueDescription: '' }))
      const history = await api.getWarranty(user.email)
      setSubmissions(history.records || [])
      setTimeout(() => setSuccess(false), 6000)
    } catch {
      setError('Submission failed. Please try again.')
    }
    setSubmitting(false)
  }

  const statusBadge = (status) => {
    const map = {
      'Submitted': 'badge-submitted',
      'Under Review': 'badge-review',
      'Resolved': 'badge-approved',
      'Denied': 'badge-denied',
    }
    return `badge ${map[status] || 'badge-pending'}`
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>Warranty Request</h1>
        <p>Submit warranty issues for your cottage. Be as detailed as possible, including specific locations.</p>
      </div>

      <div className="form-notice" style={{ marginBottom: 20 }}>
        <Mail size={18} />
        <span><strong>Important:</strong> After submitting, please email any supporting photos to <strong>jlacour@rvcoutdoors.com</strong>. Reference your site number in the subject line.</span>
      </div>

      <form onSubmit={handleSubmit} className="form-sections">
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> Warranty request submitted! Don't forget to email photos to jlacour@rvcoutdoors.com.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section card">
          <h2>Section 1 — Your Information</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label>Phone <span className="required">*</span></label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" required />
            </div>
            <div className="form-group">
              <label>Property <span className="required">*</span></label>
              <select value={form.property} onChange={e => set('property', e.target.value)} required>
                <option value="">Select property…</option>
                {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Site # <span className="required">*</span></label>
              <input value={form.siteNumber} onChange={e => set('siteNumber', e.target.value)} required />
            </div>
            <div className="form-group form-col-2">
              <label>Serial / VIN # <span className="required">*</span></label>
              <input value={form.serialVin} onChange={e => set('serialVin', e.target.value)} placeholder="Unit serial or VIN number" required />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Section 2 — Issue Description</h2>
          <div className="form-group">
            <label>Describe Issues <span className="required">*</span></label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 8 }}>
              Please number each issue separately and be as detailed as possible, including the specific location within the unit.
            </p>
            <textarea
              value={form.issueDescription}
              onChange={e => set('issueDescription', e.target.value)}
              placeholder={"1. Master bedroom - crack in ceiling near window (approximately 8 inches long)\n2. Kitchen - faucet dripping from base when turned on\n3. Front deck - loose board, third from top step"}
              rows={8}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Send size={16} /> {submitting ? 'Submitting…' : 'Submit Warranty Request'}
          </button>
        </div>
      </form>

      {submissions.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--pine)', marginBottom: 16, fontSize: '1.3rem' }}>
            Your Past Requests
          </h2>
          <div className="submissions-list">
            {submissions.map(r => (
              <div key={r.id} className="submission-card">
                <div className="submission-card-header">
                  <h4>Submitted {r.fields['Submission Date']}</h4>
                  <span className={statusBadge(r.fields['Status'])}>{r.fields['Status'] || 'Submitted'}</span>
                </div>
                <p><strong>Site:</strong> {r.fields['Property']} — #{r.fields['Site Number']}</p>
                <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {r.fields['Issue Description']?.substring(0, 240)}{r.fields['Issue Description']?.length > 240 ? '…' : ''}
                </p>
                {r.fields['Admin Notes'] && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0f7f2', borderRadius: 6, fontSize: '0.85rem' }}>
                    <strong>Management Note:</strong> {r.fields['Admin Notes']}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
