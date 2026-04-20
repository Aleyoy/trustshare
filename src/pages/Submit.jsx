import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'

export default function Submit() {
  const { createPost } = usePosts()
  const { user, setShowAuthModal } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    affiliate_link: '',
  })

  // Redirect to auth modal if not logged in
  useEffect(() => {
    if (!user) setShowAuthModal(true)
  }, [user, setShowAuthModal])

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createPost(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const valid = form.title.trim() && form.description.trim()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock size={32} className="text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-sm mb-4">You need to sign in to submit a review.</p>
        <button onClick={() => setShowAuthModal(true)} className="btn-primary">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <h1 className="text-xl font-bold text-zinc-100 mb-1">Submit a Review</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Share an honest product review with your affiliate link.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Product name — honest one-line take"
            maxLength={120}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe your honest experience. Include pros, cons, and how you use it."
            rows={5}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Video URL <span className="text-zinc-600 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={form.video_url}
            onChange={e => set('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Affiliate Link <span className="text-zinc-600 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={form.affiliate_link}
            onChange={e => set('affiliate_link', e.target.value)}
            placeholder="https://yourlink.com/ref=code"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="flex items-start gap-3 bg-zinc-950 border border-zinc-800 rounded-md p-3">
          <input type="checkbox" id="disclose" required className="mt-0.5 accent-orange-500" />
          <label htmlFor="disclose" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
            I confirm this post contains an affiliate link and I may earn a commission. I've disclosed my relationship with the brand honestly.
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-md px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!valid || submitting}
          className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Post'}
        </button>
      </form>
    </div>
  )
}
