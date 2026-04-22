import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { ArrowLeft, BadgeCheck, MousePointerClick, ArrowUp, MessageSquare, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { fetchProfile, fetchUserPosts, updateProfile } from '../lib/db'
import PostCard from '../components/PostCard'
import { usePosts } from '../hooks/usePosts'

export default function Profile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { addToast } = useToast()
  const { upvotePost, trackClick } = usePosts()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editing, setEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)

  const isOwn = user?.id === userId

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [prof, userPosts] = await Promise.all([
          fetchProfile(userId),
          fetchUserPosts(userId),
        ])
        setProfile(prof)
        setPosts(userPosts)
        setEditUsername(prof.username ?? '')
        setEditBio(prof.bio ?? '')
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvotes ?? 0), 0)
  const totalClicks = posts.reduce((sum, p) => sum + (p.clicks ?? 0), 0)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProfile({ username: editUsername.trim(), bio: editBio.trim() })
      setProfile(updated)
      setEditing(false)
      addToast('Profile updated', 'success')
    } catch (e) {
      addToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditUsername(profile?.username ?? '')
    setEditBio(profile?.bio ?? '')
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-900 rounded-xl" />
          <div className="h-8 bg-zinc-900 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-400 text-sm">Profile not found.</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
    )
  }

  const displayName = profile.username || 'Anonymous'
  const avatarLetter = displayName[0].toUpperCase()

  return (
    <>
      <Helmet>
        <title>{displayName} — TrustShare</title>
        <meta name="description" content={profile.bio || `${displayName}'s affiliate posts on TrustShare`} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to feed
        </Link>

        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-orange-400">{avatarLetter}</span>
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="Username"
                    maxLength={32}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Short bio (optional)"
                    rows={2}
                    maxLength={200}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !editUsername.trim()}
                      className="btn-primary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check size={13} />
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={handleCancel} className="btn-ghost flex items-center gap-1.5">
                      <X size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-base font-bold text-zinc-100">{displayName}</h1>
                    {profile.is_verified && (
                      <BadgeCheck size={16} className="text-orange-400 shrink-0" title="Verified affiliator" />
                    )}
                    {isOwn && (
                      <button
                        onClick={() => setEditing(true)}
                        className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Edit profile"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  {profile.bio ? (
                    <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio}</p>
                  ) : isOwn ? (
                    <p className="text-sm text-zinc-600 italic">Add a bio to introduce yourself</p>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-100 tabular-nums">{posts.length}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-400 tabular-nums flex items-center justify-center gap-1">
                <ArrowUp size={14} />
                {totalUpvotes}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-100 tabular-nums flex items-center justify-center gap-1">
                <MousePointerClick size={14} />
                {totalClicks}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Affiliate Clicks</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
          <MessageSquare size={14} />
          {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
        </h2>

        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-sm text-zinc-500">No posts yet.</p>
            {isOwn && (
              <Link to="/submit" className="btn-primary inline-flex mt-4">Submit your first post</Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onUpvote={upvotePost} onClickAffiliate={trackClick} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
