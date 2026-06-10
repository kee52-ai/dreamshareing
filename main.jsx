import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// ── TOAST ──────────────────────────────────────────────
const ToastCtx = createContext({})
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const show = (msg, type = 'default') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast show ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ── SVG LOGO ───────────────────────────────────────────
export function XporaLogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="xlg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F06A25"/>
          <stop offset="100%" stopColor="#E8472B"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#xlg)"/>
      <path d="M38 33 C40 24 56 20 63 30 C70 40 66 57 50 63 C34 57 30 42 38 33Z" fill="none" stroke="white" strokeWidth="3.5" opacity="0.95"/>
      <circle cx="70" cy="25" r="4" fill="white" opacity="0.95"/>
      <circle cx="60" cy="17" r="2.5" fill="white" opacity="0.75"/>
      <circle cx="78" cy="35" r="2" fill="white" opacity="0.6"/>
    </svg>
  )
}

// ── MODAL ──────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {title && <div className="modal-title">{title}</div>}
        {subtitle && <div className="modal-sub">{subtitle}</div>}
        {children}
      </div>
    </div>
  )
}

// ── NAVBAR ─────────────────────────────────────────────
export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => { if (user) fetchNotifs() }, [user])

  async function fetchNotifs() {
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    setNotifs(data || [])
    setUnreadCount((data || []).filter(n => !n.is_read).length)
  }

  async function handleSearch(q) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const { data } = await supabase.from('posts').select('id,title,tag,profiles(username)')
      .ilike('title', `%${q}%`).eq('status', 'approved').limit(6)
    setResults(data || [])
    setShowResults(true)
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setUnreadCount(0)
    setNotifs(n => n.map(x => ({ ...x, is_read: true })))
  }

  return (
    <nav className="main-nav">
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate(user ? '/feed' : '/')}>
        <XporaLogoMark size={32} />
        <span className="nav-logo" style={{ margin: 0 }}>X<span>p</span>ora</span>
      </div>

      {user && (
        <div className="nav-search" style={{ position: 'relative' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            placeholder="Search dreams, stories, people…"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && results.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 300, marginTop: 6 }}>
              {results.map(r => (
                <div key={r.id} className="search-result" onClick={() => { navigate(`/story/${r.id}`); setShowResults(false); setQuery('') }}>
                  <span className="tag-badge">{r.tag}</span>
                  <span style={{ fontSize: 14, flex: 1 }}>{r.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="nav-right">
        {!user ? (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/signin')}>Sign in</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get started</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/write')}>✍️ Write</button>
            <div style={{ position: 'relative' }}>
              <button className="notif-btn" onClick={() => { setShowNotifs(!showNotifs); if (unreadCount > 0) markAllRead() }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && <span className="notif-dot"/>}
              </button>
              {showNotifs && (
                <div className="notif-panel">
                  <div className="notif-header">
                    Notifications
                    <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
                  </div>
                  {notifs.length === 0
                    ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No notifications yet</div>
                    : notifs.map(n => (
                      <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                        <div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>⚙️ Admin</button>
            )}
            <div className="avatar" onClick={() => navigate(`/profile/${profile?.username}`)}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" /> : (profile?.full_name?.[0] || 'U').toUpperCase()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={signOut} title="Sign out">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

// ── VOTE BUTTONS ───────────────────────────────────────
export function VoteButtons({ postId, upvotes = 0, downvotes = 0, userVote }) {
  const { user } = useAuth()
  const [vote, setVote] = useState(userVote)
  const [ups, setUps] = useState(upvotes)
  const [downs, setDowns] = useState(downvotes)

  async function castVote(type) {
    if (!user) return
    if (vote === type) {
      await supabase.from('votes').delete().match({ user_id: user.id, post_id: postId })
      setVote(null)
      if (type === 'up') setUps(u => u - 1); else setDowns(d => d - 1)
    } else {
      await supabase.from('votes').upsert({ user_id: user.id, post_id: postId, vote_type: type })
      if (vote === 'up') setUps(u => u - 1)
      if (vote === 'down') setDowns(d => d - 1)
      if (type === 'up') setUps(u => u + 1); else setDowns(d => d + 1)
      setVote(type)
    }
  }

  return (
    <div className="vote-group">
      <button className={`vote-btn ${vote === 'up' ? 'active' : ''}`} onClick={() => castVote('up')}>▲</button>
      <span className="vote-count">{ups - downs}</span>
      <button className={`vote-btn ${vote === 'down' ? 'downvoted' : ''}`} onClick={() => castVote('down')}>▼</button>
    </div>
  )
}

// ── REPORT MODAL ───────────────────────────────────────
export function ReportModal({ open, onClose, postId, commentId, reportedUserId }) {
  const { user } = useAuth()
  const toast = useToast()
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id, post_id: postId, comment_id: commentId,
      reported_user_id: reportedUserId, reason, details
    })
    setLoading(false)
    if (error) { toast('Failed to submit report', 'error'); return }
    toast('Report submitted. Thank you.', 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Report content" subtitle="Help us keep Xpora safe.">
      <select className="form-input" value={reason} onChange={e => setReason(e.target.value)}>
        <option value="spam">Spam</option>
        <option value="harassment">Harassment</option>
        <option value="fake_information">Fake Information</option>
        <option value="hate_speech">Hate Speech</option>
        <option value="other">Other</option>
      </select>
      <textarea className="comment-box" placeholder="Any additional details (optional)" value={details} onChange={e => setDetails(e.target.value)} />
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit report'}
      </button>
    </Modal>
  )
}
