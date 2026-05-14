const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID

async function airtableGet(table, formula) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
  })
  return res.json()
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 })
  }

  const formula = `AND({Email}="${email.toLowerCase()}", {Password}="${password}")`
  const data = await airtableGet('Users', formula)

  if (!data.records || data.records.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 })
  }

  const record = data.records[0]
  const user = {
    id: record.id,
    email: record.fields['Email'],
    name: record.fields['Name'],
    role: record.fields['Role'] || 'owner',
    property: record.fields['Property'],
    siteNumber: record.fields['Site Number']
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = { path: '/api/auth' }
