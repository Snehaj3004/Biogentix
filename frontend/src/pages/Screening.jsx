import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Activity, ChevronRight, CheckCircle, AlertTriangle,
         XCircle, Loader, User, Stethoscope, FlaskConical } from 'lucide-react'
import API from '../api/axios'

// ── Symptom definitions for all 8 disease modules ──────────────────────────
const DISEASE_SYMPTOMS = {
  TB: {
    name: 'Tuberculosis (TB)', icon: '🫁', color: '#EF4444',
    symptoms: [
      { key:'cough_weeks',       label:'Cough duration (weeks)',  type:'number', placeholder:'e.g. 3' },
      { key:'night_sweats',      label:'Night sweats',            type:'boolean' },
      { key:'weight_loss',       label:'Unexplained weight loss', type:'boolean' },
      { key:'fever',             label:'Persistent fever',        type:'boolean' },
      { key:'blood_in_sputum',   label:'Blood in sputum',         type:'boolean' },
      { key:'chest_pain',        label:'Chest pain',              type:'boolean' },
      { key:'fatigue',           label:'Fatigue / weakness',      type:'boolean' },
    ],
    vitals: [
      { key:'temperature',  label:'Temperature (°C)', type:'number', placeholder:'e.g. 38.5' },
      { key:'weight_kg',    label:'Weight (kg)',       type:'number', placeholder:'e.g. 52'   },
    ],
    kitTests: ['Sputum Test', 'Molecular Test (GeneXpert)', 'Chest X-Ray']
  },
  HIV: {
    name: 'HIV / AIDS', icon: '🧬', color: '#F97316',
    symptoms: [
      { key:'rapid_weight_loss',    label:'Rapid weight loss',       type:'boolean' },
      { key:'recurrent_infections', label:'Recurrent infections',    type:'boolean' },
      { key:'oral_thrush',          label:'Oral thrush',             type:'boolean' },
      { key:'swollen_lymph_nodes',  label:'Swollen lymph nodes',     type:'boolean' },
      { key:'high_risk_behavior',   label:'High risk behavior',      type:'boolean' },
      { key:'skin_rash',            label:'Persistent skin rash',    type:'boolean' },
      { key:'fatigue',              label:'Chronic fatigue',         type:'boolean' },
    ],
    vitals: [
      { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'e.g. 37.5' },
      { key:'weight_kg',   label:'Weight (kg)',       type:'number', placeholder:'e.g. 65'   },
    ],
    kitTests: ['HIV Rapid Antibody Test', 'HIV Antigen/Antibody Combo', 'CD4 Count']
  },
  MALARIA: {
    name: 'Malaria', icon: '🦟', color: '#EAB308',
    symptoms: [
      { key:'high_fever',           label:'High fever (>38.5°C)',   type:'boolean' },
      { key:'chills',               label:'Chills / rigors',        type:'boolean' },
      { key:'headache',             label:'Severe headache',        type:'boolean' },
      { key:'vomiting',             label:'Nausea / vomiting',      type:'boolean' },
      { key:'sweating',             label:'Profuse sweating',       type:'boolean' },
      { key:'travel_endemic_area',  label:'Travel to endemic area', type:'boolean' },
      { key:'muscle_pain',          label:'Muscle / joint pain',    type:'boolean' },
    ],
    vitals: [
      { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'e.g. 39.5' },
      { key:'weight_kg',   label:'Weight (kg)',       type:'number', placeholder:'e.g. 60'   },
    ],
    kitTests: ['Malaria RDT (PfPv)', 'Blood Smear Microscopy', 'PCR Test']
  },
  STI: {
    name: 'STI / Sexually Transmitted', icon: '🔵', color: '#8B5CF6',
    symptoms: [
      { key:'discharge',             label:'Unusual discharge',       type:'boolean' },
      { key:'ulcers',                label:'Genital ulcers / sores',  type:'boolean' },
      { key:'dysuria',               label:'Pain during urination',   type:'boolean' },
      { key:'lower_abdominal_pain',  label:'Lower abdominal pain',    type:'boolean' },
      { key:'high_risk_behavior',    label:'High risk behavior',      type:'boolean' },
      { key:'rash',                  label:'Skin rash',               type:'boolean' },
    ],
    vitals: [
      { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'e.g. 37.2' },
    ],
    kitTests: ['STI Multiplex Test', 'Syphilis RDT', 'HIV/HCV/HBsAg Panel']
  },
  MATERNAL: {
    name: 'Maternal & Newborn Health', icon: '🤰', color: '#EC4899',
    symptoms: [
      { key:'severe_headache',     label:'Severe headache',         type:'boolean' },
      { key:'blurred_vision',      label:'Blurred vision',          type:'boolean' },
      { key:'excessive_bleeding',  label:'Excessive bleeding',      type:'boolean' },
      { key:'reduced_fetal_movement', label:'Reduced fetal movement', type:'boolean' },
      { key:'severe_abdominal_pain',  label:'Severe abdominal pain',  type:'boolean' },
      { key:'swelling',            label:'Facial / hand swelling',  type:'boolean' },
    ],
    vitals: [
      { key:'age',          label:'Mother age (years)',  type:'number', placeholder:'e.g. 24'  },
      { key:'bp_systolic',  label:'BP Systolic (mmHg)', type:'number', placeholder:'e.g. 120' },
      { key:'bp_diastolic', label:'BP Diastolic (mmHg)',type:'number', placeholder:'e.g. 80'  },
      { key:'hemoglobin',   label:'Hemoglobin (g/dL)',  type:'number', placeholder:'e.g. 11'  },
      { key:'weight_kg',    label:'Weight (kg)',         type:'number', placeholder:'e.g. 65'  },
    ],
    kitTests: ['Pregnancy Test', 'Urine Protein (Preeclampsia)', 'Neonatal Bilirubin Strip']
  },
  MALNUTRITION: {
    name: 'Malnutrition / Anaemia', icon: '💉', color: '#06B6D4',
    symptoms: [
      { key:'visible_wasting',  label:'Visible wasting',         type:'boolean' },
      { key:'edema',            label:'Bilateral pitting edema', type:'boolean' },
      { key:'poor_appetite',    label:'Poor appetite',           type:'boolean' },
      { key:'pale_conjunctiva', label:'Pale conjunctiva',        type:'boolean' },
      { key:'brittle_hair',     label:'Brittle hair / nails',    type:'boolean' },
    ],
    vitals: [
      { key:'muac_cm',   label:'MUAC (cm)',    type:'number', placeholder:'e.g. 12.5' },
      { key:'weight_kg', label:'Weight (kg)',  type:'number', placeholder:'e.g. 8'    },
      { key:'height_cm', label:'Height (cm)',  type:'number', placeholder:'e.g. 85'   },
      { key:'hemoglobin',label:'Hb (g/dL)',    type:'number', placeholder:'e.g. 9'    },
    ],
    kitTests: ['Hemoglobin Strip Test', 'Ferritin Test', 'Anthropometric Assessment']
  },
  DENGUE: {
    name: 'Dengue / NTDs', icon: '🌿', color: '#10B981',
    symptoms: [
      { key:'high_fever',      label:'Sudden high fever',      type:'boolean' },
      { key:'severe_headache', label:'Severe headache',        type:'boolean' },
      { key:'eye_pain',        label:'Pain behind eyes',       type:'boolean' },
      { key:'rash',            label:'Skin rash',              type:'boolean' },
      { key:'joint_pain',      label:'Joint / muscle pain',   type:'boolean' },
      { key:'bleeding_gums',   label:'Bleeding gums / nose',  type:'boolean' },
      { key:'nausea',          label:'Nausea / vomiting',     type:'boolean' },
    ],
    vitals: [
      { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'e.g. 39.8' },
      { key:'weight_kg',   label:'Weight (kg)',       type:'number', placeholder:'e.g. 55'   },
    ],
    kitTests: ['Dengue NS1 Antigen', 'Dengue IgM/IgG', 'Chikungunya RDT']
  },
  ENTERIC: {
    name: 'Enteric Diseases', icon: '💧', color: '#3B82F6',
    symptoms: [
      { key:'diarrhea_days',   label:'Diarrhea duration (days)', type:'number', placeholder:'e.g. 3' },
      { key:'blood_in_stool',  label:'Blood in stool',            type:'boolean' },
      { key:'vomiting',        label:'Vomiting',                  type:'boolean' },
      { key:'dehydration',     label:'Dehydration signs',         type:'boolean' },
      { key:'fever',           label:'Fever',                     type:'boolean' },
      { key:'abdominal_cramps',label:'Abdominal cramps',          type:'boolean' },
    ],
    vitals: [
      { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'e.g. 38.2' },
      { key:'weight_kg',   label:'Weight (kg)',       type:'number', placeholder:'e.g. 45'   },
    ],
    kitTests: ['Stool Antigen Test', 'Cholera RDT', 'Rotavirus Test']
  }
}

