import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function useProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProperties()
      .then(({ records }) => {
        setProperties(records.map(r => r.fields['Property Name']).filter(Boolean))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { properties, loading }
}
