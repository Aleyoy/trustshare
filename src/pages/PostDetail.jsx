import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowUp, ArrowLeft, ExternalLink, MessageSquare, AlertCircle, MousePointerClick, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import { useComments } from '../hooks/useComments'
import { CATEGORIES } from '../data/categories'

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

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to feed
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
                <ArrowUp size={20} className={post.user_voted ? 'text-orange-400' : 'group-hover:text-orange-400 transition-colors'} />
              </button>
              <span className={`text-base font-bold tabular-nums ${post.user_voted ? 'text-orange-400' : 'text-zinc-300'}`}>
                {post.upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {category && category.id !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 mb-2">
                  {category.emoji} {category.label}
                </span>
              )}

              <h1 className="text-lg font-semibold text-zinc-100 leading-snug mb-1">{post.title}</h1>

              {post.author && (
                <Link
                  to={`/profile/${post.author.id}`}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
                >
                  by {post.author.username ?? 'anon'}
                  {post.author.is_verified && <BadgeCheck size={11} className="text-orange-400" />}
                </Link>
              )}

              {post.video_url && <VideoEmbed url={post.video_url} />}

              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{post.description}</p>

              <div className="flex items-center gap-3 flex-wrap">
                {post.affiliate_link && (
                  <a
                    href={post.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(post.id)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink size={13} />
                    Affiliate Link
                  </a>
                )}

                {post.clicks > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MousePointerClick size={13} />
                    {post.clicks} {post.clicks === 1 ? 'click' : 'clicks'}
                  </span>
                )}

                <span className="text-xs text-zinc-500 ml-auto">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-4">
            <MessageSquare size={14} />
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          <form onSubmit={handleComment} className="card p-4 mb-4">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your experience or ask a question..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none transition-colors"
            />
            {commentError && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={11} /> {commentError}
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </form>

          {commentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="card p-4 animate-pulse space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">No comments yet. Start the conversation.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="card p-4">
                  <p className="text-xs text-zinc-500 mb-2">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