const RISK_CONFIG = {
  minimal:  { color:'#10B981', bg:'rgba(16,185,129,0.1)',  label:'MINIMAL RISK'  },
  low:      { color:'#3B82F6', bg:'rgba(59,130,246,0.1)',  label:'LOW RISK'      },
  medium:   { color:'#F59E0B', bg:'rgba(245,158,11,0.1)',  label:'MEDIUM RISK'   },
  high:     { color:'#EF4444', bg:'rgba(239,68,68,0.1)',   label:'HIGH RISK'     },
  critical: { color:'#7C3AED', bg:'rgba(124,58,237,0.1)', label:'CRITICAL RISK' },
}

export default function Screening() {
  const location = useLocation()
  const navigate  = useNavigate()

  const [step,         setStep]         = useState(1) // 1=select, 2=patient, 3=symptoms, 4=result
  const [selectedDisease, setSelected] = useState(location.state?.disease || null)
  const [patients,     setPatients]     = useState([])
  const [selectedPat,  setSelectedPat]  = useState(null)
  const [patSearch,    setPatSearch]    = useState('')
  const [symptoms,     setSymptoms]     = useState({})
  const [vitals,       setVitals]       = useState({})
  const [kitResult,    setKitResult]    = useState('not_done')
  const [kitType,      setKitType]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [result,       setResult]       = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [newPatMode,   setNewPatMode]   = useState(false)
  const [newPat,       setNewPat]       = useState({
    full_name:'', age:'', gender:'male', phone:'', village:'', district_id:1
  })

  // Auto-advance if disease pre-selected from Home
  useEffect(() => {
    if (location.state?.disease) {
      setSelected(location.state.disease)
      setStep(2)
    }
  }, [location.state])

  // Load patients
  useEffect(() => {
    API.get('/api/patients/?limit=100').then(r => setPatients(r.data)).catch(console.error)
  }, [])

  const disease = selectedDisease ? DISEASE_SYMPTOMS[selectedDisease] : null

  const filteredPats = patients.filter(p =>
    p.full_name.toLowerCase().includes(patSearch.toLowerCase()) ||
    p.patient_uid.toLowerCase().includes(patSearch.toLowerCase())
  )

  const handleSymptom = (key, val) =>
    setSymptoms(prev => ({ ...prev, [key]: val }))

  const handleVital = (key, val) =>
    setVitals(prev => ({ ...prev, [key]: val === '' ? undefined : Number(val) }))

  const registerAndSelect = async () => {
    if (!newPat.full_name || !newPat.age) return
    try {
      const res = await API.post('/api/patients/', {
        ...newPat, age: Number(newPat.age)
      })
      setPatients(prev => [res.data, ...prev])
      setSelectedPat(res.data)
      setNewPatMode(false)
      setStep(3)
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to register patient')
    }
  }

  const submitScreening = async () => {
    if (!selectedPat || !selectedDisease) return
    setLoading(true)
    try {
      const res = await API.post('/api/screenings/', {
        patient_id:      selectedPat.id,
        disease_code:    selectedDisease,
        district_id:     selectedPat.district_id,
        symptoms,
        vitals,
        kit_test_result: kitResult,
        kit_test_type:   kitType || null,
        notes
      })
      setResult(res.data)
      setStep(4)
    } catch (e) {
      alert(e.response?.data?.detail || 'Screening failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1); setSelected(null); setSelectedPat(null)
    setSymptoms({}); setVitals({}); setKitResult('not_done')
    setKitType(''); setNotes(''); setResult(null)
  }

  // ── Step indicators ────────────────────────────────────────────────────────
  const STEPS = ['Select Disease','Select Patient','Enter Symptoms','AI Result']

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="text-brand-cyan" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-white">Symptom Screening</h1>
          <p className="text-slate-400 text-sm">AI-powered disease screening for all 8 modules</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all ${step === i + 1
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                : step > i + 1
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-600 border border-white/5'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs
                ${step > i + 1 ? 'bg-emerald-500 text-white'
                  : step === i + 1 ? 'bg-brand-cyan text-dark-900' : 'bg-dark-600 text-slate-600'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-slate-600" />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Select Disease ───────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Select Disease Module
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(DISEASE_SYMPTOMS).map(([code, d]) => (
              <div key={code}
                onClick={() => { setSelected(code); setStep(2) }}
                className="rounded-xl p-5 glass cursor-pointer hover:scale-105
                           transition-all duration-200 group"
                style={{ borderLeft: `3px solid ${d.color}` }}>
                <div className="text-3xl mb-2">{d.icon}</div>
                <h3 className="font-semibold text-white text-sm">{d.name}</h3>
                <div className="mt-2 text-xs opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center gap-1"
                  style={{ color: d.color }}>
                  Select <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Select Patient ───────────────────────────────────────── */}
      {step === 2 && disease && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span style={{ color: disease.color }}>{disease.icon}</span>
              {disease.name} — Select Patient
            </h2>
            <button onClick={() => setNewPatMode(!newPatMode)}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20
                         hover:bg-brand-cyan/20 transition-colors">
              + New Patient
            </button>
          </div>

          {/* New Patient Form */}
          {newPatMode && (
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Register New Patient</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key:'full_name', label:'Full Name',    type:'text',   placeholder:'Ramesh Kumar' },
                  { key:'age',       label:'Age',          type:'number', placeholder:'35'           },
                  { key:'phone',     label:'Phone',        type:'text',   placeholder:'9876543210'   },
                  { key:'village',   label:'Village',      type:'text',   placeholder:'Nagar'        },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={newPat[f.key] || ''}
                      onChange={e => setNewPat(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full bg-dark-700 border border-white/10 rounded-lg
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-brand-cyan/50 transition"/>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Gender</label>
                  <select value={newPat.gender}
                    onChange={e => setNewPat(p => ({...p, gender: e.target.value}))}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg
                               px-3 py-2 text-white text-sm focus:outline-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button onClick={registerAndSelect}
                className="px-6 py-2 rounded-lg bg-brand-cyan text-dark-900
                           font-semibold text-sm hover:bg-brand-cyan/90 transition">
                Register & Continue
              </button>
            </div>
          )}

          {/* Patient Search */}
          <input placeholder="Search by name, UID or phone..."
            value={patSearch}
            onChange={e => setPatSearch(e.target.value)}
            className="w-full bg-dark-700 border border-white/10 rounded-lg
                       px-4 py-3 text-white text-sm focus:outline-none
                       focus:border-brand-cyan/50 transition"/>

          {/* Patient List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredPats.map(p => (
              <div key={p.id}
                onClick={() => { setSelectedPat(p); setStep(3) }}
                className={`flex items-center justify-between p-4 rounded-xl
                            cursor-pointer transition-all border
                            ${selectedPat?.id === p.id
                              ? 'border-brand-cyan/40 bg-brand-cyan/5'
                              : 'border-white/5 glass hover:border-white/15'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-dark-600 border border-white/10
                                  flex items-center justify-center text-sm font-bold text-brand-cyan">
                    {p.full_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.full_name}</p>
                    <p className="text-xs text-slate-400">
                      {p.patient_uid} · {p.age}y · {p.gender}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            ))}
            {filteredPats.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">
                No patients found. Register a new patient above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Enter Symptoms ───────────────────────────────────────── */}
      {step === 3 && disease && selectedPat && (
        <div className="space-y-5">
          {/* Patient Info Bar */}
          <div className="flex items-center gap-3 p-4 rounded-xl glass">
            <User size={16} className="text-brand-cyan" />
            <span className="text-sm text-white font-medium">{selectedPat.full_name}</span>
            <span className="text-xs text-slate-400">
              {selectedPat.patient_uid} · {selectedPat.age}y · {selectedPat.gender}
            </span>
            <span className="ml-auto text-xs px-2 py-1 rounded-full"
              style={{ background:`${disease.color}20`, color: disease.color }}>
              {disease.icon} {disease.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Symptoms */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Stethoscope size={16} className="text-brand-cyan" /> Symptoms
              </h3>
              <div className="space-y-3">
                {disease.symptoms.map(s => (
                  <div key={s.key} className="flex items-center justify-between
                                              py-2 border-b border-white/5 last:border-0">
                    <label className="text-sm text-slate-300">{s.label}</label>
                    {s.type === 'boolean' ? (
                      <div className="flex gap-2">
                        {['Yes','No'].map(opt => (
                          <button key={opt}
                            onClick={() => handleSymptom(s.key, opt === 'Yes')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium
                                        transition-all border
                              ${symptoms[s.key] === (opt === 'Yes')
                                ? opt === 'Yes'
                                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input type="number" placeholder={s.placeholder}
                        onChange={e => handleSymptom(s.key, Number(e.target.value))}
                        className="w-24 bg-dark-700 border border-white/10 rounded-lg
                                   px-2 py-1 text-white text-xs text-center
                                   focus:outline-none focus:border-brand-cyan/50"/>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals + Kit Test */}
            <div className="space-y-4">
              {/* Vitals */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-brand-cyan" /> Vitals
                </h3>
                <div className="space-y-3">
                  {disease.vitals.map(v => (
                    <div key={v.key}>
                      <label className="text-xs text-slate-400 mb-1 block">{v.label}</label>
                      <input type="number" placeholder={v.placeholder}
                        onChange={e => handleVital(v.key, e.target.value)}
                        className="w-full bg-dark-700 border border-white/10 rounded-lg
                                   px-3 py-2 text-white text-sm focus:outline-none
                                   focus:border-brand-cyan/50 transition"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kit Test */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FlaskConical size={16} className="text-brand-cyan" /> Kit Test Result
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Test Type</label>
                    <select value={kitType}
                      onChange={e => setKitType(e.target.value)}
                      className="w-full bg-dark-700 border border-white/10 rounded-lg
                                 px-3 py-2 text-white text-sm focus:outline-none">
                      <option value="">Select test...</option>
                      {disease.kitTests.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Result</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val:'not_done',    label:'Not Done',    color:'slate' },
                        { val:'positive',    label:'Positive',    color:'red'   },
                        { val:'negative',    label:'Negative',    color:'green' },
                        { val:'inconclusive',label:'Inconclusive',color:'yellow'},
                      ].map(opt => (
                        <button key={opt.val}
                          onClick={() => setKitResult(opt.val)}
                          className={`py-2 rounded-lg text-xs font-medium
                                      transition-all border text-center
                            ${kitResult === opt.val
                              ? opt.color === 'red'    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                              : opt.color === 'green'  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : opt.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                              : 'bg-slate-500/20 border-slate-500/40 text-slate-400'
                              : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea placeholder="Additional notes..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-brand-cyan/50 resize-none transition"/>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button onClick={submitScreening} disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-dark-900
                       transition-all flex items-center justify-center gap-2
                       disabled:opacity-50"
            style={{ background: disease.color }}>
            {loading
              ? <><Loader size={18} className="animate-spin"/> Running AI Analysis...</>
              : <><Activity size={18}/> Run AI Screening</>}
          </button>
        </div>
      )}

      {/* ── STEP 4: AI Result ────────────────────────────────────────────── */}
      {step === 4 && result && disease && (
        <div className="space-y-5">
          {/* Risk Banner */}
          {(() => {
            const cfg = RISK_CONFIG[result.ai_risk_level] || RISK_CONFIG.low
            return (
              <div className="rounded-2xl p-8 text-center"
                style={{ background: cfg.bg, border: `2px solid ${cfg.color}40` }}>
                <div className="text-5xl mb-3">
                  {result.ai_risk_level === 'critical' ? '🚨'
                    : result.ai_risk_level === 'high' ? '⚠️'
                    : result.ai_risk_level === 'medium' ? '🟡'
                    : '✅'}
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: cfg.color }}>
                  {cfg.label}
                </h2>
                <p className="text-white text-lg font-medium mb-1">
                  {result.ai_prediction}
                </p>
                <p className="text-slate-400 text-sm">
                  Screening ID: {result.screening_uid}
                </p>
              </div>
            )
          })()}

          {/* Scores Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Risk Score',   value:`${((result.ai_risk_score||0)*100).toFixed(0)}%`,
                color: RISK_CONFIG[result.ai_risk_level]?.color },
              { label:'AI Confidence',value:`${((result.ai_confidence||0)*100).toFixed(0)}%`,
                color:'#00d4ff' },
              { label:'Engine Used',  value: result.ai_engine_used?.replace('_',' ').toUpperCase(),
                color:'#8B5CF6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-xl p-5 text-center">
                <p className="text-xs text-slate-400 mb-2">{label}</p>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Referral Alert */}
          {result.referral_needed && (
            <div className="flex items-center gap-3 p-4 rounded-xl
                            bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="text-red-400" size={20} />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  Referral Required
                </p>
                <p className="text-slate-400 text-xs">
                  This patient needs immediate referral to a higher facility.
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Screening Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label:'Patient',    value: selectedPat?.full_name },
                { label:'Patient UID',value: selectedPat?.patient_uid },
                { label:'Disease',    value: disease.name },
                { label:'Kit Result', value: result.kit_test_result },
                { label:'Status',     value: result.status },
                { label:'Date',       value: new Date(result.created_at).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2
                                            border-b border-white/5 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button onClick={reset}
              className="py-3 rounded-xl border border-white/10 text-slate-300
                         hover:bg-white/5 transition text-sm font-medium">
              New Screening
            </button>
            <button onClick={() => navigate('/history')}
              className="py-3 rounded-xl border border-brand-cyan/30
                         text-brand-cyan hover:bg-brand-cyan/5 transition
                         text-sm font-medium">
              View History
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="py-3 rounded-xl text-dark-900 font-semibold text-sm
                         hover:opacity-90 transition"
              style={{ background: disease.color }}>
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}