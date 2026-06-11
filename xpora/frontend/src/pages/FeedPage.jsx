import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Navbar, VoteButtons, ReportModal, useToast } from '../components/UI'

const CATS = [
  { emoji: '🌍', label: 'All', val: 'all' },
  { emoji: '🌙', label: 'Dreams', val: 'Dreams' },
  { emoji: '✈️', label: 'Travel', val: 'Travel' },
  { emoji: '🌱', label: 'Life', val: 'Life' },
  { emoji: '💡', label: 'Ideas', val: 'Ideas' },
  { emoji: '💼', label: 'Career', val: 'Career' },
  { emoji: '🍛', label: 'Food', val: 'Food' },
  { emoji: '💻', label: 'Tech', val: 'Tech' },
  { emoji: '❤️', label: 'Love', val: 'Love' },
  { emoji: '🎭', label: 'Culture', val: 'Culture' },
]

const TRENDING = ['#dreams', '#India', '#travel', '#life', '#career', '#food', '#startup', '#tech']
const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }

export default function FeedPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('all')
  const [bookmarks, setBookmarks] = useState(new Set())
  const [userVotes, setUserVotes] = useState({})
  const [reportPost, setReportPost] = useState(null)
  const [navItem, setNavItem] = useState('home')

  useEffect(() => { fetchPosts(); fetchBookmarks(); fetchVotes() }, [activeTag])

  async function fetchPosts() {
    setLoading(true)
    let q = supabase
      .from('posts')
      .select('id,title,excerpt,tag,created_at,upvotes,downvotes,comment_count,profiles(id,username,full_name,avatar_url)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (activeTag !== 'all') q = q.eq('tag', activeTag)
    const { data } = await q.limit(30)
    setPosts(data || [])
    setLoading(false)
  }

  async function fetchBookmarks() {
    if (!user) return
    const { data } = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
    setBookmarks(new Set((data || []).map(b => b.post_id)))
  }

  async function fetchVotes() {
    if (!user) return
    const { data } = await supabase.from('votes').select('post_id,vote_type').eq('user_id', user.id)
    const v = {}; (data || []).forEach(x => v[x.post_id] = x.vote_type)
    setUserVotes(v)
  }

  async function toggleBookmark(postId) {
    if (bookmarks.has(postId)) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: postId })
      setBookmarks(b => { const n = new Set(b); n.delete(postId); return n })
      toast('Removed from bookmarks')
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
      setBookmarks(b => new Set([...b, postId]))
      toast('Saved to bookmarks! 🔖', 'success')
    }
  }

  async function fetchBookmarkedPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('bookmarks').select('post_id, posts(id,title,excerpt,tag,created_at,upvotes,comment_count,profiles(username,full_name))')
      .eq('user_id', user.id)
    setPosts((data || []).map(b => b.posts).filter(Boolean))
    setLoading(false)
  }

  function handleNav(key) {
    setNavItem(key)
    if (key === 'bookmarks') fetchBookmarkedPosts()
    else fetchPosts()
  }

  const timeAgo = (d) => {
    const s = Math.floor((new Date() - new Date(d)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return Math.floor(s/60) + 'm ago'
    if (s < 86400) return Math.floor(s/3600) + 'h ago'
    return Math.floor(s/86400) + 'd ago'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="feed-layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-profile">
            <div className="avatar" style={{ width: 42, height: 42, fontSize: 16 }} onClick={() => navigate(`/profile/${profile?.username}`)}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.full_name?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <div className="sidebar-name">{profile?.full_name}</div>
              <div className="sidebar-handle">@{profile?.username}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
            {[
              { key: 'home', icon: '🏠', label: 'Home' },
              { key: 'explore', icon: '🔍', label: 'Explore' },
              { key: 'bookmarks', icon: '🔖', label: 'Bookmarks' },
            ].map(item => (
              <div key={item.key} className={`sidebar-link ${navItem === item.key ? 'active' : ''}`} onClick={() => handleNav(item.key)}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
            <div className="sidebar-link" onClick={() => navigate(`/profile/${profile?.username}`)}>
              <span>👤</span> Profile
            </div>
            {profile?.role === 'admin' && (
              <div className="sidebar-link" onClick={() => navigate('/admin')}>
                <span>⚙️</span> Admin Panel
              </div>
            )}
          </div>

          <div className="sidebar-section">Categories</div>
          {CATS.map(c => (
            <div key={c.val} className={`sidebar-cat ${activeTag === c.val ? 'active' : ''}`} onClick={() => { setActiveTag(c.val); setNavItem('home') }}>
              <span>{c.emoji}</span> {c.label}
            </div>
          ))}
        </div>

        {/* MAIN FEED */}
        <div className="feed-main">
          <h1 className="feed-title">
            {navItem === 'bookmarks' ? '🔖 Bookmarks' : activeTag === 'all' ? 'Your feed' : `${EMOJIS[activeTag]} ${activeTag}`}
          </h1>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <h3>No stories yet</h3>
              <p style={{ marginBottom: 20 }}>Be the first to share in this category!</p>
              <button className="btn btn-primary" onClick={() => navigate('/write')}>✍️ Write first story</button>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-card-header">
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }} onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
                    {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" /> : (post.profiles?.full_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div className="post-author">{post.profiles?.full_name}</div>
                    <div className="post-handle">@{post.profiles?.username} · {timeAgo(post.created_at)}</div>
                  </div>
                  <div className="post-tag">
                    <span className="tag-badge">{EMOJIS[post.tag] || '✨'} {post.tag}</span>
                  </div>
                </div>

                <div className="post-title" onClick={() => navigate(`/story/${post.id}`)}>{post.title}</div>
                <div className="post-excerpt" onClick={() => navigate(`/story/${post.id}`)}>{post.excerpt}</div>

                <div className="post-footer">
                  <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} userVote={userVotes[post.id]} />
                  <span className="post-meta">{post.comment_count || 0} comments</span>
                  <div className="post-actions">
                    <button className="action-btn" onClick={() => navigate(`/story/${post.id}`)}>💬 Read</button>
                    <button className={`action-btn ${bookmarks.has(post.id) ? 'active' : ''}`} onClick={() => toggleBookmark(post.id)}>
                      {bookmarks.has(post.id) ? '🔖 Saved' : '🔖 Save'}
                    </button>
                    <button className="action-btn" onClick={() => { navigator.clipboard?.writeText(window.location.origin + '/story/' + post.id); toast('Link copied!') }}>↗ Share</button>
                    <button className="action-btn" onClick={() => setReportPost(post.id)}>⚑ Report</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="feed-right">
          <div className="widget-card">
            <div className="widget-title">✍️ Share your story</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>Had a dream last night? A trip that changed you? Write it.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/write')}>Start writing</button>
          </div>
          <div className="widget-card">
            <div className="widget-title">Trending tags</div>
            {TRENDING.map(t => (
              <span key={t} className="trending-tag" onClick={() => { setActiveTag(t.slice(1)); setNavItem('explore') }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {reportPost && <ReportModal open={!!reportPost} onClose={() => setReportPost(null)} postId={reportPost} />}
    </div>
  )
}
