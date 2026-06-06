import { Dna, Shield, Cpu, Globe, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Dna className="text-brand-cyan" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-white">About BioQentix™</h1>
          <p className="text-slate-400 text-sm">
            Multi-AI Engine Diagnostic Platform
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="glass rounded-2xl p-8"
        style={{border:'1px solid rgba(0,212,255,0.15)'}}>
        <h2 className="text-lg font-semibold text-brand-cyan mb-3">
          Our Mission
        </h2>
        <p className="text-slate-300 leading-relaxed">
          BioQentix™ AI Private Limited is transforming public health
          diagnostics by integrating rapid test kits (POCT), AI-powered
          mobile diagnostics, and a central analytics engine to deliver
          real-time health intelligence from field to cloud — targeting
          TB, HIV, Malaria, STI, Maternal Health, Malnutrition, Dengue,
          and Enteric diseases.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Cpu,    color:'#00d4ff', title:'5 AI Engines',
            desc:'Disease-Specific, Syndromic, Maternal, Epidemiology & Regulatory AI' },
          { icon: Shield, color:'#10B981', title:'8 Disease Modules',
            desc:'Complete coverage from TB to Enteric diseases with kit integration' },
          { icon: Globe,  color:'#F97316', title:'Real-time Intelligence',
            desc:'District-level outbreak detection and WHO reporting automation' },
          { icon: Award,  color:'#8B5CF6', title:'Field Deployable',
            desc:'Offline + low connectivity mode for rural ASHA workers' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Icon size={18} style={{ color }} />
              <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="text-center text-slate-600 text-xs py-4">
        BioQentix™ v1.0.0 · AI Private Limited · Pune, Maharashtra
      </div>
    </div>
  )
}