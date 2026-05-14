const BASE = '/api'

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (email, password) =>
    call('/auth', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Owner Profile
  getProfile: (email) => call(`/profile?email=${encodeURIComponent(email)}`),
  saveProfile: (data) => call('/profile', { method: 'POST', body: JSON.stringify(data) }),

  // Warranty Requests
  getWarranty: (email) => call(`/warranty?email=${encodeURIComponent(email)}`),
  submitWarranty: (data) => call('/warranty', { method: 'POST', body: JSON.stringify(data) }),
  getAllWarranty: () => call('/warranty?all=true'),
  updateWarrantyStatus: (id, status, notes) =>
    call('/warranty', { method: 'PATCH', body: JSON.stringify({ id, status, notes }) }),

  // Site Improvement Requests
  getImprovement: (email) => call(`/improvement?email=${encodeURIComponent(email)}`),
  submitImprovement: (data) => call('/improvement', { method: 'POST', body: JSON.stringify(data) }),
  getAllImprovement: () => call('/improvement?all=true'),
  updateImprovementStatus: (id, status, notes) =>
    call('/improvement', { method: 'PATCH', body: JSON.stringify({ id, status, notes }) }),

  // Insurance
  getInsurance: (email) => call(`/insurance?email=${encodeURIComponent(email)}`),
  saveInsurance: (data) => call('/insurance', { method: 'POST', body: JSON.stringify(data) }),
  getAllInsurance: () => call('/insurance?all=true'),
}
