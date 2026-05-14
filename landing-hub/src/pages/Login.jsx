import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await api.login(email, password)
      login(user)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-trees" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🌲</div>
            <h1>LandingHarbor</h1>
            <p>Community Owner Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required">*</span></label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Need access? Contact your property manager.</p>
            <p>Questions? Email <a href="mailto:jlacour@rvcoutdoors.com">jlacour@rvcoutdoors.com</a></p>
          </div>
        </div>

        <div className="login-tagline">
          <h2>Your home away from home,<br />managed from one place.</h2>
          <div className="login-features">
            <span>🏡 Unit & Profile</span>
            <span>🔧 Warranty Requests</span>
            <span>🏗️ Site Improvements</span>
            <span>🛡️ Insurance Records</span>
          </div>
        </div>
      </div>
    </div>
  )
}
