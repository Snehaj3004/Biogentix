import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  LayoutDashboard, TrendingUp, AlertTriangle,
  MapPin, Activity, RefreshCw
} from 'lucide-react'
import API from '../api/axios'

const RISK_COLORS = {
  minimal: '#10B981',
  low:     '#3B82F6',
  medium:  '#F59E0B',
  high:    '#EF4444',
  critical:'#7C3AED'
}

const PIE_COLORS = ['#10B981','#3B82F6','#F59E0B','#EF4444','#7C3AED']

export default function Dashboard() {
  const [stats,      setStats]      = useState(null)
  const [byDisease,  setByDisease]  = useState([])
  const [riskDist,   setRiskDist]   = useState(null)
  const [distStats,  setDistStats]  = useState([])
  const [trend,      setTrend]      = useState([])
  const [highRisk,   setHighRisk]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('overview')

  const load = async () => {
    setLoading(true)
    try {
      const [s, d, r, ds, t, h] = await Promise.all([
        API.get('/api/dashboard/stats'),
        API.get('/api/dashboard/screenings-by-disease'),
        API.get('/api/dashboard/risk-distribution'),
        API.get('/api/dashboard/district-stats'),
        API.get('/api/dashboard/daily-trend?days=14'),
        API.get('/api/dashboard/recent-high-risk?limit=10'),
      ])
      setStats(s.data)
      setByDisease(d.data)
      setRiskDist(r.data)
      setDistStats(ds.data)
      setTrend(t.data)
      setHighRisk(h.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const riskPieData = riskDist ? [
    { name:'Minimal', value: riskDist.minimal,  pct: riskDist.minimal_pct  },
    { name:'Low',     value: riskDist.low,       pct: riskDist.low_pct      },
    { name:'Medium',  value: riskDist.medium,    pct: riskDist.medium_pct   },
    { name:'High',    value: riskDist.high,       pct: riskDist.high_pct     },
    { name:'Critical',value: riskDist.critical,  pct: riskDist.critical_pct },
  ].filter(d => d.value > 0) : []

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-brand-cyan animate-pulse text-lg">
        Loading dashboard...
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-brand-cyan" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-white">Disease Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Real-time analytics across all 8 disease modules
            </p>
          </div>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     glass text-slate-300 hover:text-white text-sm
                     hover:border-white/20 transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl glass w-fit">
        {['overview','districts','trends','alerts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
                        capitalize transition-all
              ${activeTab === tab
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label:'Total Screenings',  value: stats.total_screenings,
                  icon: Activity,       color:'#00d4ff' },
                { label:'High Risk Cases',   value: stats.high_risk_cases,
                  icon: AlertTriangle,  color:'#EF4444' },
                { label:'Districts Active',  value: stats.districts_covered,
                  icon: MapPin,         color:'#10B981' },
                { label:'Referrals Pending', value: stats.referrals_pending,
                  icon: TrendingUp,     color:'#F97316' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} style={{ color }} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <div className="text-3xl font-bold"
                    style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">

            {/* Bar Chart */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                📊 Screenings by Disease
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byDisease}
                  margin={{ top:5, right:10, left:-20, bottom:5 }}>
                  <XAxis dataKey="disease_code"
                    tick={{ fill:'#64748b', fontSize:10 }}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }}/>
                  <Tooltip contentStyle={{
                    background:'#0f1629', border:'1px solid #1a2540',
                    borderRadius:'8px', color:'#e2e8f0', fontSize:'12px'
                  }}/>
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {byDisease.map((e,i) => (
                      <Cell key={i} fill={e.color_hex} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                🎯 Risk Level Distribution
              </h3>
              {riskPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="45%"
                      innerRadius={55} outerRadius={85}
                      dataKey="value" nameKey="name"
                      label={({name,pct}) =>
                        pct > 5 ? `${pct?.toFixed(0)}%` : ''}
                      labelLine={false}>
                      {riskPieData.map((_,i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Legend formatter={v => (
                      <span style={{color:'#94a3b8',fontSize:'11px'}}>{v}</span>
                    )}/>
                    <Tooltip contentStyle={{
                      background:'#0f1629', border:'1px solid #1a2540',
                      borderRadius:'8px', color:'#e2e8f0', fontSize:'12px'
                    }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48
                                text-slate-500 text-sm">
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Disease Breakdown Table */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              🦠 Disease Module Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Disease','Category','Screenings','Share'].map(h => (
                      <th key={h}
                        className="text-left text-xs text-slate-500
                                   uppercase tracking-wider py-3 px-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byDisease.map((d, i) => {
                    const total = byDisease.reduce((a,b) => a + b.count, 0)
                    const pct   = total > 0
                      ? ((d.count / total) * 100).toFixed(1) : 0
                    return (
                      <tr key={i}
                        className="border-b border-white/5 hover:bg-white/2
                                   transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full"
                              style={{ background: d.color_hex }}/>
                            <span className="text-white font-medium">
                              {d.disease_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {d.disease_code}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-semibold">
                            {d.count}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-dark-600">
                              <div className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: d.color_hex
                                }}/>
                            </div>
                            <span className="text-xs text-slate-400 w-10">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DISTRICTS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {distStats.map((d, i) => (
              <div key={i} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-brand-cyan" />
                  <h3 className="text-sm font-semibold text-white">
                    {d.district_name}
                  </h3>
                  {d.total_screenings > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full
                                     bg-emerald-500/10 text-emerald-400">
                      Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-slate-500">Total Screenings</p>
                    <p className="text-xl font-bold text-white">
                      {d.total_screenings}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">High Risk</p>
                    <p className="text-xl font-bold text-red-400">
                      {d.high_risk}
                    </p>
                  </div>
                </div>
                {d.total_screenings > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs
                                    text-slate-500 mb-1">
                      <span>Risk Rate</span>
                      <span>
                        {((d.high_risk/d.total_screenings)*100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-dark-600">
                      <div className="h-1.5 rounded-full bg-red-500 transition-all"
                        style={{
                          width:`${(d.high_risk/d.total_screenings)*100}%`
                        }}/>
                    </div>
                  </div>
                )}
                <div className="mt-3 text-xs text-slate-600">
                  📍 {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRENDS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              📈 14-Day Screening Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}
                margin={{ top:5, right:20, left:-20, bottom:5 }}>
                <XAxis dataKey="date"
                  tick={{ fill:'#64748b', fontSize:10 }}
                  tickFormatter={d => d.slice(5)}/>
                <YAxis tick={{ fill:'#64748b', fontSize:10 }}/>
                <Tooltip contentStyle={{
                  background:'#0f1629', border:'1px solid #1a2540',
                  borderRadius:'8px', color:'#e2e8f0', fontSize:'12px'
                }}/>
                <Legend formatter={v => (
                  <span style={{color:'#94a3b8',fontSize:'11px'}}>{v}</span>
                )}/>
                <Line type="monotone" dataKey="screenings" name="Screenings"
                  stroke="#00d4ff" strokeWidth={2} dot={false}
                  activeDot={{ r:4 }}/>
                <Line type="monotone" dataKey="high_risk" name="High Risk"
                  stroke="#EF4444" strokeWidth={2} dot={false}
                  activeDot={{ r:4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Table */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              Daily Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Date','Screenings','High Risk','Risk Rate'].map(h => (
                      <th key={h}
                        className="text-left text-xs text-slate-500
                                   uppercase tracking-wider py-3 px-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...trend].reverse().map((d, i) => (
                    <tr key={i}
                      className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 px-4 text-slate-300">{d.date}</td>
                      <td className="py-3 px-4 text-white font-medium">
                        {d.screenings}
                      </td>
                      <td className="py-3 px-4 text-red-400 font-medium">
                        {d.high_risk}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${d.screenings > 0 &&
                            (d.high_risk/d.screenings) > 0.5
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {d.screenings > 0
                            ? `${((d.high_risk/d.screenings)*100).toFixed(0)}%`
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ALERTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Recent High Risk Cases
          </h3>
          {highRisk.length > 0 ? (
            <div className="space-y-3">
              {highRisk.map((s, i) => (
                <div key={i}
                  className="flex items-center justify-between p-4
                             rounded-xl glass hover:border-white/15
                             transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-600
                                    border border-white/10 flex items-center
                                    justify-center font-bold text-brand-cyan">
                      {s.patient_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {s.patient_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.patient_uid} · {s.disease}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">AI Prediction</p>
                      <p className="text-sm text-white font-medium">
                        {s.prediction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Risk Score</p>
                      <p className="text-lg font-bold"
                        style={{
                          color: s.risk_level === 'critical'
                            ? '#7C3AED' : '#EF4444'
                        }}>
                        {(s.risk_score * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-xs
                                     font-semibold uppercase"
                      style={{
                        background: s.risk_level === 'critical'
                          ? 'rgba(124,58,237,0.2)'
                          : 'rgba(239,68,68,0.2)',
                        color: s.risk_level === 'critical'
                          ? '#a78bfa' : '#f87171'
                      }}>
                      {s.risk_level}
                    </span>
                    {s.referral_needed && (
                      <span className="px-2 py-1 rounded-lg text-xs
                                       bg-orange-500/10 text-orange-400
                                       border border-orange-500/20">
                        Refer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-slate-500">No high risk cases recorded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}