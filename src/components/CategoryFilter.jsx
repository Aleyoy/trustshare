import { CATEGORIES } from '../data/categories'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {CATEGORIES.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            active === c.id
              ? 'bg-[#3C3489] border-[#3C3489] text-white'
              : 'bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50'
          }`}
        >
          <span>{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  )
}
