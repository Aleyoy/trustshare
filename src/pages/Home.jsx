import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { RefreshCw, PlusCircle, AlertCircle, Sparkles } from 'lucide-react'
import PostCard from '../components/PostCard'
import FeedSkeleton from '../components/FeedSkeleton'
import CategoryFilter from '../components/CategoryFilter'
import { usePosts } from '../hooks/usePosts'

const SORT_OPTIONS = [
  { id: 'top', label: 'Teratas' },
  { id: 'new', label: 'Terbaru' },
]

export default function Home() {
  const [sort, setSort] = useState('top')
  const [category, setCategory] = useState('all')
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const { posts, loading, error, newCount, upvotePost, trackClick, deletePost, reload } = usePosts(category)

  const filtered = useMemo(() => {
    let result = posts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }

    return [...result].sort((a, b) =>
      sort === 'new'
        ? new Date(b.created_at) - new Date(a.created_at)
        : b.upvotes - a.upvotes
    )
  }, [posts, sort, searchQuery])

  return (
    <>
      <Helmet>
        <title>TrustShare — Review Afiliasi Terpercaya</title>
        <meta name="description" content="Review produk afiliasi terpercaya dari komunitas Indonesia." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <CategoryFilter active={category} onChange={setCategory} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-white border border-purple-100 rounded-lg p-1 shadow-sm">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sort === opt.id ? 'bg-[#3C3489] text-white' : 'text-slate-500 hover:text-[#3C3489]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={reload} className="btn-ghost flex items-center gap-1.5" disabled={loading}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link to="/submit" className="btn-primary flex items-center gap-1.5">
              <PlusCircle size={13} />
              Post Baru
            </Link>
          </div>
        </div>

        {newCount > 0 && (
          <button
            onClick={reload}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-xl py-2.5 hover:bg-amber-100 transition-colors"
          >
            <Sparkles size={14} />
            {newCount} post baru — klik untuk refresh
          </button>
        )}

        {searchQuery && (
          <p className="text-sm text-slate-500 mb-4">
            Hasil untuk <span className="text-[#1E1B4B] font-medium">"{searchQuery}"</span>
          </p>
        )}

        {error && (
          <div className="card p-4 flex items-center gap-3 text-sm text-red-500 mb-4">
            <AlertCircle size={16} />
            {error}
            <button onClick={reload} className="ml-auto btn-ghost text-xs">Coba lagi</button>
          </div>
        )}

        {loading ? (
          <FeedSkeleton />
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-slate-400 text-sm">Belum ada post di kategori ini.</p>
            <Link to="/submit" className="btn-primary inline-flex mt-4">Jadilah yang pertama</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard key={post.id} post={post} onUpvote={upvotePost} onClickAffiliate={trackClick} onDelete={deletePost} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
