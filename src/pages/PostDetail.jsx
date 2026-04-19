import { useParams, Link } from 'react-router-dom'
import { ArrowUp, ArrowLeft, ExternalLink, MessageSquare, AlertCircle, Play } from 'lucide-react'
import { useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import { useComments } from '../hooks/useComments'

export default function PostDetail() {
  const { id } = useParams()
  const { posts, upvotePost } = usePosts()
  const { comments, loading: commentsLoading, createComment } = useComments(id)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)

  const post = posts.find(p => p.id === id)

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      {/* Post */}
      <article className="card p-6 mb-6">
        <div className="flex gap-4">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              className="vote-btn group"
              onClick={() => upvotePost(post.id)}
              aria-label="Upvote"
            >
              <ArrowUp size={20} className="group-hover:text-orange-400 transition-colors" />
            </button>
            <span className="text-base font-bold tabular-nums text-zinc-300">{post.upvotes}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-zinc-100 leading-snug mb-3">{post.title}</h1>

            {/* Video embed */}
            {post.video_url && (
              <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video flex items-center justify-center">
                <a
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Play size={36} />
                  <span className="text-xs">Watch video</span>
                </a>
              </div>
            )}

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">{post.description}</p>

            <div className="flex items-center gap-3 flex-wrap">
              {post.affiliate_link && (
                <a
                  href={post.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink size={13} />
                  Affiliate Link
                </a>
              )}
              <span className="text-xs text-zinc-500">
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

        {/* Comment form */}
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

        {/* Comment list */}
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
  )
}
