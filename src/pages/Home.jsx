import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { RefreshCw, PlusCircle, AlertCircle, Sparkles } from 'lucide-react'
import PostCard from '../components/PostCard'
import FeedSkeleton from '../components/FeedSkeleton'
import CategoryFilter from '../components/CategoryFilter'
import { usePosts } from '../hooks/usePosts'

const SORT_OPTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'new', label: 'New' },
]

export default function Home() {
  const [sort, setSort] = useState('top')
  const [category, setCategory] = useState('all')
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const { posts, loading, error, newCount, upvotePost, trackClick, reload } = usePosts(category)

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
        <title>TrustShare — Community Affiliate Reviews</title>
        <meta name="description" content="Community-curated affiliate product reviews. Vote on the best deals, discover trusted recommendations." />
        <meta property="og:title" content="TrustShare — Community Affiliate Reviews" />
        <meta property="og:description" content="Community-curated affiliate product reviews. Vote on the best deals, discover trusted recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trustshare-gray.vercel.app" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="TrustShare — Community Affiliate Reviews" />
        <meta name="twitter:description" content="Community-curated affiliate product reviews. Vote on the best deals." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <CategoryFilter active={category} onChange={setCategory} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sort === opt.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
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
              New Post
            </Link>
          </div>
        </div>

        {newCount > 0 && (
          <button
            onClick={reload}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium rounded-lg py-2.5 hover:bg-orange-500/20 transition-colors"
          >
            <Sparkles size={14} />
            {newCount} new {newCount === 1 ? 'post' : 'posts'} — click to refresh
          </button>
        )}

        {searchQuery && (
          <p className="text-sm text-zinc-400 mb-4">
            Results for <span className="text-zinc-200">"{searchQuery}"</span>
          </p>
        )}

        {error && (
          <div className="card p-4 flex items-center gap-3 text-sm text-red-400 border-red-900/50 mb-4">
            <AlertCircle size={16} />
            {error}
            <button onClick={reload} className="ml-auto btn-ghost text-xs">Retry</button>
          </div>
        )}

        {loading ? (
          <FeedSkeleton />
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-zinc-400 text-sm">No posts yet in this category.</p>
            <Link to="/submit" className="btn-primary inline-flex mt-4">Be the first to post</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard key={post.id} post={post} onUpvote={upvotePost} onClickAffiliate={trackClick} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
