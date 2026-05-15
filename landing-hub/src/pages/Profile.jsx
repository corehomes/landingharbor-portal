import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Save, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { useProperties } from '../hooks/useProperties'
import './FormPage.css'

const STATES = ['AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']

export default function Profile() {
  const { user } = useAuth()
  const { properties } = useProperties()
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', property: '', siteNumber: '',
    mailingAddress: '', city: '', state: '', zip: '',
    coOwnerFirstName: '', coOwnerLastName: '', coOwnerPhone: '', coOwnerEmail: '',
    children: [],
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
        let children = []
        try { children = JSON.parse(profile['Children'] || '[]') } catch {}
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
          coOwnerFirstName: profile['Co-Owner First Name'] || '',
          coOwnerLastName: profile['Co-Owner Last Name'] || '',
          coOwnerPhone: profile['Co-Owner Phone'] || '',
          coOwnerEmail: profile['Co-Owner Email'] || '',
          children,
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

  const addChild = () => setForm(f => ({ ...f, children: [...f.children, { name: '', age: '' }] }))
  const removeChild = (i) => setForm(f => ({ ...f, children: f.children.filter((_, idx) => idx !== i) }))
  const setChild = (i, k, v) => setForm(f => ({
    ...f,
    children: f.children.map((c, idx) => idx === i ? { ...c, [k]: v } : c)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveProfile({ email: user.email, ...form, children: JSON.stringify(form.children) })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch {
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
                {properties.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Site # <span className="required">*</span></label>
              <input value={form.siteNumber} onChange={e => set('siteNumber', e.target.value)} placeholder="e.g. 42" required />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Co-Owner Information <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span></h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Co-Owner First Name</label>
              <input value={form.coOwnerFirstName} onChange={e => set('coOwnerFirstName', e.target.value)} placeholder="John" />
            </div>
            <div className="form-group">
              <label>Co-Owner Last Name</label>
              <input value={form.coOwnerLastName} onChange={e => set('coOwnerLastName', e.target.value)} placeholder="Smith" />
            </div>
            <div className="form-group">
              <label>Co-Owner Phone</label>
              <input value={form.coOwnerPhone} onChange={e => set('coOwnerPhone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label>Co-Owner Email</label>
              <input type="email" value={form.coOwnerEmail} onChange={e => set('coOwnerEmail', e.target.value)} placeholder="john@email.com" />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Children <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span></h2>
          {form.children.length === 0 && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', marginBottom: 16 }}>No children added yet.</p>
          )}
          {form.children.map((child, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: 12, marginBottom: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Name</label>
                <input value={child.name} onChange={e => setChild(i, 'name', e.target.value)} placeholder="Child's name" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Age</label>
                <input type="number" value={child.age} onChange={e => setChild(i, 'age', e.target.value)} placeholder="Age" min="0" max="25" />
              </div>
              <button type="button" onClick={() => removeChild(i)} style={{ background: 'none', border: '1.5px solid var(--cream-dark)', borderRadius: 6, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--error)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addChild} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed var(--sage)', borderRadius: 6, padding: '8px 16px', color: 'var(--pine)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            <Plus size={15} /> Add Child
          </button>
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
