import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { Wrench, Hammer, ShieldCheck, User, ArrowRight } from 'lucide-react'
import './Dashboard.css'

const PROPERTIES = {
  'Live Oak Landing': '🌳',
  'Pigeon Forge Landing': '⛰️',
  "Catherine's Landing": '🌊',
  'Gulf Shores': '🏖️',
  'Sandusky': '⚓'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [warrantyCount, setWarrantyCount] = useState(0)
  const [improvementCount, setImprovementCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pData, wData, iData] = await Promise.all([
          api.getProfile(user.email),
          api.getWarranty(user.email),
          api.getImprovement(user.email)
        ])
        setProfile(pData.profile)
        setWarrantyCount(wData.records?.length || 0)
        setImprovementCount(iData.records?.length || 0)
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.email])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const propEmoji = PROPERTIES[profile?.['Property'] || user?.property] || '🏡'

  const cards = [
    {
      icon: User,
      title: 'My Profile & Unit',
      desc: 'Update contact info, unit details, and emergency contacts',
      to: '/profile',
      color: '#e8f5e9',
      accent: '#1a3a2a'
    },
    {
      icon: Wrench,
      title: 'Warranty Request',
      desc: 'Submit and track warranty issues for your cottage',
      to: '/warranty',
      color: '#fff8e1',
      accent: '#8b6914',
      count: warrantyCount,
      countLabel: 'requests'
    },
    {
      icon: Hammer,
      title: 'Site Improvement',
      desc: 'Request approval for exterior improvements or modifications',
      to: '/improvement',
      color: '#e3f2fd',
      accent: '#1565c0',
      count: improvementCount,
      countLabel: 'requests'
    },
    {
      icon: ShieldCheck,
      title: 'Insurance',
      desc: 'Keep your insurance information and document link current',
      to: '/insurance',
      color: '#fce4ec',
      accent: '#880e4f'
    }
  ]

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading your portal…</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="dashboard-greeting">{greeting()},</p>
          <h1 className="dashboard-name">{user.name?.split(' ')[0]} {propEmoji}</h1>
          <div className="dashboard-meta">
            {profile?.['Property'] && <span className="meta-chip">{profile['Property']}</span>}
            {profile?.['Site Number'] && <span className="meta-chip">Site #{profile['Site Number']}</span>}
          </div>
        </div>

      </div>

      {!profile && (
        <div className="dashboard-banner">
          <p>👋 Welcome! Your profile isn't set up yet. Complete it so management can reach you.</p>
          <button className="btn-gold" onClick={() => navigate('/profile')}>Set Up Profile →</button>
        </div>
      )}

      <div className="dashboard-grid">
        {cards.map(({ icon: Icon, title, desc, to, color, accent, count, countLabel }) => (
          <button key={to} className="dash-card" onClick={() => navigate(to)} style={{ '--card-bg': color, '--card-accent': accent }}>
            <div className="dash-card-icon">
              <Icon size={28} color={accent} />
            </div>
            <div className="dash-card-content">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            {count !== undefined && (
              <div className="dash-card-count">
                <span>{count}</span>
                <small>{countLabel}</small>
              </div>
            )}
            <ArrowRight size={20} className="dash-card-arrow" />
          </button>
        ))}
      </div>
    </div>
  )
}
