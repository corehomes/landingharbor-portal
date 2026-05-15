import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Nav from './components/Nav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Warranty from './pages/Warranty'
import Improvement from './pages/Improvement'
import Insurance from './pages/Insurance'
import AdminDashboard from './pages/AdminDashboard'
import AdminWarranty from './pages/AdminWarranty'
import AdminImprovement from './pages/AdminImprovement'
import AdminInsurance from './pages/AdminInsurance'
import AdminOwners from './pages/AdminOwners'
import AdminAddOwner from './pages/AdminAddOwner'

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Owner routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <AppLayout><Profile /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/warranty" element={
            <PrivateRoute>
              <AppLayout><Warranty /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/improvement" element={
            <PrivateRoute>
              <AppLayout><Improvement /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/insurance" element={
            <PrivateRoute>
              <AppLayout><Insurance /></AppLayout>
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/warranty" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminWarranty /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/improvement" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminImprovement /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/insurance" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminInsurance /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/owners" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminOwners /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/owners/new" element={
            <PrivateRoute adminOnly>
              <AppLayout><AdminAddOwner /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
