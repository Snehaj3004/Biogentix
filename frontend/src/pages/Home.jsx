import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Activity, AlertTriangle, MapPin, Microscope,
  Cpu, TrendingUp, Users, ArrowUpRight, Dna
} from 'lucide-react'
import API from '../api/axios'

const DISEASE_MODULES = [
  { code:'TB',           name:'Tuberculosis',            category:'Infectious', icon:'🫁', border:'#EF4444',
    desc:'AI CXR detection + cough analysis + sputum test' },
  { code:'HIV',          name:'HIV / AIDS',               category:'Infectious', icon:'🧬', border:'#F97316',
    desc:'Risk scoring + rapid antibody/antigen test' },
  { code:'MALARIA',      name:'Malaria',                  category:'Infectious', icon:'🦟', border:'#EAB308',
    desc:'Smear detection + fever pattern + RDT kit' },
  { code:'STI',          name:'STI',                      category:'Infectious', icon:'🔵', border:'#8B5CF6',
    desc:'Symptom + lab interpretation + multiplex test' },
  { code:'MATERNAL',     name:'Maternal & Newborn',       category:'Maternal',   icon:'🤰', border:'#EC4899',
    desc:'Risk scoring for maternal mortality + neonatal' },
  { code:'MALNUTRITION', name:'Malnutrition / Anaemia',   category:'Nutrition',  icon:'💉', border:'#06B6D4',
    desc:'Hb prediction + nutrition scoring + MUAC' },
  { code:'DENGUE',       name:'Dengue / NTDs',            category:'NTD',        icon:'🌿', border:'#10B981',
    desc:'Symptom + region mapping + rapid NTD panels' },
  { code:'ENTERIC',      name:'Enteric Diseases',         category:'Enteric',    icon:'💧', border:'#3B82F6',
    desc:'Diarrhea syndrome classification + stool test' },
]

const AI_ENGINES = [
  { name:'Disease-Specific AI',    desc:'TB · HIV · Malaria · STI models with image + symptom fusion', color:'#EF4444' },
  { name:'Syndromic Engine',       desc:'Fever, diarrhoea, respiratory cluster detection + outbreak alerts', color:'#F97316' },
  { name:'Maternal & Nutrition AI',desc:'Risk scoring for anemia, pregnancy complications, growth monitoring', color:'#EC4899' },
  { name:'Epidemiology AI',        desc:'Geo-mapping hotspots + disease trend prediction', color:'#10B981' },
  { name:'Regulatory AI',          desc:'WHO / national reporting automation + ICD coding', color:'#3B82F6' },
]

const RISK_COLORS = {
  minimal: '#10B981',
  low:     '#3B82F6',
  medium:  '#F59E0B',
  high:    '#EF4444',
  critical:'#7C3AED'
}

