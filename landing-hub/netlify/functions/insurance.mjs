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
      const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?fields[]=First Name&fields[]=Last Name&fields[]=Email&fields[]=Property&fields[]=Site Number&fields[]=Insurance Provider&fields[]=Insurance Policy Number&fields[]=Insurance Doc Link&fields[]=Insurance Expiration&sort[0][field]=Last Name`
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
    return new Response(JSON.stringify({
      insurance: record ? {
        provider: record.fields['Insurance Provider'],
        policyNumber: record.fields['Insurance Policy Number'],
        expiration: record.fields['Insurance Expiration']
        // docLink intentionally omitted from owner-facing response
      } : null,
      id: record?.id
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { email, provider, policyNumber, expiration, docLink } = body

    const existing = await getByEmail(email)
    const record = existing.records?.[0]

    const fieldsToUpdate = {
      'Email': email.toLowerCase(),
      'Insurance Provider': provider,
      'Insurance Policy Number': policyNumber,
      'Insurance Expiration': expiration,
      'Last Updated': new Date().toISOString().split('T')[0]
    }
    // Only update doc link if provided (admin only)
    if (docLink !== undefined) fieldsToUpdate['Insurance Doc Link'] = docLink

    const payload = { fields: fieldsToUpdate }

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

export const config = { path: '/api/insurance' }
