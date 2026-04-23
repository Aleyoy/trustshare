import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowUp, ArrowLeft, ExternalLink, MessageSquare, AlertCircle, MousePointerClick, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import { useComments } from '../hooks/useComments'
import { CATEGORIES } from '../data/categories'
import { timeAgo } from '../lib/timeAgo'
import MediaLightbox from '../components/MediaLightbox'

function getYouTubeId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch {}
  return null
}

function VideoEmbed({ url }) {
  const ytId = getYouTubeId(url)
  if (ytId) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }
  const isDirectVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url)
  if (isDirectVideo) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800">
        <video controls className="w-full" src={url} />
      </div>
    )
  }
  return (
    <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video flex items-center justify-center">
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-xs">
        Watch video ↗
      </a>
    </div>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const { posts, upvotePost, trackClick } = usePosts()
  const { comments, loading: commentsLoading, createComment } = useComments(id)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)
  const [lightbox, setLightbox] = useState(false)

  const post = posts.find(p => p.id === id)
  const category = post ? CATEGORIES.find(c => c.id === post.category) : null

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-400 text-sm">Post not found.</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
    )
  }

  const pageTitle = `${post.title} — TrustShare`
  const pageDesc = post.description.length > 155
    ? post.description.slice(0, 152) + '…'
    : post.description
  const pageUrl = `https://trustshare-gray.vercel.app/post/${post.id}`

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    setCommentError(null)
    try {
      await createComment(commentText.trim())
      setCommentText('')
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>

      {lightbox && post.media_url && <MediaLightbox url={post.media_url} type={post.media_type} onClose={() => setLightbox(false)} />}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#3C3489] transition-colors mb-6">
          <ArrowLeft size={14} />
          Kembali ke feed
        </Link>

        <article className="card p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                className={`vote-btn group ${post.user_voted ? 'vote-btn-active' : ''}`}
                onClick={() => upvotePost(post.id)}
                aria-label="Upvote"
              >
                <ArrowUp size={20} className={post.user_voted ? 'text-amber-500' : 'group-hover:text-amber-500 transition-colors text-slate-400'} />
              </button>
              <span className={`text-base font-bold tabular-nums ${post.user_voted ? 'text-amber-500' : 'text-slate-600'}`}>
                {post.upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {category && category.id !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full mb-2">
                  {category.emoji} {category.label}
                </span>
              )}

              <h1 className="text-lg font-semibold text-[#1E1B4B] leading-snug mb-1">{post.title}</h1>

              {post.author && (
                <Link
                  to={`/profile/${post.author.id}`}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#3C3489] transition-colors mb-3"
                >
                  oleh {post.author.username ?? 'anon'}
                  {post.author.is_verified && <BadgeCheck size={11} className="text-amber-500" />}
                </Link>
              )}

              {post.media_url && (
                <div className="mb-4">
                  {post.media_type === 'image' ? (
                    <button onClick={() => setLightbox(true)} className="w-full rounded-xl overflow-hidden border border-purple-200 group relative">
                      <img src={post.media_url} alt="" className="w-full max-h-80 object-cover" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : (
                    <video src={post.media_url} controls className="w-full rounded-xl border border-purple-200 max-h-80" />
                  )}
                </div>
              )}

              {post.video_url && <VideoEmbed url={post.video_url} />}

              <p className="text-sm text-slate-600 leading-relaxed mb-4">{post.description}</p>

              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { key: 'shopee_link', label: 'Shopee', cls: 'badge-shopee' },
                  { key: 'tokopedia_link', label: 'Tokopedia', cls: 'badge-tokopedia' },
                  { key: 'lazada_link', label: 'Lazada', cls: 'badge-lazada' },
                  { key: 'affiliate_link', label: 'Affiliate Link', cls: 'btn-primary inline-flex items-center gap-1.5 text-xs px-3 py-1.5' },
                ].filter(l => post[l.key]).map(l => (
                  <a key={l.key} href={post[l.key]} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackClick(post.id)} className={l.cls}>
                    <ExternalLink size={10} />
                    {l.label}
                  </a>
                ))}

                {post.clicks > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MousePointerClick size={13} />
                    {post.clicks} klik
                  </span>
                )}

                <span className="text-xs text-slate-400 ml-auto" title={new Date(post.created_at).toLocaleString()}>
                  {timeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-4">
            <MessageSquare size={14} />
            {comments.length} Komentar
          </h2>

          <form onSubmit={handleComment} className="card p-4 mb-4">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Bagikan pengalamanmu atau tanya sesuatu..."
              rows={3}
              className="input resize-none"
            />
            {commentError && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={11} /> {commentError}
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <button type="submit" className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!commentText.trim() || submitting}>
                {submitting ? 'Mengirim…' : 'Komentar'}
              </button>
            </div>
          </form>

          {commentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="card p-4 animate-pulse space-y-2">
                  <div className="h-3 bg-purple-100 rounded w-1/4" />
                  <div className="h-3 bg-purple-100 rounded w-full" />
                  <div className="h-3 bg-purple-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">Belum ada komentar. Mulai percakapan.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="card p-4">
                  <p className="text-xs text-slate-400 mb-2">{timeAgo(c.created_at)}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
