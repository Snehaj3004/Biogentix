import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import API from '../api/axios'

export default function Layout({ children }) {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    API.get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-40 px-8 py-3
                        border-b border-white/5 bg-dark-900/80
                        backdrop-blur-sm flex items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'online'   ? 'bg-emerald-400 animate-pulse' :
              apiStatus === 'offline'  ? 'bg-red-400' :
              'bg-yellow-400 animate-pulse'
            }`}/>
            <span className="text-xs text-slate-400">
              API {apiStatus === 'online' ? 'Connected' :
                   apiStatus === 'offline' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
          <div className="text-xs text-slate-600">
            BioQentix™ v1.0.0
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}