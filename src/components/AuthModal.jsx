import { useState } from 'react'
import { X, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { setShowAuthModal, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
        setShowAuthModal(false)
      } else {
        await signUpWithEmail(email, password)
        setSuccess('Cek email kamu untuk konfirmasi akun.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />

      <div className="relative card w-full max-w-sm p-6 shadow-2xl">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#3C3489] flex items-center justify-center">
            <span className="text-amber-400 font-bold text-xs">T</span>
          </div>
          <h2 className="text-lg font-bold text-[#1E1B4B]">
            {mode === 'login' ? 'Selamat datang' : 'Buat akun'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          {mode === 'login' ? 'Masuk untuk voting dan submit review.' : 'Bergabung dengan TrustShare.'}
        </p>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mb-4 shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Lanjutkan dengan Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-purple-100" />
          <span className="text-xs text-slate-400">atau</span>
          <div className="flex-1 h-px bg-purple-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="input pl-9" />
          </div>
          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="input pl-9" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Mohon tunggu…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }} className="text-[#3C3489] font-semibold hover:underline">
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  )
}