export default function Home() {
  const [stats,     setStats]     = useState(null)
  const [byDisease, setByDisease] = useState([])
  const [riskDist,  setRiskDist]  = useState(null)
  const [highRisk,  setHighRisk]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d, r, h] = await Promise.all([
          API.get('/api/dashboard/stats'),
          API.get('/api/dashboard/screenings-by-disease'),
          API.get('/api/dashboard/risk-distribution'),
          API.get('/api/dashboard/recent-high-risk'),
        ])
        setStats(s.data)
        setByDisease(d.data)
        setRiskDist(r.data)
        setHighRisk(h.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const riskPieData = riskDist ? [
    { name:'LOW',     value: riskDist.low     + riskDist.minimal, pct: riskDist.low_pct + riskDist.minimal_pct },
    { name:'MEDIUM',  value: riskDist.medium,  pct: riskDist.medium_pct  },
    { name:'HIGH',    value: riskDist.high,    pct: riskDist.high_pct    },
    { name:'CRITICAL',value: riskDist.critical,pct: riskDist.critical_pct},
  ].filter(d => d.value > 0) : []

  const PIE_COLORS = ['#10B981','#F59E0B','#EF4444','#7C3AED']

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-brand-cyan animate-pulse text-lg">
        Loading dashboard...
      </div>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <div className="rounded-2xl p-8 relative overflow-hidden"
        style={{background:'linear-gradient(135deg, #0f1629 0%, #141d35 50%, #0f1629 100%)',
                border:'1px solid rgba(0,212,255,0.15)'}}>
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'radial-gradient(circle at 20% 50%, #00d4ff 0%, transparent 50%)'}}/>
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-1">
            Multi-AI Engine
          </p>
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-white">Diagnosis & </span>
            <span className="text-brand-cyan">Screening</span>
            <span className="text-slate-400"> Platform</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            BioQentix™ integrates rapid test kits (POCT), AI-powered mobile diagnostics,
            and a central analytics engine to{' '}
            <strong className="text-white">
              Screen · Diagnose · Predict · Monitor · Report
            </strong>{' '}
            — delivering real-time public health intelligence from field to cloud.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          {[
            { label:'Total Screenings',   value: stats.total_screenings,  icon: Users,        color:'#00d4ff', note:`+${stats.new_today} today`         },
            { label:'High Risk Cases',    value: stats.high_risk_cases,   icon: AlertTriangle,color:'#EF4444', note:'Needs follow-up'                    },
            { label:'Districts Covered',  value: stats.districts_covered, icon: MapPin,       color:'#10B981', note:'+2 new'                             },
            { label:'Diseases Monitored', value: stats.diseases_monitored,icon: Microscope,   color:'#8B5CF6', note:'8 modules'                          },
            { label:'AI Engines Active',  value: stats.ai_engines_active, icon: Cpu,          color:'#F97316', note:'All operational'                    },
          ].map(({ label, value, icon: Icon, color, note }) => (
            <div key={label}
              className="rounded-xl p-5 glass hover:border-white/15 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} style={{ color }} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <div className="text-3xl font-bold mb-2"
                style={{ color }}>{value}</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp size={12} />
                {note}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disease AI Engine Modules */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Dna size={20} className="text-brand-cyan" />
          <h2 className="text-lg font-semibold text-white">
            Disease AI Engine Modules
          </h2>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Click a module card to launch screening
        </p>
        <div className="grid grid-cols-4 gap-4">
          {DISEASE_MODULES.map(m => (
            <div key={m.code}
              onClick={() => navigate('/screening', { state: { disease: m.code }})}
              className="rounded-xl p-5 glass cursor-pointer
                         hover:scale-105 transition-all duration-200 group"
              style={{ borderLeft: `3px solid ${m.border}` }}>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">
                {m.name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{m.category}</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {m.desc}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs opacity-0
                              group-hover:opacity-100 transition-opacity"
                style={{ color: m.border }}>
                Launch Screening <ArrowUpRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">

        {/* Bar Chart — Screenings by Disease */}
        <div className="rounded-xl p-6 glass">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            📊 Screenings by Disease
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDisease}
              margin={{ top:5, right:10, left:-20, bottom:5 }}>
              <XAxis dataKey="disease_code" tick={{ fill:'#64748b', fontSize:11 }}/>
              <YAxis tick={{ fill:'#64748b', fontSize:11 }}/>
              <Tooltip
                contentStyle={{ background:'#0f1629', border:'1px solid #1a2540',
                                borderRadius:'8px', color:'#e2e8f0' }}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {byDisease.map((entry, i) => (
                  <Cell key={i} fill={entry.color_hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — Risk Distribution */}
        <div className="rounded-xl p-6 glass">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            🎯 Risk Level Distribution
          </h3>
          {riskPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskPieData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value" nameKey="name"
                  label={({ name, pct }) => `${pct?.toFixed(1)}%`}
                  labelLine={false}>
                  {riskPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ color:'#94a3b8', fontSize:'12px' }}>
                      {value}
                    </span>
                  )}/>
                <Tooltip
                  contentStyle={{ background:'#0f1629', border:'1px solid #1a2540',
                                  borderRadius:'8px', color:'#e2e8f0' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No screening data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent High Risk + AI Engines */}
      <div className="grid grid-cols-2 gap-6">

        {/* Recent High Risk Cases */}
        <div className="rounded-xl p-6 glass">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Recent High Risk Cases
          </h3>
          <div className="space-y-3">
            {highRisk.length > 0 ? highRisk.map((s, i) => (
              <div key={i}
                className="flex items-center justify-between p-3 rounded-lg
                           bg-dark-700 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">
                    {s.patient_name}
                  </p>
                  <p className="text-xs text-slate-400">{s.disease}</p>
                  <p className="text-xs text-slate-500">{s.date}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: s.risk_level === 'critical'
                        ? 'rgba(124,58,237,0.2)' : 'rgba(239,68,68,0.2)',
                      color: s.risk_level === 'critical' ? '#a78bfa' : '#f87171'
                    }}>
                    {s.risk_level.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Score: {(s.risk_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm text-center py-8">
                No high risk cases yet
              </p>
            )}
          </div>
        </div>

        {/* Multi-AI Engine Architecture */}
        <div className="rounded-xl p-6 glass">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-brand-cyan" />
            Multi-AI Engine Architecture
          </h3>
          <div className="space-y-3">
            {AI_ENGINES.map((e, i) => (
              <div key={i}
                className="p-3 rounded-lg bg-dark-700 border border-white/5
                           hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: e.color }}/>
                  <p className="text-sm font-medium text-white">{e.name}</p>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full
                                   bg-emerald-500/10 text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 ml-4">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}