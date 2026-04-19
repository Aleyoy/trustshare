import { useState, useEffect } from 'react'
import { fetchComments, createComment as dbCreateComment } from '../lib/db'

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!postId) return
    setLoading(true)
    fetchComments(postId)
      .then(setComments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [postId])

  async function createComment(content) {
    const comment = await dbCreateComment(postId, content)
    setComments(prev => [...prev, comment])
    return comment
  }

  return { comments, loading, error, createComment }
}
