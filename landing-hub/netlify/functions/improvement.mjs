const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE = 'Site Improvement Requests'

const headers = {
  'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
}

export default async function handler(req) {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const all = url.searchParams.get('all')
    const email = url.searchParams.get('email')

    let apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?sort[0][field]=Submission Date&sort[0][direction]=desc`
    if (!all && email) {
      apiUrl += `&filterByFormula=${encodeURIComponent(`{Email}="${email.toLowerCase()}"`)}`
    }

    const res = await fetch(apiUrl, { headers })
    const data = await res.json()
    return new Response(JSON.stringify({ records: data.records || [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const improvementTypes = Array.isArray(body.improvementTypes) ? body.improvementTypes.join(', ') : body.improvementTypes

    const payload = {
      fields: {
        'Last Name': body.lastName,
        'Email': body.email?.toLowerCase(),
        'Phone': body.phone,
        'Property': body.property,
        'Site Number': body.siteNumber,
        'Type of Improvement': improvementTypes,
        'Description of Work': body.description,
        'Materials': body.materials,
        'Proposed Start Date': body.startDate,
        'Contractor Type': body.contractorType,
        'Contractor Company': body.contractorCompany,
        'Contractor Phone': body.contractorPhone,
        'Contractor Email': body.contractorEmail,
        'DIY Acknowledgement': body.diyAck || false,
        'Owner Signature': body.signature,
        'Submission Date': body.submissionDate || new Date().toISOString().split('T')[0],
        'Approval Status': 'Pending Review',
        'PM Review': 'Pending',
        'President Review': 'Pending'
      }
    }

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`, {
      method: 'POST', headers, body: JSON.stringify(payload)
    })
    const data = await res.json()
    return new Response(JSON.stringify({ success: true, record: data }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  if (req.method === 'PATCH') {
    const body = await req.json()
    const { id, status, notes } = body
    const payload = {
      fields: {
        'Approval Status': status,
        'Admin Notes': notes,
        'Last Updated': new Date().toISOString().split('T')[0]
      }
    }
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify(payload)
    })
    const data = await res.json()
    return new Response(JSON.stringify({ success: true, record: data }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export const config = { path: '/api/improvement' }
