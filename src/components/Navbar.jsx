import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, LogOut, User, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, signOut, setShowAuthModal } = useAuth()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`)
  }

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-[#3C3489] shadow-lg">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Share2 size={20} className="text-amber-400" />
          <span className="font-bold text-base tracking-tight text-white">TrustShare</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              placeholder="Cari review..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-purple-300 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link to="/submit" className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
                <PlusCircle size={14} />
                Submit
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <Link
                  to={`/profile/${user.id}`}
                  className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center hover:bg-amber-300 transition-colors"
                  title="Lihat profil"
                >
                  <span className="text-xs font-bold text-[#3C3489]">{avatarLetter}</span>
                </Link>
                <button onClick={signOut} className="text-purple-300 hover:text-white transition-colors p-1" title="Keluar">
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/submit" className="text-purple-200 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                <PlusCircle size={14} />
                Submit
              </Link>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <User size={14} />
                Masuk
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
