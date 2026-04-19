import { categories } from '../data/mockData'
import { Shield, TrendingUp, Clock } from 'lucide-react'

export default function Sidebar({ activeCategory, onCategory, sort, onSort }) {
  return (
    <aside className="w-56 shrink-0 space-y-4">
      <div className="card p-4 space-y-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Categories</p>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => onCategory(c.id)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              activeCategory === c.id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            <span>{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div className="card p-4 space-y-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sort by</p>
        {[
          { id: 'hot', label: 'Hot', Icon: TrendingUp },
          { id: 'new', label: 'New', Icon: Clock },
          { id: 'trusted', label: 'Trusted Only', Icon: Shield },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onSort(id)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              sort === id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">About</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          TrustShare is a community-curated affiliate hub. Posts are voted on by real users. Trusted badge means the reviewer has disclosed their relationship and holds a positive track record.
        </p>
      </div>
    </aside>
  )
}
