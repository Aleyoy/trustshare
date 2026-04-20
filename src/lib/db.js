import { supabase } from './supabase'

export async function fetchTopPosts(userId = null) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, comment_count:comments(count)')
    .order('upvotes', { ascending: false })

  if (error) throw error

  // Fetch which posts this user has voted on
  let votedIds = new Set()
  if (userId) {
    const { data: votes } = await supabase
      .from('votes')
      .select('post_id')
      .eq('user_id', userId)
    if (votes) votedIds = new Set(votes.map(v => v.post_id))
  }

  return data.map(p => ({
    ...p,
    comment_count: p.comment_count?.[0]?.count ?? 0,
    user_voted: votedIds.has(p.id),
  }))
}

export async function toggleUpvote(postId) {
  const { data, error } = await supabase.rpc('toggle_upvote', { p_post_id: postId })
  if (error) throw error
  return data // { upvotes: number, voted: boolean }
}

export async function createPost(data) {
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title: data.title,
      description: data.description,
      video_url: data.video_url || null,
      affiliate_link: data.affiliate_link || null,
    })
    .select()
    .single()

  if (error) throw error
  return post
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createComment(postId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, content })
    .select()
    .single()

  if (error) throw error
  return data
}
