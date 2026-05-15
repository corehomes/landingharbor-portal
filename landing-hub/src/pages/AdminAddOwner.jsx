import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Save, CheckCircle, Mail } from 'lucide-react'
import './FormPage.css'

const STATES = ['AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']

const RESERVATION_PORTAL_URL = 'https://ownerportal12.rmscloud.com/Login/Index?clientId=10371'
const OWNER_PORTAL_URL = 'https://cottageownermanager.netlify.app'

export default function AdminAddOwner() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', property: '', siteNumber: '',
    coOwnerFirstName: '', coOwnerLastName: '', coOwnerPhone: '', coOwnerEmail: '',
    mailingAddress: '', city: '', state: '', zip: '',
    emergencyName: '', emergencyPhone: '',
    unitMake: '', unitModel: '', unitYear: '', serialVin: '',
    password: '',
    reservationUsername: '', reservationPassword: '',
    backgroundCheckComplete: false,
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getProperties().then(({ records }) => setProperties(records || [])).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getPropertyManager = () => {
    const prop = properties.find(r => r.fields['Property Name'] === form.property)
    return prop ? {
      name: prop.fields['Property Manager Name'] || '',
      email: prop.fields['Property Manager Email'] || ''
    } : { name: '', email: '' }
  }

  const buildWelcomeEmail = () => {
    const pm = getPropertyManager()
    const nameGreeting = form.coOwnerFirstName
      ? `${form.firstName} & ${form.coOwnerFirstName}`
      : form.firstName || 'New Owner'
    const propertyName = form.property || '[Property]'

    // Note: mailto body cannot include HTML, so we use plain text
    // The signature note tells Outlook to append their saved signature
    return `Dear ${nameGreeting},

It is with great excitement that I officially welcome you to the ELS family as a new cottage owner at ${propertyName}!

Cottage ownership has brought our owners such joy and has allowed us to create such a wonderful community, and we are so grateful you have made the decision to join us.

You should have received copies of your official Bill of Sale and Invoice for your records. A Certificate of Origin will be mailed to you, and I will forward the tracking information as soon as it is available. Once you receive the certificate, you will need it along with your Bill of Sale, Invoice (showing that sales tax has been paid), and your ID at your local title office to register your unit.

If you have not already done so, please obtain insurance on your unit as soon as possible and add ${propertyName} as an additional insured on the policy. Please email a copy of your declaration page to jen_lacour@equitylifestyle.com once you have secured the policy.

For questions regarding your visits to the property, amenities, or day-to-day matters, please reach out to ${pm.name || '[Property Manager]'}, our property manager at ${propertyName}. ${pm.name ? pm.name.split(' ')[0] : 'They'} and the team are always happy to help — please make sure to let them know when you plan to be on the property so they can provide current access codes and ensure your vehicle is recognized at the site.

You have access to two online portals:

RESERVATION PORTAL (for booking and scheduling your visits):
${RESERVATION_PORTAL_URL}
Username: ${form.reservationUsername || form.email}
Password: ${form.reservationPassword || '[see below]'}

OWNER MANAGEMENT PORTAL (for managing your profile, warranty requests, site improvement requests, and insurance information):
${OWNER_PORTAL_URL}
Username: ${form.email}
Password: ${form.password || '[see below]'}

Inside the Owner Management Portal you can:
  - Update your contact information and unit details
  - Submit and track warranty requests
  - Submit site improvement requests for approval
  - Keep your insurance information current

Thank you again for the opportunity to work with you, and welcome to the ELS Family!`
  }

  const openWelcomeEmail = () => {
    const pm = getPropertyManager()
    const to = encodeURIComponent(form.email)
    const cc = pm.email ? encodeURIComponent(pm.email) : ''
    const subject = encodeURIComponent(`Welcome to ${form.property || 'Your New Community'} — ELS Owner Portal`)
    // Encode body — mailto will open Outlook which will append user's default signature
    const body = encodeURIComponent(buildWelcomeEmail())
    const ccParam = cc ? `&cc=${cc}` : ''
    window.location.href = `mailto:${to}?subject=${subject}${ccParam}&body=${body}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveProfile({ email: form.email, ...form })
      await api.createUser({
        email: form.email,
        name: `${form.firstName} ${form.lastName}`.trim(),
        password: form.password,
        role: 'owner',
        property: form.property,
        siteNumber: form.siteNumber
      })
      setSuccess(true)
      setTimeout(() => openWelcomeEmail(), 600)
    } catch (err) {
      setError('Failed to save owner. Please try again.')
    }
    setSaving(false)
  }

  const propertyNames = properties.map(r => r.fields['Property Name']).filter(Boolean)

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>Add New Owner</h1>
        <p>Create a new owner account. A welcome email will automatically open in Outlook upon saving.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-sections">
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> Owner created! Welcome email is opening in Outlook.{' '}
            <button type="button" onClick={openWelcomeEmail} style={{ background: 'none', border: 'none', color: 'var(--pine)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              Resend email
            </button>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section card">
          <h2>Owner Information</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>First Name</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" />
            </div>
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@email.com" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label>Property</label>
              <select value={form.property} onChange={e => set('property', e.target.value)}>
                <option value="">Select property…</option>
                {propertyNames.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Site #</label>
              <input value={form.siteNumber} onChange={e => set('siteNumber', e.target.value)} placeholder="e.g. 42" />
            </div>
          </div>
          {form.property && (() => {
            const pm = getPropertyManager()
            return pm.name ? (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#e8f5e9', borderRadius: 6, fontSize: '0.85rem', color: 'var(--pine)' }}>
                📋 Property Manager: <strong>{pm.name}</strong> — {pm.email}
              </div>
            ) : null
          })()}
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
          <h2>Portal Access</h2>
          <div className="form-grid-2">
            <div className="form-group form-col-2">
              <label>Owner Portal Password <span className="required">*</span></label>
              <input value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set a password for this owner" required />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>This is the password the owner will use to log into this portal.</p>
            </div>
            <div className="form-group">
              <label>Reservation Portal Username</label>
              <input value={form.reservationUsername} onChange={e => set('reservationUsername', e.target.value)} placeholder="Usually owner's email" />
            </div>
            <div className="form-group">
              <label>Reservation Portal Password</label>
              <input value={form.reservationPassword} onChange={e => set('reservationPassword', e.target.value)} placeholder="Reservation portal password" />
            </div>
          </div>
        </div>

        <div className="form-section card">
          <h2>Background Check</h2>
          <div className="ack-box" style={{ background: form.backgroundCheckComplete ? '#e8f5e9' : '#fff8e1', borderColor: form.backgroundCheckComplete ? '#a5d6a7' : '#ffe082' }}>
            <label>
              <input type="checkbox" checked={form.backgroundCheckComplete} onChange={e => set('backgroundCheckComplete', e.target.checked)} />
              Background check has been completed for this owner
            </label>
          </div>
        </div>

        <div className="form-section card">
          <h2>Additional Notes</h2>
          <div className="form-group">
            <label>Internal Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes about this owner…" rows={3} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/owners')}>Cancel</button>
          <button type="button" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={openWelcomeEmail}>
            <Mail size={15} /> Preview Email
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Create Owner & Send Welcome Email'}
          </button>
        </div>
      </form>
    </div>
  )
}
