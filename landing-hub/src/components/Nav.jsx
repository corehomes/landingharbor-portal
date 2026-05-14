import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import {
  Home, User, ShieldCheck, Wrench, Hammer, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import './Nav.css'

const ownerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/profile', label: 'My Profile & Unit', icon: User },
  { to: '/warranty', label: 'Warranty Request', icon: Wrench },
  { to: '/improvement', label: 'Site Improvement', icon: Hammer },
  { to: '/insurance', label: 'Insurance', icon: ShieldCheck },
]

const adminLinks = [
  { to: '/admin', label: 'Admin Overview', icon: Home },
  { to: '/admin/warranty', label: 'Warranty Requests', icon: Wrench },
  { to: '/admin/improvement', label: 'Site Improvements', icon: Hammer },
  { to: '/admin/insurance', label: 'Insurance Records', icon: ShieldCheck },
  { to: '/admin/owners', label: 'Owner Profiles', icon: User },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const links = user?.role === 'admin' ? adminLinks : ownerLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}>
          <div className="nav-logo">
            <span className="nav-logo-leaf">🌲</span>
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">LandingHarbor</span>
            <span className="nav-brand-sub">Community Portal</span>
          </div>
        </div>

        <div className="nav-links">
          {links.map(({ to, label, icon: Icon }) => (
            <a
              key={to}
              href={to}
              onClick={e => { e.preventDefault(); navigate(to) }}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{user?.name}</span>
              <span className="nav-user-role">{user?.role === 'admin' ? 'Administrator' : `Site ${user?.siteNumber || ''}`}</span>
            </div>
          </div>
          <button className="nav-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={18} />
          </button>
          <button className="nav-hamburger" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-mobile-menu">
          {links.map(({ to, label, icon: Icon }) => (
            <a
              key={to}
              href={to}
              onClick={e => { e.preventDefault(); navigate(to); setOpen(false) }}
              className={`nav-mobile-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={16} className="mobile-chevron" />
            </a>
          ))}
          <button className="nav-mobile-logout" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}
    </>
  )
}
