const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE = 'Properties'

const headers = {
  'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
}

export default async function handler(req) {
  if (req.method === 'GET') {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?sort[0][field]=Property Name`
    const res = await fetch(url, { headers })
    const data = await res.json()
    return new Response(JSON.stringify({ records: data.records || [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export const config = { path: '/api/properties' }
