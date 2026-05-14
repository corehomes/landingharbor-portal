import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Save, CheckCircle } from 'lucide-react'
import './FormPage.css'

const PROPERTIES = ['Live Oak Landing', 'Pigeon Forge Landing', "Catherine's Landing", 'Gulf Shores', 'Sandusky']
const STATES = ['AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', property: '', siteNumber: '',
    mailingAddress: '', city: '', state: '', zip: '',
    emergencyName: '', emergencyPhone: '',
    unitMake: '', unitModel: '', unitYear: '', serialVin: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getProfile(user.email).then(({ profile }) => {
      if (profile) {
        setForm({
          firstName: profile['First Name'] || '',
          lastName: profile['Last Name'] || '',
          phone: profile['Phone'] || '',
          property: profile['Property'] || '',
          siteNumber: profile['Site Number'] || '',
          mailingAddress: profile['Mailing Address'] || '',
          city: profile['City'] || '',
          state: profile['State'] || '',
          zip: profile['ZIP'] || '',
          emergencyName: profile['Emergency Contact Name'] || '',
          emergencyPhone: profile['Emergency Contact Phone'] || '',
          unitMake: profile['Unit Make'] || '',
          unitModel: profile['Unit Model'] || '',
          unitYear: profile['Unit Year'] ? String(profile['Unit Year']) : '',
          serialVin: profile['Serial / VIN'] || '',
          notes: profile['Notes'] || ''
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
      await api.saveProfile({ email: user.email, ...form })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading your profile…</p></div>

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>My Profile & Unit</h1>
        <p>Keep your contact and unit information up to date so management can reach you.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-sections">
        {success && <div className="alert alert-success"><CheckCircle size={16} /> Profile saved successfully!</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section card">
          <h2>Contact Information</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" required />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
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
              <input value={form.siteNumber} onChange={e => set('siteNumber', e.target.value)} placeholder="e.g. 42" required />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Mailing Address</h2>
          <div className="form-grid-2">
            <div className="form-group form-col-2">
              <label>Street Address</label>
              <input value={form.mailingAddress} onChange={e => set('mailingAddress', e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Nashville" />
            </div>
            <div className="form-group">
              <label>State</label>
              <select value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select…</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="37201" maxLength={10} />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Emergency Contact</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Contact Name</label>
              <input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Unit / Cottage Details</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Unit Make</label>
              <input value={form.unitMake} onChange={e => set('unitMake', e.target.value)} placeholder="e.g. Cavco" />
            </div>
            <div className="form-group">
              <label>Unit Model</label>
              <input value={form.unitModel} onChange={e => set('unitModel', e.target.value)} placeholder="e.g. Park Model 52" />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.unitYear} onChange={e => set('unitYear', e.target.value)} placeholder="2022" min="1990" max="2030" />
            </div>
            <div className="form-group">
              <label>Serial / VIN #</label>
              <input value={form.serialVin} onChange={e => set('serialVin', e.target.value)} placeholder="VIN or serial number" />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Additional Notes</h2>
          <div className="form-group">
            <label>Notes for Management</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional information management should know…" rows={4} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
