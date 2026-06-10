import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Navbar, VoteButtons, ReportModal, useToast } from '../components/UI'

const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }

function renderBody(text) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .split('\n\n').map(p => p.startsWith('<h2') || p.startsWith('<blockquote') ? p : `<p>${p}</p>`).join('')
}

function Comment({ comment, postId, onReplyPosted }) {
  const { user, profile } = useAuth()
  const toast = useToast()
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [replies, setReplies] = useState([])

  useEffect(() => {
    supabase.from('comments').select('*,profiles(username,full_name,avatar_url)')
      .eq('parent_id', comment.id).eq('status', 'approved').order('created_at')
      .then(({ data }) => setReplies(data || []))
  }, [comment.id])

  async function postReply() {
    if (!replyText.trim()) return
    setPosting(true)
    const { error } = await supabase.from('comments').insert({
      post_id: postId, author_id: user.id, parent_id: comment.id, body: replyText.trim()
    })
    setPosting(false)
    if (error) { toast('Failed to post reply', 'error'); return }
    setReplyText(''); setShowReply(false)
    toast('Reply posted!', 'success')
    onReplyPosted()
  }

  const timeAgo = (d) => {
    const s = Math.floor((new Date() - new Date(d)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return Math.floor(s/60) + 'm ago'
    if (s < 86400) return Math.floor(s/3600) + 'h ago'
    return Math.floor(s/86400) + 'd ago'
  }

  return (
    <div className="comment">
      <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>
        {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} alt="" /> : (comment.profiles?.full_name?.[0] || 'U').toUpperCase()}
      </div>
      <div className="comment-body">
        <span className="comment-author-name">{comment.profiles?.full_name}</span>
        <span className="comment-time">{timeAgo(comment.created_at)}</span>
        <div className="comment-text">{comment.body}</div>
        {user && <button className="comment-reply-btn" onClick={() => setShowReply(!showReply)}>↩ Reply</button>}
        {showReply && (
          <div style={{ marginTop: 8 }}>
            <textarea className="comment-box" style={{ minHeight: 60 }} placeholder="Write a reply…" value={replyText} onChange={e => setReplyText(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={postReply} disabled={posting}>{posting ? 'Posting…' : 'Post reply'}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReply(false)}>Cancel</button>
            </div>
          </div>
        )}
        {replies.length > 0 && (
          <div className="nested-comments">
            {replies.map(r => <Comment key={r.id} comment={r} postId={postId} onReplyPosted={onReplyPosted} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StoryPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [userVote, setUserVote] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPost(); fetchComments(); fetchUserVote() }, [id])

  async function fetchPost() {
    const { data } = await supabase.from('posts')
      .select('*,profiles(id,username,full_name,avatar_url)')
      .eq('id', id).single()
    setPost(data); setLoading(false)
    if (data) await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id)
  }

  async function fetchComments() {
    const { data } = await supabase.from('comments')
      .select('*,profiles(username,full_name,avatar_url)')
      .eq('post_id', id).is('parent_id', null).eq('status', 'approved').order('created_at')
    setComments(data || [])
  }

  async function fetchUserVote() {
    if (!user) return
    const { data } = await supabase.from('votes').select('vote_type').match({ user_id: user.id, post_id: id }).single()
    setUserVote(data?.vote_type || null)
  }

  async function postComment() {
    if (!commentText.trim()) return
    setPosting(true)
    const { error } = await supabase.from('comments').insert({ post_id: id, author_id: user.id, body: commentText.trim() })
    setPosting(false)
    if (error) { toast('Failed to post comment', 'error'); return }
    setCommentText('')
    toast('Comment posted!', 'success')
    fetchComments()
  }

  if (loading) return <div><Navbar /><div className="loader"><div className="spinner" /></div></div>
  if (!post) return <div><Navbar /><div className="empty-state"><h3>Story not found</h3><button className="btn btn-primary" onClick={() => navigate('/feed')}>Back to feed</button></div></div>

  const timeAgo = (d) => {
    const s = Math.floor((new Date() - new Date(d)) / 1000)
    if (s < 3600) return Math.floor(s/60) + 'm ago'
    if (s < 86400) return Math.floor(s/3600) + 'h ago'
    return Math.floor(s/86400) + 'd ago'
  }

  return (
    <div>
      <Navbar />
      {post.cover_url && <div style={{ width: '100%', height: 320, overflow: 'hidden' }}><img src={post.cover_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
      <div className="story-page">
        <div className="story-tag-row">
          <span className="tag-badge">{EMOJIS[post.tag]} {post.tag}</span>
        </div>
        <h1 className="story-h1">{post.title}</h1>
        <div className="story-meta-row">
          <div className="avatar" style={{ width: 40, height: 40 }} onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
            {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" /> : (post.profiles?.full_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{post.profiles?.full_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>@{post.profiles?.username} · {timeAgo(post.published_at || post.created_at)} · {post.views || 0} views</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} userVote={userVote} />
            <button className="action-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Link copied!') }}>↗ Share</button>
            <button className="action-btn" onClick={() => setShowReport(true)}>⚑ Report</button>
          </div>
        </div>

        <div className="story-body" dangerouslySetInnerHTML={{ __html: renderBody(post.body) }} />

        <div className="comments-section">
          <h3 className="comments-title">{comments.length} comment{comments.length !== 1 ? 's' : ''}</h3>
          {user ? (
            <>
              <textarea className="comment-box" placeholder="Share your thoughts…" value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button className="btn btn-primary" style={{ marginBottom: 28 }} onClick={postComment} disabled={posting || !commentText.trim()}>
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </>
          ) : (
            <p style={{ marginBottom: 20, color: 'var(--text3)', fontSize: 14 }}>
              <span style={{ color: 'var(--orange)', cursor: 'pointer' }} onClick={() => navigate('/signin')}>Sign in</span> to leave a comment
            </p>
          )}
          {comments.map(c => (
            c.status === 'removed'
              ? <div key={c.id} className="removed-notice">This comment was removed for violating community guidelines.</div>
              : <Comment key={c.id} comment={c} postId={post.id} onReplyPosted={fetchComments} />
          ))}
        </div>
      </div>
      <ReportModal open={showReport} onClose={() => setShowReport(false)} postId={post.id} />
    </div>
  )
}
