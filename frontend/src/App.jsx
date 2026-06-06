import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Screening from './pages/Screening'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import About from './pages/About'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-brand-cyan animate-pulse text-lg">
        Loading BioQentix...
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      }/>
      <Route path="/screening" element={
        <ProtectedRoute><Screening /></ProtectedRoute>
      }/>
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/history" element={
        <ProtectedRoute><History /></ProtectedRoute>
      }/>
      <Route path="/about" element={
        <ProtectedRoute><About /></ProtectedRoute>
      }/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}