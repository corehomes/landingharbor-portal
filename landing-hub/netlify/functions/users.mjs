const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE = 'Users'

const headers = {
  'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
}

export default async function handler(req) {
  if (req.method === 'POST') {
    const body = await req.json()
    const { email, name, password, role, property, siteNumber } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 })
    }

    // Check if user already exists
    const checkUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?filterByFormula=${encodeURIComponent(`LOWER({Email})="${email.toLowerCase()}"`)}`
    const checkRes = await fetch(checkUrl, { headers })
    const checkData = await checkRes.json()

    const payload = {
      fields: {
        'Email': email.toLowerCase(),
        'Name': name,
        'Password': password,
        'Role': role || 'owner',
        'Property': property,
        'Site Number': siteNumber
      }
    }

    let res
    if (checkData.records?.length > 0) {
      // Update existing
      res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${checkData.records[0].id}`, {
        method: 'PATCH', headers, body: JSON.stringify(payload)
      })
    } else {
      // Create new
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

export const config = { path: '/api/users' }
