import { useState, useEffect, useCallback } from 'react'
import { fetchTopPosts, upvotePost as dbUpvote, createPost as dbCreatePost } from '../lib/db'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTopPosts()
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function upvotePost(postId) {
    // Optimistic update
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p)
    )
    try {
      await dbUpvote(postId)
    } catch {
      // Rollback on failure
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes - 1 } : p)
      )
    }
  }

  async function createPost(data) {
    const post = await dbCreatePost(data)
    setPosts(prev => [post, ...prev])
    return post
  }

  return { posts, loading, error, upvotePost, createPost, reload: load }
}
