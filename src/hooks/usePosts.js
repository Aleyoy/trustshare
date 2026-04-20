import { useState, useEffect, useCallback } from 'react'
import { fetchTopPosts, toggleUpvote, createPost as dbCreatePost } from '../lib/db'
import { useAuth } from '../context/AuthContext'

export function usePosts() {
  const { user, setShowAuthModal } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTopPosts(user?.id ?? null)
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  async function upvotePost(postId) {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    const post = posts.find(p => p.id === postId)
    const wasVoted = post?.user_voted

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      upvotes: wasVoted ? p.upvotes - 1 : p.upvotes + 1,
      user_voted: !wasVoted,
    } : p))

    try {
      await toggleUpvote(postId)
    } catch {
      // Rollback
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        upvotes: wasVoted ? p.upvotes + 1 : p.upvotes - 1,
        user_voted: wasVoted,
      } : p))
    }
  }

  async function createPost(data) {
    const post = await dbCreatePost(data)
    setPosts(prev => [{ ...post, comment_count: 0, user_voted: false }, ...prev])
    return post
  }

  return { posts, loading, error, upvotePost, createPost, reload: load }
}
