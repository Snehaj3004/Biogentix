import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Dna, Eye, EyeOff, Loader } from 'lucide-react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    await login(email, password)
    navigate('/')
  } catch (err) {
    console.error('Login error:', err)
    const msg = err.response?.data?.detail || 
                err.message || 
                'Login failed - check console'
    setError(msg)
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dna className="text-brand-cyan" size={36} />
            <span className="text-3xl font-bold">
              <span className="text-white">Bio</span>
              <span className="text-brand-cyan">Qentix</span>
              <span className="text-brand-cyan text-lg">™</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Multi-AI Engine Diagnosis & Screening Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border
                            border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@biogentix.com"
                required
                className="w-full bg-dark-700 border border-white/10 rounded-lg
                           px-4 py-3 text-white placeholder-slate-600 text-sm
                           focus:outline-none focus:border-brand-cyan/50
                           focus:ring-1 focus:ring-brand-cyan/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-dark-700 border border-white/10 rounded-lg
                             px-4 py-3 pr-10 text-white placeholder-slate-600
                             text-sm focus:outline-none focus:border-brand-cyan/50
                             focus:ring-1 focus:ring-brand-cyan/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-3.5 text-slate-500
                             hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand-cyan text-dark-900
                         font-semibold text-sm hover:bg-brand-cyan/90
                         disabled:opacity-50 transition-all flex items-center
                         justify-center gap-2"
            >
              {loading
                ? <><Loader size={16} className="animate-spin"/> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          BioQentix™ AI Private Limited · Secure Medical Platform
        </p>
      </div>
    </div>
  )
}