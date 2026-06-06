import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, Activity, LayoutDashboard,
  History, Info, LogOut, Dna
} from 'lucide-react'
import API from '../api/axios'

const navItems = [
  { path:'/',          icon:Home,           label:'Home'              },
  { path:'/screening', icon:Activity,        label:'Symptom Screening' },
  { path:'/dashboard', icon:LayoutDashboard, label:'Disease Dashboard' },
  { path:'/history',   icon:History,         label:'Screening History' },
  { path:'/about',     icon:Info,            label:'About Platform'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      API.get('/api/dashboard/stats')
        .then(r => setStats(r.data))
        .catch(() => {})
    }
  }, [user])

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-dark-800
                    border-r border-white/5 flex flex-col z-50">

      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Dna className="text-brand-cyan" size={28} />
          <span className="text-xl font-bold">
            <span className="text-white">Bio</span>
            <span className="text-brand-cyan">Qentix</span>
            <span className="text-brand-cyan text-sm">™</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 tracking-widest uppercase ml-9">
          Multi-AI Diagnostic Platform
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm
               transition-all duration-200 ${isActive
                ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }>
            {({ isActive }) => (<>
              <span className="w-2 h-2 rounded-full border-2 flex-shrink-0"
                style={{
                  borderColor: isActive ? '#00d4ff' : '#475569',
                  background:  isActive ? '#00d4ff' : 'transparent'
                }}/>
              <Icon size={16} />
              {label}
            </>)}
          </NavLink>
        ))}
      </nav>

      {/* Live Platform Stats */}
      <div className="p-4 mx-4 mb-4 rounded-lg bg-dark-700 border border-white/5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
          Platform Statistics
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Total Screened', value: stats?.total_screenings ?? '—' },
            { label:'High Risk',      value: stats?.high_risk_cases   ?? '—' },
            { label:'Diseases',       value: stats?.diseases_monitored ?? 8  },
            { label:'Districts',      value: stats?.districts_covered  ?? 6  },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-brand-cyan capitalize">
                {user.role}
              </p>
            </div>
            <button onClick={logout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400
                         hover:text-red-400 transition-colors flex-shrink-0"
              title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center">Not logged in</p>
        )}
      </div>
    </div>
  )
}