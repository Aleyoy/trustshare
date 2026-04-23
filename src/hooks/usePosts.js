import { useState, useEffect, useCallback } from 'react'
import { fetchTopPosts, toggleUpvote, trackClick as dbTrackClick, createPost as dbCreatePost, deletePost as dbDeletePost } from '../lib/db'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function usePosts(category = 'all') {
  const { user, setShowAuthModal } = useAuth()
  const { addToast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newCount, setNewCount] = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setNewCount(0)
      const data = await fetchTopPosts(user?.id ?? null, category)
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, category])

  useEffect(() => { load() }, [load])

  // Real-time: watch for new posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        setNewCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function upvotePost(postId) {
    if (!user) {
      setShowAuthModal(true)
      addToast('Sign in to vote', 'info')
      return
    }

    const post = posts.find(p => p.id === postId)
    const wasVoted = post?.user_voted

    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      upvotes: wasVoted ? p.upvotes - 1 : p.upvotes + 1,
      user_voted: !wasVoted,
    } : p))

    try {
      await toggleUpvote(postId)
      addToast(wasVoted ? 'Vote removed' : 'Voted!', 'success')
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        upvotes: wasVoted ? p.upvotes + 1 : p.upvotes - 1,
        user_voted: wasVoted,
      } : p))
      addToast('Failed to vote', 'error')
    }
  }

  function trackClick(postId) {
    // Optimistic click count increment
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, clicks: (p.clicks ?? 0) + 1 } : p))
    dbTrackClick(postId)
  }

  async function createPost(data) {
    const post = await dbCreatePost(data)
    setPosts(prev => [{ ...post, comment_count: 0, user_voted: false, clicks: 0 }, ...prev])
    addToast('Post submitted!', 'success')
    return post
  }

  async function deletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
    try {
      await dbDeletePost(postId)
      addToast('Post dihapus', 'success')
    } catch {
      addToast('Gagal menghapus post', 'error')
      load()
    }
  }

  return { posts, loading, error, newCount, upvotePost, trackClick, createPost, deletePost, reload: load }
}
