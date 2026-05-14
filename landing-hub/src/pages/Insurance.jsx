import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Save, CheckCircle, ShieldCheck, Mail, ExternalLink } from 'lucide-react'
import './FormPage.css'

export default function Insurance() {
  const { user } = useAuth()
  const [form, setForm] = useState({ provider: '', docLink: '', expiration: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getInsurance(user.email).then(({ insurance }) => {
      if (insurance) {
        setForm({
          provider: insurance.provider || '',
          docLink: insurance.docLink || '',
          expiration: insurance.expiration || ''
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user.email])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveInsurance({ email: user.email, ...form })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading…</p></div>

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>Insurance Information</h1>
        <p>Keep your current insurance documentation on file with management.</p>
      </div>

      <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24, background: '#e8f5e9', border: '1.5px solid #a5d6a7' }}>
        <ShieldCheck size={32} color="var(--pine)" style={{ flexShrink: 0, marginTop: 4 }} />
        <div>
          <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--pine)', marginBottom: 6, fontSize: '1rem' }}>How Insurance Documentation Works</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
            Email a copy of your current insurance certificate to <strong>jlacour@rvcoutdoors.com</strong>. Once management has saved it to your shared drive folder, they will provide you with the document link to store below. Keep your expiration date current so you receive renewal reminders.
          </p>
          <a href="mailto:jlacour@rvcoutdoors.com?subject=Insurance Certificate" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--pine)', fontWeight: 600, fontSize: '0.88rem' }}>
            <Mail size={14} /> Email Insurance Doc
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-sections">
        {success && <div className="alert alert-success"><CheckCircle size={16} /> Insurance information saved!</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section card">
          <h2>Insurance Details</h2>
          <div className="form-grid-2">
            <div className="form-group form-col-2">
              <label>Insurance Provider / Company <span className="required">*</span></label>
              <input
                value={form.provider}
                onChange={e => set('provider', e.target.value)}
                placeholder="e.g. State Farm, Allstate, Progressive"
                required
              />
            </div>

            <div className="form-group form-col-2">
              <label>Document Link (Shared Drive)</label>
              <input
                type="url"
                value={form.docLink}
                onChange={e => set('docLink', e.target.value)}
                placeholder="https://drive.google.com/... (provided by management)"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>
                This link will be provided by management after they receive and file your emailed certificate.
              </p>
            </div>

            {form.docLink && (
              <div className="form-col-2" style={{ marginBottom: 4 }}>
                <a href={form.docLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--pine)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <ExternalLink size={14} /> View Current Document
                </a>
              </div>
            )}

            <div className="form-group">
              <label>Policy Expiration Date <span className="required">*</span></label>
              <input
                type="date"
                value={form.expiration}
                onChange={e => set('expiration', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Insurance Info'}
          </button>
        </div>
      </form>
    </div>
  )
}
