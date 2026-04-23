import { ArrowUp, MessageSquare, ExternalLink, Play, MousePointerClick, BadgeCheck, Trash2, ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { timeAgo } from '../lib/timeAgo'
import { useAuth } from '../context/AuthContext'
import MediaLightbox from './MediaLightbox'

function getYouTubeThumbnail(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    let id = null
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1)
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v')
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
  } catch {}
  return null
}

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
  const [lightbox, setLightbox] = useState(false)
  const hasMedia = Boolean(post.media_url)
  const ytThumbnail = getYouTubeThumbnail(post.video_url)
  const hasVideo = Boolean(post.video_url)
  const category = CATEGORIES.find(c => c.id === post.category)
  const isOwn = user?.id && post.user_id === user.id

  return (
    <>
    {lightbox && <MediaLightbox url={post.media_url} type={post.media_type} onClose={() => setLightbox(false)} />}
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
          {/* Media thumbnail — uploaded image/video takes priority over video link icon */}
          {hasMedia ? (
            <button
              onClick={() => setLightbox(true)}
              className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-purple-200 relative group"
            >
              {post.media_type === 'image' ? (
                <img src={post.media_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <Play size={18} className="text-purple-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {post.media_type === 'image'
                  ? <ImageIcon size={14} className="text-white" />
                  : <Play size={14} className="text-white" />}
              </div>
            </button>
          ) : hasVideo ? (
            <Link to={`/post/${post.id}`} className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-purple-200 relative group block">
              {ytThumbnail ? (
                <img src={ytThumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <Play size={16} className="text-purple-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={14} className="text-white" />
              </div>
            </Link>
          ) : null}


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
    </>
  )
}
