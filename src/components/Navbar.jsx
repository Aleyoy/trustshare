import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Share2 size={20} className="text-orange-500" />
          <span className="font-bold text-base tracking-tight text-zinc-100">TrustShare</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search deals & reviews..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/submit" className="btn-primary flex items-center gap-1.5">
            <PlusCircle size={14} />
            Submit
          </Link>
        </div>
      </div>
    </header>
  )
}
