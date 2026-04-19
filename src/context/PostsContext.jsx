import { createContext, useContext, useState } from 'react'
import { posts as initialPosts } from '../data/mockData'

const PostsContext = createContext(null)

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts)

  function vote(postId, direction) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      if (p.userVote === direction) {
        return { ...p, votes: p.votes - 1, userVote: null }
      }
      const delta = p.userVote ? 2 : 1
      return { ...p, votes: direction === 'up' ? p.votes + delta : p.votes - delta, userVote: direction }
    }))
  }

  function addPost(post) {
    setPosts(prev => [{ ...post, id: Date.now(), votes: 1, comments: 0, timeAgo: 'just now', userVote: null }, ...prev])
  }

  return (
    <PostsContext.Provider value={{ posts, vote, addPost }}>
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  return useContext(PostsContext)
}
