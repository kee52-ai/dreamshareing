import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/UI'

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'stories', label: '📝 All Stories' },
  { key: 'users', label: '👥 Users' },
  { key: 'comments', label: '💬 Comments' },
  { key: 'reports', label: '⚑ Reports' },
  { key: 'logs', label: '📋 Logs' },
]

export default function AdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchTab(tab) }, [tab])

  async function fetchTab(t) {
    setLoading(true)
    if (t === 'dashboard') {
      const [posts, users, comments, reports, pending] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      setStats({ posts: posts.count || 0, users: users.count || 0, comments: comments.count || 0, reports: reports.count || 0, pending: pending.count || 0 })
    } else if (t === 'pending') {
      const { data: d } = await supabase.from('posts').select('*,profiles(username,full_name)').eq('status', 'pending').order('created_at', { ascending: false })
      setData(d || [])
    } else if (t === 'stories') {
      const { data: d } = await supabase.from('posts').select('*,profiles(username,full_name)').order('created_at', { ascending: false }).limit(50)
      setData(d || [])
    } else if (t === 'users') {
      const { data: d } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      setData(d || [])
    } else if (t === 'comments') {
      const { data: d } = await supabase.from('comments').select('*,profiles(username,full_name),posts(title)').order('created_at', { ascending: false }).limit(50)
      setData(d || [])
    } else if (t === 'reports') {
      const { data: d } = await supabase.from('reports').select('*,profiles(username),posts(title)').order('created_at', { ascending: false })
      setData(d || [])
    } else if (t === 'logs') {
      const { data: d } = await supabase.from('moderation_logs').select('*,profiles(username)').order('created_at', { ascending: false }).limit(50)
      setData(d || [])
    }
    setLoading(false)
  }

  async function approvePost(id) {
    await supabase.from('posts').update({ status: 'approved' }).eq('id', id)
    await logAction('approve_post', 'post', id)
    toast('Post approved ✓', 'success'); fetchTab(tab)
  }

  async function rejectPost(id, reason = 'Violates community guidelines') {
    await supabase.from('posts').update({ status: 'rejected', moderation_reason: reason }).eq('id', id)
    await logAction('reject_post', 'post', id, reason)
    toast('Post rejected', 'error'); fetchTab(tab)
  }

  async function deletePost(id) {
    if (!confirm('Permanently delete this post?')) return
    await supabase.from('posts').update({ status: 'deleted' }).eq('id', id)
    await logAction('delete_post', 'post', id)
    toast('Post deleted'); fetchTab(tab)
  }

  async function suspendUser(id, reason = 'Violation of community guidelines') {
    await supabase.from('profiles').update({ is_suspended: true, suspension_reason: reason }).eq('id', id)
    await logAction('suspend_user', 'user', id, reason)
    toast('User suspended'); fetchTab(tab)
  }

  async function banUser(id) {
    if (!confirm('Permanently ban this user?')) return
    await supabase.from('profiles').update({ is_banned: true }).eq('id', id)
    await logAction('ban_user', 'user', id)
    toast('User banned'); fetchTab(tab)
  }

  async function makeAdmin(id) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', id)
    toast('User promoted to admin', 'success'); fetchTab(tab)
  }

  async function removeComment(id) {
    await supabase.from('comments').update({ status: 'removed' }).eq('id', id)
    await logAction('remove_comment', 'comment', id)
    toast('Comment removed'); fetchTab(tab)
  }

  async function dismissReport(id) {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
    toast('Report dismissed'); fetchTab(tab)
  }

  async function logAction(action, targetType, targetId, reason) {
    await supabase.from('moderation_logs').insert({ admin_id: profile.id, action, target_type: targetType, target_id: targetId, reason })
  }

  const fmt = (d) => new Date(d).toLocaleDateString()

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">X<span>p</span>ora <span style={{ fontSize: 11, opacity: 0.6 }}>Admin</span></div>
        {TABS.map(t => (
          <div key={t.key} className={`admin-nav-item ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 40 }}>
          <div className="admin-nav-item" onClick={() => navigate('/feed')}>← Back to site</div>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-topbar">
          <h2>{TABS.find(t => t.key === tab)?.label}</h2>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>Welcome, {profile?.full_name}</span>
        </div>

        <div className="admin-content">
          {loading ? <div className="loader"><div className="spinner" /></div> : (

            tab === 'dashboard' ? (
              <>
                <div className="stats-grid">
                  {[
                    { label: 'Total Stories', val: stats.posts, color: '#16A34A' },
                    { label: 'Total Users', val: stats.users, color: '#2563EB' },
                    { label: 'Total Comments', val: stats.comments, color: '#9333EA' },
                    { label: 'Pending Posts', val: stats.pending, color: '#EA580C' },
                    { label: 'Open Reports', val: stats.reports, color: '#DC2626' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-num" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick actions</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => setTab('pending')}>Review pending posts ({stats.pending})</button>
                    <button className="btn btn-outline" onClick={() => setTab('reports')}>View reports ({stats.reports})</button>
                  </div>
                </div>
              </>
            ) : tab === 'pending' ? (
              data.length === 0 ? <div className="empty-state"><h3>No pending posts 🎉</h3></div> :
              data.map(p => (
                <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="tag-badge">{p.tag}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{fmt(p.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--serif)', marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>by @{p.profiles?.username}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>AI verdict: <span className={`status-pill status-${p.ai_status}`}>{p.ai_status}</span> — {p.ai_reason}</div>
                  <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14, maxHeight: 120, overflow: 'hidden' }}>{p.body?.slice(0, 300)}…</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="tbl-btn tbl-btn-approve" onClick={() => approvePost(p.id)}>✓ Approve</button>
                    <button className="tbl-btn tbl-btn-del" onClick={() => rejectPost(p.id)}>✕ Reject</button>
                    <button className="tbl-btn tbl-btn-del" onClick={() => deletePost(p.id)}>🗑 Delete</button>
                  </div>
                </div>
              ))
            ) : tab === 'stories' ? (
              <div className="admin-table-card">
                <div className="admin-table-header"><h3>All Stories ({data.length})</h3></div>
                <table>
                  <thead><tr><th>Title</th><th>Author</th><th>Tag</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(p => (
                      <tr key={p.id}>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                        <td>@{p.profiles?.username}</td>
                        <td>{p.tag}</td>
                        <td><span className={`status-pill status-${p.status}`}>{p.status}</span></td>
                        <td>{fmt(p.created_at)}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          {p.status !== 'approved' && <button className="tbl-btn tbl-btn-approve" onClick={() => approvePost(p.id)}>Approve</button>}
                          {p.status !== 'rejected' && <button className="tbl-btn tbl-btn-del" onClick={() => rejectPost(p.id)}>Reject</button>}
                          <button className="tbl-btn tbl-btn-del" onClick={() => deletePost(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab === 'users' ? (
              <div className="admin-table-card">
                <div className="admin-table-header"><h3>All Users ({data.length})</h3></div>
                <table>
                  <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(u => (
                      <tr key={u.id}>
                        <td>{u.full_name}</td>
                        <td>@{u.username}</td>
                        <td><span className={`status-pill ${u.role === 'admin' ? 'status-approved' : 'status-pending'}`}>{u.role}</span></td>
                        <td><span className={`status-pill ${u.is_banned ? 'status-rejected' : u.is_suspended ? 'status-review' : 'status-approved'}`}>{u.is_banned ? 'Banned' : u.is_suspended ? 'Suspended' : 'Active'}</span></td>
                        <td>{fmt(u.created_at)}</td>
                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!u.is_suspended && !u.is_banned && u.role !== 'admin' && <button className="tbl-btn tbl-btn-del" onClick={() => suspendUser(u.id)}>Suspend</button>}
                          {!u.is_banned && <button className="tbl-btn tbl-btn-del" onClick={() => banUser(u.id)}>Ban</button>}
                          {u.role !== 'admin' && <button className="tbl-btn tbl-btn-approve" onClick={() => makeAdmin(u.id)}>Make admin</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab === 'comments' ? (
              <div className="admin-table-card">
                <div className="admin-table-header"><h3>All Comments ({data.length})</h3></div>
                <table>
                  <thead><tr><th>Author</th><th>Comment</th><th>Post</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(c => (
                      <tr key={c.id}>
                        <td>@{c.profiles?.username}</td>
                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.body}</td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.posts?.title}</td>
                        <td><span className={`status-pill status-${c.status === 'approved' ? 'approved' : 'rejected'}`}>{c.status}</span></td>
                        <td>{c.status === 'approved' && <button className="tbl-btn tbl-btn-del" onClick={() => removeComment(c.id)}>Remove</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab === 'reports' ? (
              <div className="admin-table-card">
                <div className="admin-table-header"><h3>Reports ({data.length})</h3></div>
                <table>
                  <thead><tr><th>Reporter</th><th>Reason</th><th>Post</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(r => (
                      <tr key={r.id}>
                        <td>@{r.profiles?.username}</td>
                        <td><span className="status-pill status-review">{r.reason}</span></td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.posts?.title || '—'}</td>
                        <td><span className={`status-pill status-${r.status === 'pending' ? 'pending' : 'approved'}`}>{r.status}</span></td>
                        <td>{fmt(r.created_at)}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          {r.status === 'pending' && <>
                            {r.post_id && <button className="tbl-btn tbl-btn-del" onClick={() => rejectPost(r.post_id, r.reason)}>Remove post</button>}
                            <button className="tbl-btn tbl-btn-approve" onClick={() => dismissReport(r.id)}>Dismiss</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab === 'logs' ? (
              <div className="admin-table-card">
                <div className="admin-table-header"><h3>Moderation Logs</h3></div>
                <table>
                  <thead><tr><th>Admin</th><th>Action</th><th>Type</th><th>Reason</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.map(l => (
                      <tr key={l.id}>
                        <td>@{l.profiles?.username}</td>
                        <td><span className="status-pill status-review">{l.action}</span></td>
                        <td>{l.target_type}</td>
                        <td>{l.reason || '—'}</td>
                        <td>{fmt(l.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
