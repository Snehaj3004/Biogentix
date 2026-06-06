import { useState, useEffect } from 'react'
import { History, Search, Filter, Eye, ChevronDown } from 'lucide-react'
import API from '../api/axios'

const RISK_STYLE = {
  minimal:  { bg:'rgba(16,185,129,0.1)',  color:'#10B981' },
  low:      { bg:'rgba(59,130,246,0.1)',  color:'#3B82F6' },
  medium:   { bg:'rgba(245,158,11,0.1)',  color:'#F59E0B' },
  high:     { bg:'rgba(239,68,68,0.1)',   color:'#EF4444' },
  critical: { bg:'rgba(124,58,237,0.1)', color:'#7C3AED' },
}

export default function HistoryPage() {
  const [screenings, setScreenings] = useState([])
  const [patients,   setPatients]   = useState([])
  const [diseases,   setDiseases]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterDisease, setFilterDisease] = useState('')
  const [filterRisk,    setFilterRisk]    = useState('')
  const [selected,   setSelected]   = useState(null)
  const [page,       setPage]       = useState(1)
  const PER_PAGE = 10

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, d] = await Promise.all([
          API.get('/api/screenings/?limit=200'),
          API.get('/api/patients/?limit=200'),
          API.get('/api/dashboard/diseases'),
        ])
        setScreenings(s.data)
        setPatients(p.data)
        setDiseases(d.data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const getPatient = id => patients.find(p => p.id === id)
  const getDisease = id => diseases.find(d => d.id === id)

  const filtered = screenings.filter(s => {
    const pat = getPatient(s.patient_id)
    const dis = getDisease(s.disease_id)
    const matchSearch = !search ||
      pat?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      pat?.patient_uid.toLowerCase().includes(search.toLowerCase()) ||
      s.screening_uid.toLowerCase().includes(search.toLowerCase())
    const matchDisease = !filterDisease ||
      dis?.code === filterDisease
    const matchRisk = !filterRisk ||
      s.ai_risk_level === filterRisk
    return matchSearch && matchDisease && matchRisk
  })

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-brand-cyan animate-pulse">Loading history...</div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="text-brand-cyan" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-white">Screening History</h1>
          <p className="text-slate-400 text-sm">
            All {screenings.length} screenings across all disease modules
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14}
            className="absolute left-3 top-3.5 text-slate-500"/>
          <input placeholder="Search patient, UID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-dark-700 border border-white/10 rounded-lg
                       pl-9 pr-4 py-3 text-white text-sm focus:outline-none
                       focus:border-brand-cyan/50 transition"/>
        </div>

        <div className="relative">
          <Filter size={14}
            className="absolute left-3 top-3.5 text-slate-500"/>
          <select value={filterDisease}
            onChange={e => { setFilterDisease(e.target.value); setPage(1) }}
            className="bg-dark-700 border border-white/10 rounded-lg
                       pl-9 pr-8 py-3 text-white text-sm focus:outline-none
                       appearance-none cursor-pointer min-w-36">
            <option value="">All Diseases</option>
            {diseases.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
          <ChevronDown size={12}
            className="absolute right-3 top-4 text-slate-500 pointer-events-none"/>
        </div>

        <div className="relative">
          <select value={filterRisk}
            onChange={e => { setFilterRisk(e.target.value); setPage(1) }}
            className="bg-dark-700 border border-white/10 rounded-lg
                       px-4 py-3 text-white text-sm focus:outline-none
                       appearance-none cursor-pointer min-w-36">
            <option value="">All Risk Levels</option>
            {['minimal','low','medium','high','critical'].map(r => (
              <option key={r} value={r} className="capitalize">{r}</option>
            ))}
          </select>
          <ChevronDown size={12}
            className="absolute right-3 top-4 text-slate-500 pointer-events-none"/>
        </div>

        <div className="px-4 py-3 rounded-lg glass text-sm text-slate-400">
          {filtered.length} results
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Screening ID','Patient','Disease','Risk Level',
                'AI Score','Kit Result','Referral','Date',''].map(h => (
                <th key={h}
                  className="text-left text-xs text-slate-500 uppercase
                             tracking-wider py-4 px-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, i) => {
              const pat   = getPatient(s.patient_id)
              const dis   = getDisease(s.disease_id)
              const risk  = RISK_STYLE[s.ai_risk_level] || RISK_STYLE.low
              return (
                <tr key={i}
                  className="border-b border-white/5 hover:bg-white/2
                             transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono text-xs text-brand-cyan">
                      {s.screening_uid}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium text-xs">
                        {pat?.full_name || '—'}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {pat?.patient_uid}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-300">
                      {dis?.name || s.disease_id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs
                                     font-semibold capitalize"
                      style={{ background: risk.bg, color: risk.color }}>
                      {s.ai_risk_level}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-semibold">
                      {s.ai_risk_score
                        ? `${(s.ai_risk_score*100).toFixed(0)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${s.kit_test_result === 'positive'
                        ? 'bg-red-500/10 text-red-400'
                        : s.kit_test_result === 'negative'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400'}`}>
                      {s.kit_test_result}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {s.referral_needed
                      ? <span className="text-xs px-2 py-0.5 rounded-full
                                         bg-orange-500/10 text-orange-400">
                          Required
                        </span>
                      : <span className="text-slate-600 text-xs">—</span>
                    }
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => setSelected(s)}
                      className="p-1.5 rounded-lg hover:bg-white/5
                                 text-slate-500 hover:text-brand-cyan
                                 transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No screenings found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg glass text-sm text-slate-300
                         disabled:opacity-30 hover:border-white/20 transition">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg glass text-sm text-slate-300
                         disabled:opacity-30 hover:border-white/20 transition">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                        flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg
                          border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Screening Detail</h3>
              <button onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white transition">✕</button>
            </div>

            {(() => {
              const pat  = getPatient(selected.patient_id)
              const dis  = getDisease(selected.disease_id)
              const risk = RISK_STYLE[selected.ai_risk_level] || RISK_STYLE.low
              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: risk.bg }}>
                    <p className="text-2xl font-bold"
                      style={{ color: risk.color }}>
                      {selected.ai_risk_level?.toUpperCase()} RISK
                    </p>
                    <p className="text-white text-sm mt-1">
                      {selected.ai_prediction}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ['Screening UID', selected.screening_uid],
                      ['Patient',       pat?.full_name],
                      ['Patient UID',   pat?.patient_uid],
                      ['Disease',       dis?.name],
                      ['Risk Score',    `${((selected.ai_risk_score||0)*100).toFixed(0)}%`],
                      ['Confidence',    `${((selected.ai_confidence||0)*100).toFixed(0)}%`],
                      ['Kit Result',    selected.kit_test_result],
                      ['Status',        selected.status],
                      ['Referral',      selected.referral_needed ? 'Required' : 'Not needed'],
                      ['Date',          new Date(selected.created_at).toLocaleString()],
                    ].map(([k,v]) => (
                      <div key={k}
                        className="flex flex-col p-3 rounded-lg bg-dark-700">
                        <span className="text-xs text-slate-500">{k}</span>
                        <span className="text-white font-medium text-xs mt-1
                                         capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                  {selected.symptoms &&
                    Object.keys(selected.symptoms).length > 0 && (
                    <div className="p-3 rounded-lg bg-dark-700">
                      <p className="text-xs text-slate-500 mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(selected.symptoms)
                          .filter(([,v]) => v === true || Number(v) > 0)
                          .map(([k,v]) => (
                          <span key={k}
                            className="px-2 py-0.5 rounded-full text-xs
                                       bg-brand-cyan/10 text-brand-cyan">
                            {k.replace(/_/g,' ')}{typeof v === 'number'
                              ? `: ${v}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}