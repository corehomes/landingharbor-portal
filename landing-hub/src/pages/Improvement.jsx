import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Send, CheckCircle, Mail, AlertTriangle } from 'lucide-react'
import './FormPage.css'

const PROPERTIES = ['Live Oak Landing', 'Pigeon Forge Landing', "Catherine's Landing", 'Gulf Shores', 'Sandusky']
const IMPROVEMENT_TYPES = [
  'Exterior Paint/Finish',
  'Deck or Porch Addition',
  'Landscaping/Hardscaping',
  'Structural Modification',
  'Utility Connection',
  'Accessory Structure (shed, parking, etc)',
  'Other'
]

export default function Improvement() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    lastName: '', property: '', siteNumber: '', phone: '',
    improvementTypes: [],
    description: '', materials: '', startDate: '',
    contractorType: '',
    contractorCompany: '', contractorPhone: '', contractorEmail: '',
    diyAck: false,
    signature: '', submissionDate: ''
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
          api.getImprovement(user.email)
        ])
        if (profile.profile) {
          setForm(f => ({
            ...f,
            lastName: profile.profile['Last Name'] || '',
            property: profile.profile['Property'] || '',
            siteNumber: profile.profile['Site Number'] || '',
            phone: profile.profile['Phone'] || '',
            submissionDate: new Date().toLocaleDateString('en-US')
          }))
        }
        setSubmissions(history.records || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.email])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      improvementTypes: f.improvementTypes.includes(type)
        ? f.improvementTypes.filter(t => t !== type)
        : [...f.improvementTypes, type]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.improvementTypes.length === 0) {
      setError('Please select at least one type of improvement.')
      return
    }
    if (!form.signature.trim()) {
      setError('Please type your full name as a signature to acknowledge.')
      return
    }
    if (form.contractorType === "I will do the work myself (requires Release of Liability)" && !form.diyAck) {
      setError('Please acknowledge the DIY liability requirement.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.submitImprovement({ email: user.email, ...form })
      setSuccess(true)
      setForm(f => ({
        ...f,
        improvementTypes: [],
        description: '', materials: '', startDate: '',
        contractorType: '', contractorCompany: '', contractorPhone: '', contractorEmail: '',
        diyAck: false, signature: ''
      }))
      const history = await api.getImprovement(user.email)
      setSubmissions(history.records || [])
      setTimeout(() => setSuccess(false), 6000)
    } catch {
      setError('Submission failed. Please try again.')
    }
    setSubmitting(false)
  }

  const statusBadge = (status) => {
    const map = {
      'Pending Review': 'badge-pending',
      'Under PM Review': 'badge-review',
      'Under President Review': 'badge-review',
      'Approved': 'badge-approved',
      'Denied': 'badge-denied',
    }
    return `badge ${map[status] || 'badge-pending'}`
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>Cottage / Site Improvement Request</h1>
        <p>All proposed improvements to the exterior of your home or property must be reviewed and approved by management before any work begins.</p>
      </div>

      <div className="form-notice" style={{ marginBottom: 20 }}>
        <Mail size={18} />
        <span><strong>Required:</strong> After submitting, email all plans/drawings and contractor documentation to <strong>jlacour@rvcoutdoors.com</strong>. <em>Review will not begin without this documentation.</em></span>
      </div>

      <form onSubmit={handleSubmit} className="form-sections">
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> Request submitted! You'll receive email updates as it moves through review. Remember to email your documentation.
          </div>
        )}
        {error && <div className="alert alert-error"><AlertTriangle size={16} /> {error}</div>}

        {/* Section 1 */}
        <div className="form-section card">
          <h2>Section 1 — Owner Information</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input value={user.email} disabled style={{ opacity: 0.6 }} />
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
              <label>Phone <span className="required">*</span></label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" required />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="form-section card">
          <h2>Section 2 — Improvement Details</h2>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Type of Improvement <span className="required">*</span></label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 10 }}>Check all that apply</p>
            <div className="checkbox-grid">
              {IMPROVEMENT_TYPES.map(type => (
                <label
                  key={type}
                  className={`checkbox-item ${form.improvementTypes.includes(type) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={form.improvementTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Description of Proposed Work <span className="required">*</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the scope of work in detail…" rows={5} required />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Materials to be Used <span className="required">*</span></label>
            <textarea value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="List all materials (brand, color, specifications where applicable)…" rows={3} required />
          </div>

          <div className="form-group">
            <label>Proposed Start Date <span className="required">*</span></label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
          </div>
        </div>

        {/* Section 3 */}
        <div className="form-section card">
          <h2>Section 3 — Contractor Selection</h2>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Who Will Perform the Work? <span className="required">*</span></label>
            <div className="radio-group">
              {[
                "Community's Approved Contractor",
                "My Own Licensed Contractor",
                "I will do the work myself (requires Release of Liability)"
              ].map(opt => (
                <label key={opt} className={`radio-item ${form.contractorType === opt ? 'selected' : ''}`}>
                  <input type="radio" name="contractorType" value={opt} checked={form.contractorType === opt} onChange={() => set('contractorType', opt)} required />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {form.contractorType && form.contractorType !== "I will do the work myself (requires Release of Liability)" && (
            <div className="form-grid-2">
              <div className="form-group form-col-2">
                <label>Contractor Company Name <span className="required">*</span></label>
                <input value={form.contractorCompany} onChange={e => set('contractorCompany', e.target.value)} required={form.contractorType !== "I will do the work myself (requires Release of Liability)"} />
              </div>
              <div className="form-group">
                <label>Contractor Phone <span className="required">*</span></label>
                <input value={form.contractorPhone} onChange={e => set('contractorPhone', e.target.value)} required={form.contractorType !== "I will do the work myself (requires Release of Liability)"} />
              </div>
              <div className="form-group">
                <label>Contractor Email</label>
                <input type="email" value={form.contractorEmail} onChange={e => set('contractorEmail', e.target.value)} />
              </div>
            </div>
          )}

          {form.contractorType === "I will do the work myself (requires Release of Liability)" && (
            <div className="ack-box">
              <label>
                <input type="checkbox" checked={form.diyAck} onChange={e => set('diyAck', e.target.checked)} required />
                I understand that by choosing to perform work myself, I am required to sign a Release of Liability with management before any work begins. I acknowledge this and agree to complete that process prior to starting.
              </label>
            </div>
          )}
        </div>

        {/* Section 4 */}
        <div className="form-section card">
          <h2>Section 4 — Owner Acknowledgement</h2>
          <div className="form-notice" style={{ marginBottom: 16 }}>
            <AlertTriangle size={16} />
            <span>No work may begin until you receive a written approval confirmation from both the property manager and the president. Any unauthorized work may be required to be removed at your expense.</span>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Full Name (Electronic Signature) <span className="required">*</span></label>
            <input
              value={form.signature}
              onChange={e => set('signature', e.target.value)}
              placeholder="Type your full legal name to confirm"
              required
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 6 }}>
              By typing your name, you confirm all information is accurate and that no work may begin until written approval is granted.
            </p>
          </div>
          <div className="form-group">
            <label>Date of Submission</label>
            <input value={new Date().toLocaleDateString('en-US')} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Send size={16} /> {submitting ? 'Submitting…' : 'Submit Improvement Request'}
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
                  <span className={statusBadge(r.fields['Approval Status'])}>{r.fields['Approval Status'] || 'Pending'}</span>
                </div>
                <p><strong>Site:</strong> {r.fields['Property']} — #{r.fields['Site Number']}</p>
                <p><strong>Type:</strong> {r.fields['Type of Improvement']}</p>
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
