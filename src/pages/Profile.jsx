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
          <div className="h-24 bg-white rounded-xl border border-purple-100" />
          <div className="h-8 bg-white rounded-xl border border-purple-100 w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-purple-100" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-sm">Profil tidak ditemukan.</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Kembali
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
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#3C3489] transition-colors mb-6">
          <ArrowLeft size={14} />
          Kembali ke feed
        </Link>

        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#3C3489] flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-amber-400">{avatarLetter}</span>
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)}
                    placeholder="Username" maxLength={32} className="input" />
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                    placeholder="Bio singkat (opsional)" rows={2} maxLength={200} className="input resize-none" />
                  <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={saving || !editUsername.trim()}
                      className="btn-primary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Check size={13} />
                      {saving ? 'Menyimpan…' : 'Simpan'}
                    </button>
                    <button onClick={handleCancel} className="btn-ghost flex items-center gap-1.5">
                      <X size={13} />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-base font-bold text-[#1E1B4B]">{displayName}</h1>
                    {profile.is_verified && (
                      <BadgeCheck size={16} className="text-amber-500 shrink-0" title="Affiliator terverifikasi" />
                    )}
                    {isOwn && (
                      <button onClick={() => setEditing(true)} className="ml-1 text-slate-400 hover:text-[#3C3489] transition-colors" title="Edit profil">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  {profile.bio ? (
                    <p className="text-sm text-slate-500 leading-relaxed">{profile.bio}</p>
                  ) : isOwn ? (
                    <p className="text-sm text-slate-400 italic">Tambahkan bio untuk memperkenalkan dirimu</p>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 pt-4 border-t border-purple-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#1E1B4B] tabular-nums">{posts.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Post</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-500 tabular-nums flex items-center justify-center gap-1">
                <ArrowUp size={14} />
                {totalUpvotes}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Upvote</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#1E1B4B] tabular-nums flex items-center justify-center gap-1">
                <MousePointerClick size={14} />
                {totalClicks}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Klik Afiliasi</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <h2 className="text-sm font-semibold text-[#1E1B4B] mb-3 flex items-center gap-2">
          <MessageSquare size={14} />
          {posts.length} Post
        </h2>

        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-sm text-slate-400">Belum ada post.</p>
            {isOwn && (
              <Link to="/submit" className="btn-primary inline-flex mt-4">Submit post pertamamu</Link>
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
