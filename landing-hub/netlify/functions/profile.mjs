const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE = 'Owner Profiles'

const headers = {
  'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
}

async function getByEmail(email) {
  const formula = `LOWER({Email})="${email.toLowerCase()}"`
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?filterByFormula=${encodeURIComponent(formula)}`
  const res = await fetch(url, { headers })
  return res.json()
}

export default async function handler(req) {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const all = url.searchParams.get('all')

    if (all) {
      const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?sort[0][field]=Last Name`
      const res = await fetch(apiUrl, { headers })
      const data = await res.json()
      return new Response(JSON.stringify({ records: data.records || [] }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      })
    }

    const email = url.searchParams.get('email')
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 })
    const data = await getByEmail(email)
    const record = data.records?.[0]
    return new Response(JSON.stringify({ profile: record ? record.fields : null, id: record?.id }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { email, ...fields } = body

    const existing = await getByEmail(email)
    const record = existing.records?.[0]

    const payload = {
      fields: {
        'Email': email.toLowerCase(),
        'First Name': fields.firstName,
        'Last Name': fields.lastName,
        'Phone': fields.phone,
        'Property': fields.property,
        'Site Number': fields.siteNumber,
        'Co-Owner First Name': fields.coOwnerFirstName,
        'Co-Owner Last Name': fields.coOwnerLastName,
        'Co-Owner Phone': fields.coOwnerPhone,
        'Co-Owner Email': fields.coOwnerEmail,
        'Children': fields.children,
        'Mailing Address': fields.mailingAddress,
        'City': fields.city,
        'State': fields.state,
        'ZIP': fields.zip,
        'Emergency Contact Name': fields.emergencyName,
        'Emergency Contact Phone': fields.emergencyPhone,
        'Unit Make': fields.unitMake,
        'Unit Model': fields.unitModel,
        'Unit Year': fields.unitYear ? parseInt(fields.unitYear) : null,
        'Serial / VIN': fields.serialVin,
        'Background Check Complete': fields.backgroundCheckComplete || false,
        'Reservation Username': fields.reservationUsername,
        'Reservation Password': fields.reservationPassword,
        'Notes': fields.notes,
        'Last Updated': new Date().toISOString().split('T')[0]
      }
    }

    // Remove null/undefined fields
    Object.keys(payload.fields).forEach(k => {
      if (payload.fields[k] === undefined || payload.fields[k] === null || payload.fields[k] === '') {
        delete payload.fields[k]
      }
    })

    let res
    if (record) {
      res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${record.id}`, {
        method: 'PATCH', headers, body: JSON.stringify(payload)
      })
    } else {
      res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`, {
        method: 'POST', headers, body: JSON.stringify(payload)
      })
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, record: data }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export const config = { path: '/api/profile' }
