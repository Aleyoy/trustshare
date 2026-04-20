import { CATEGORIES } from '../data/categories'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {CATEGORIES.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            active === c.id
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
          }`}
        >
          <span>{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  )
}
