import { ArrowUp, MessageSquare, ExternalLink, Play, MousePointerClick, BadgeCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { timeAgo } from '../lib/timeAgo'
import { useAuth } from '../context/AuthContext'

function PlatformLinks({ post, onClickAffiliate }) {
  const links = [
    { key: 'shopee_link', label: 'Shopee', cls: 'badge-shopee' },
    { key: 'tokopedia_link', label: 'Tokopedia', cls: 'badge-tokopedia' },
    { key: 'lazada_link', label: 'Lazada', cls: 'badge-lazada' },
    { key: 'affiliate_link', label: 'Affiliate', cls: 'inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full' },
  ].filter(l => post[l.key])

  if (links.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {links.map(l => (
        <a
          key={l.key}
          href={post[l.key]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClickAffiliate?.(post.id)}
          className={l.cls}
        >
          <ExternalLink size={9} />
          {l.label}
        </a>
      ))}
    </div>
  )
}

export default function PostCard({ post, onUpvote, onClickAffiliate, onDelete }) {
  const { user } = useAuth()
  const hasVideo = Boolean(post.video_url)
  const category = CATEGORIES.find(c => c.id === post.category)
  const isOwn = user?.id && post.user_id === user.id

  return (
    <article className="card flex gap-0 overflow-hidden hover:shadow-md transition-shadow">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1.5 px-3 py-4 bg-purple-50 min-w-[56px]">
        <button
          className={`vote-btn group flex flex-col items-center gap-1 ${post.user_voted ? 'vote-btn-active' : ''}`}
          onClick={() => onUpvote(post.id)}
          aria-label="Upvote"
        >
          <ArrowUp size={18} className={post.user_voted ? 'text-amber-500' : 'group-hover:text-amber-500 transition-colors text-slate-400'} />
        </button>
        <span className={`text-sm font-bold tabular-nums ${post.user_voted ? 'text-amber-500' : 'text-slate-600'}`}>
          {post.upvotes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start gap-3">
          {hasVideo && (
            <div className="shrink-0 w-20 h-14 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
              <Play size={16} className="text-purple-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {category && category.id !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full mb-1">
                {category.emoji} {category.label}
              </span>
            )}
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-sm font-semibold text-[#1E1B4B] leading-snug hover:text-[#3C3489] transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {post.author ? (
            <Link to={`/profile/${post.author.id}`} className="flex items-center gap-1 hover:text-[#3C3489] transition-colors font-medium text-slate-500">
              {post.author.username ?? 'anon'}
              {post.author.is_verified && <BadgeCheck size={11} className="text-amber-500" />}
            </Link>
          ) : null}

          <span title={new Date(post.created_at).toLocaleString()}>{timeAgo(post.created_at)}</span>

          <Link to={`/post/${post.id}`} className="flex items-center gap-1 hover:text-[#3C3489] transition-colors">
            <MessageSquare size={12} />
            {post.comment_count > 0 ? post.comment_count : 'No'} {post.comment_count === 1 ? 'comment' : 'comments'}
          </Link>

          {post.clicks > 0 && (
            <span className="flex items-center gap-1">
              <MousePointerClick size={12} />
              {post.clicks}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <PlatformLinks post={post} onClickAffiliate={onClickAffiliate} />
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                title="Hapus post"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
