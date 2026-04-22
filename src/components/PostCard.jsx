import { ArrowUp, MessageSquare, ExternalLink, Play, MousePointerClick, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { timeAgo } from '../lib/timeAgo'

export default function PostCard({ post, onUpvote, onClickAffiliate }) {
  const hasVideo = Boolean(post.video_url)
  const category = CATEGORIES.find(c => c.id === post.category)

  return (
    <article className="card flex gap-0 overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1.5 px-3 py-4 bg-zinc-950/40 min-w-[56px]">
        <button
          className={`vote-btn group flex flex-col items-center gap-1 ${post.user_voted ? 'vote-btn-active' : ''}`}
          onClick={() => onUpvote(post.id)}
          aria-label="Upvote"
        >
          <ArrowUp
            size={18}
            className={post.user_voted ? 'text-orange-400' : 'group-hover:text-orange-400 transition-colors'}
          />
        </button>
        <span className={`text-sm font-bold tabular-nums ${post.user_voted ? 'text-orange-400' : 'text-zinc-300'}`}>
          {post.upvotes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start gap-3">
          {hasVideo && (
            <div className="shrink-0 w-20 h-14 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Play size={16} className="text-zinc-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {category && category.id !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 mb-1">
                {category.emoji} {category.label}
              </span>
            )}
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-sm font-semibold text-zinc-100 leading-snug hover:text-orange-300 transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
          {post.author ? (
            <Link
              to={`/profile/${post.author.id}`}
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              {post.author.username ?? 'anon'}
              {post.author.is_verified && <BadgeCheck size={11} className="text-orange-400" />}
            </Link>
          ) : null}
          <span title={new Date(post.created_at).toLocaleString()}>{timeAgo(post.created_at)}</span>

          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <MessageSquare size={12} />
            {post.comment_count > 0 ? post.comment_count : 'No'} {post.comment_count === 1 ? 'comment' : 'comments'}
          </Link>

          {post.clicks > 0 && (
            <span className="flex items-center gap-1 text-zinc-600">
              <MousePointerClick size={12} />
              {post.clicks} {post.clicks === 1 ? 'click' : 'clicks'}
            </span>
          )}

          {post.affiliate_link && (
            <a
              href={post.affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClickAffiliate?.(post.id)}
              className="flex items-center gap-1 text-orange-400/70 hover:text-orange-400 transition-colors ml-auto"
            >
              <ExternalLink size={12} />
              Affiliate Link
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
