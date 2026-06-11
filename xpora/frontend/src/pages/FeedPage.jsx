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
const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }
const TRENDING = ['#dreams','#India','#travel','#life','#career','#food','#startup','#tech']

function timeAgo(d) {
  const s = Math.floor((new Date() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s/60) + 'm ago'
  if (s < 86400) return Math.floor(s/3600) + 'h ago'
  return Math.floor(s/86400) + 'd ago'
}

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
  const [sortBy, setSortBy] = useState('new')

  useEffect(() => { fetchPosts(); fetchBookmarks(); fetchVotes() }, [activeTag, sortBy])

  async function fetchPosts() {
    setLoading(true)
    let q = supabase.from('posts')
      .select('id,title,excerpt,tag,created_at,upvotes,downvotes,comment_count,cover_url,profiles(id,username,full_name,avatar_url)')
      .eq('status', 'approved')
    if (activeTag !== 'all') q = q.eq('tag', activeTag)
    if (sortBy === 'top') q = q.order('upvotes', { ascending: false })
    else q = q.order('created_at', { ascending: false })
    const { data } = await q.limit(40)
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

  async function toggleBookmark(e, postId) {
    e.stopPropagation()
    if (bookmarks.has(postId)) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: postId })
      setBookmarks(b => { const n = new Set(b); n.delete(postId); return n })
      toast('Removed from bookmarks')
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
      setBookmarks(b => new Set([...b, postId]))
      toast('Saved! 🔖', 'success')
    }
  }

  async function fetchBookmarkedPosts() {
    setLoading(true)
    const { data } = await supabase.from('bookmarks')
      .select('post_id, posts(id,title,excerpt,tag,created_at,upvotes,comment_count,cover_url,profiles(username,full_name,avatar_url))')
      .eq('user_id', user.id)
    setPosts((data || []).map(b => b.posts).filter(Boolean))
    setLoading(false)
  }

  function handleNav(key) {
    setNavItem(key)
    if (key === 'bookmarks') fetchBookmarkedPosts()
    else fetchPosts()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', width: '100%', padding: '20px 16px', gap: 20 }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', overflow: 'hidden', marginBottom: 12 }}>
            {/* Profile card */}
            <div style={{ background: 'linear-gradient(135deg,#F06A25,#E8472B)', height: 60, position: 'relative' }} />
            <div style={{ padding: '0 16px 16px', marginTop: -28 }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, border: '3px solid #fff', cursor: 'pointer' }} onClick={() => navigate(`/profile/${profile?.username}`)}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.full_name?.[0]||'U').toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{profile?.full_name}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>@{profile?.username}</div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: 13 }} onClick={() => navigate('/write')}>
                ✍️ Write a story
              </button>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: '8px 0', marginBottom: 12 }}>
            {[
              { key:'home', icon:'🏠', label:'Home Feed' },
              { key:'bookmarks', icon:'🔖', label:'Bookmarks' },
              { key:'profile', icon:'👤', label:'My Profile' },
            ].map(item => (
              <div key={item.key}
                onClick={() => item.key === 'profile' ? navigate(`/profile/${profile?.username}`) : handleNav(item.key)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', background: navItem===item.key ? '#FEF0E8' : 'transparent', color: navItem===item.key ? '#C4511A' : '#444', fontSize: 14, fontWeight: navItem===item.key ? 600 : 400 }}>
                <span>{item.icon}</span>{item.label}
              </div>
            ))}
            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <div onClick={() => navigate('/admin')}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', color:'#C4511A', fontSize:14, fontWeight:600 }}>
                <span>⚙️</span> Admin Panel
              </div>
            )}
          </div>

          {/* Categories */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: '12px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1, padding: '0 16px', marginBottom: 8, textTransform: 'uppercase' }}>Categories</div>
            {CATS.map(c => (
              <div key={c.val} onClick={() => { setActiveTag(c.val); setNavItem('home') }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', cursor:'pointer', background: activeTag===c.val ? '#FEF0E8' : 'transparent', color: activeTag===c.val ? '#C4511A' : '#555', fontSize:13, fontWeight: activeTag===c.val ? 600 : 400 }}>
                <span>{c.emoji}</span>{c.label}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN FEED */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sort bar */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>Sort by:</span>
            {['new','top'].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid', fontSize: 13, cursor: 'pointer', fontWeight: sortBy===s ? 600 : 400, background: sortBy===s ? '#F06A25' : '#fff', color: sortBy===s ? '#fff' : '#555', borderColor: sortBy===s ? '#F06A25' : '#ddd' }}>
                {s === 'new' ? '🆕 New' : '🔥 Top'}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#999' }}>{posts.length} stories</span>
          </div>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>No stories yet</h3>
              <p style={{ color: '#666', marginBottom: 20 }}>Be the first to share!</p>
              <button className="btn btn-primary" onClick={() => navigate('/write')}>✍️ Write first story</button>
            </div>
          ) : posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', marginBottom: 10, overflow: 'hidden' }}>
              {/* Cover image if exists */}
              {post.cover_url && (
                <img src={post.cover_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', cursor: 'pointer' }} onClick={() => navigate(`/story/${post.id}`)} />
              )}
              <div style={{ padding: '14px 16px' }}>
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
                    {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" /> : (post.profiles?.full_name?.[0]||'U').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.profiles?.username}`)}>
                      {post.profiles?.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>@{post.profiles?.username} · {timeAgo(post.created_at)}</div>
                  </div>
                  <span className="tag-badge" style={{ marginLeft: 'auto' }}>{EMOJIS[post.tag]} {post.tag}</span>
                </div>

                {/* Title & excerpt */}
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, marginBottom: 6, cursor: 'pointer', lineHeight: 1.3 }} onClick={() => navigate(`/story/${post.id}`)}>
                  {post.title}
                </h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate(`/story/${post.id}`)}>
                  {post.excerpt}
                </p>

                {/* Action bar — Quora style */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 10, borderTop: '1px solid #F0F0F0' }}>
                  <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} userVote={userVotes[post.id]} />
                  
                  <button onClick={() => navigate(`/story/${post.id}`)}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:20, border:'1px solid #E5E5E5', background:'#fff', fontSize:13, color:'#555', cursor:'pointer', marginLeft:4 }}>
                    💬 {post.comment_count || 0}
                  </button>

                  <button onClick={(e) => toggleBookmark(e, post.id)}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:20, border:'1px solid #E5E5E5', background: bookmarks.has(post.id) ? '#FEF0E8' : '#fff', fontSize:13, color: bookmarks.has(post.id) ? '#C4511A' : '#555', cursor:'pointer' }}>
                    {bookmarks.has(post.id) ? '🔖 Saved' : '🔖 Save'}
                  </button>

                  <button onClick={() => { navigator.clipboard?.writeText(window.location.origin+'/story/'+post.id); toast('Link copied! 🔗') }}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:20, border:'1px solid #E5E5E5', background:'#fff', fontSize:13, color:'#555', cursor:'pointer' }}>
                    ↗ Share
                  </button>

                  <button onClick={() => setReportPost(post.id)}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:20, border:'none', background:'transparent', fontSize:13, color:'#aaa', cursor:'pointer', marginLeft:'auto' }}>
                    ⚑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ width: 260, flexShrink: 0 }}>
          {/* Write box */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.full_name?.[0]||'U').toUpperCase()}
              </div>
              <div onClick={() => navigate('/write')} style={{ flex:1, padding:'8px 14px', background:'#F5F5F5', borderRadius:20, fontSize:13, color:'#999', cursor:'pointer' }}>
                What did you dream last night?
              </div>
            </div>
            <div style={{ display:'flex', gap:8, borderTop:'1px solid #F0F0F0', paddingTop:10 }}>
              <button onClick={() => navigate('/write')} style={{ flex:1, padding:'7px', border:'none', background:'transparent', fontSize:13, color:'#555', cursor:'pointer', borderRadius:6 }}>✍️ Write</button>
            </div>
          </div>

          {/* Trending */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🔥 Trending tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TRENDING.map(t => (
                <span key={t} onClick={() => setActiveTag(t.slice(1))}
                  style={{ background:'#F5F5F5', padding:'4px 12px', borderRadius:20, fontSize:13, cursor:'pointer', color:'#555' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🌙 About Xpora</div>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              A platform to share your dreams, travels, ideas, and real life stories. Join thousands of dreamers.
            </p>
          </div>
        </div>
      </div>

      {reportPost && <ReportModal open={!!reportPost} onClose={() => setReportPost(null)} postId={reportPost} />}
    </div>
  )
}
