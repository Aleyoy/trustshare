import { supabase } from './supabase'

export async function fetchTopPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('upvotes', { ascending: false })

  if (error) throw error
  return data
}

export async function upvotePost(postId) {
  const { error } = await supabase.rpc('increment_upvotes', { post_id: postId })
  if (error) throw error
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
