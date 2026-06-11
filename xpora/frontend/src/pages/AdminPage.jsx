import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/UI'

const TABS = [
  { key:'dashboard', label:'📊 Dashboard' },
  { key:'pending', label:'⏳ Pending' },
  { key:'stories', label:'📝 All Stories' },
  { key:'users', label:'👥 Users' },
  { key:'comments', label:'💬 Comments' },
  { key:'reports', label:'⚑ Reports' },
  { key:'logs', label:'📋 Logs' },
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
        supabase.from('posts').select('id', { count:'exact', head:true }),
        supabase.from('profiles').select('id', { count:'exact', head:true }),
        supabase.from('comments').select('id', { count:'exact', head:true }),
        supabase.from('reports').select('id', { count:'exact', head:true }).eq('status','pending'),
        supabase.from('posts').select('id', { count:'exact', head:true }).eq('status','pending'),
      ])
      setStats({ posts:posts.count||0, users:users.count||0, comments:comments.count||0, reports:reports.count||0, pending:pending.count||0 })
    } else if (t === 'pending') {
      const { data:d } = await supabase.from('posts').select('*,profiles(username,full_name,avatar_url)').eq('status','pending').order('created_at',{ascending:false})
      setData(d||[])
    } else if (t === 'stories') {
      const { data:d } = await supabase.from('posts').select('*,profiles(username,full_name)').order('created_at',{ascending:false}).limit(50)
      setData(d||[])
    } else if (t === 'users') {
      const { data:d } = await supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(50)
      setData(d||[])
    } else if (t === 'comments') {
      const { data:d } = await supabase.from('comments').select('*,profiles(username,full_name),posts(title)').order('created_at',{ascending:false}).limit(50)
      setData(d||[])
    } else if (t === 'reports') {
      const { data:d } = await supabase.from('reports').select('*,profiles(username),posts(title)').order('created_at',{ascending:false})
      setData(d||[])
    } else if (t === 'logs') {
      const { data:d } = await supabase.from('moderation_logs').select('*,profiles(username)').order('created_at',{ascending:false}).limit(50)
      setData(d||[])
    }
    setLoading(false)
  }

  async function approvePost(id) {
    await supabase.from('posts').update({ status:'approved' }).eq('id',id)
    // Notify user
    const post = data.find(p=>p.id===id)
    if (post) {
      await supabase.from('notifications').insert({ user_id: post.author_id, type:'moderation', title:'Story approved!', message:`Your story "${post.title}" has been approved and is now live!` })
    }
    await logAction('approve_post','post',id)
    toast('✅ Post approved!','success'); fetchTab(tab)
  }

  async function rejectPost(id, reason='Violates community guidelines') {
    const post = data.find(p=>p.id===id)
    await supabase.from('posts').update({ status:'rejected', moderation_reason:reason }).eq('id',id)
    if (post) {
      await supabase.from('notifications').insert({ user_id: post.author_id, type:'moderation', title:'Story removed', message:`Your story "${post.title}" was removed: ${reason}` })
    }
    await logAction('reject_post','post',id,reason)
    toast('Post rejected','error'); fetchTab(tab)
  }

  async function warnUser(id, username) {
    await supabase.from('notifications').insert({ user_id:id, type:'system', title:'⚠️ Warning', message:'Your recent content violated our community guidelines. Please review our rules.' })
    toast(`Warning sent to @${username}`,'success')
  }

  async function suspendUser(id, username) {
    await supabase.from('profiles').update({ is_suspended:true, suspension_reason:'Violation of community guidelines' }).eq('id',id)
    await supabase.from('notifications').insert({ user_id:id, type:'system', title:'Account suspended', message:'Your account has been suspended for violating community guidelines.' })
    await logAction('suspend_user','user',id)
    toast(`@${username} suspended`); fetchTab(tab)
  }

  async function banUser(id, username) {
    if (!confirm(`Permanently ban @${username}?`)) return
    await supabase.from('profiles').update({ is_banned:true }).eq('id',id)
    await logAction('ban_user','user',id)
    toast(`@${username} banned`); fetchTab(tab)
  }

  async function unsuspendUser(id) {
    await supabase.from('profiles').update({ is_suspended:false, suspension_reason:null }).eq('id',id)
    toast('User unsuspended','success'); fetchTab(tab)
  }

  async function makeAdmin(id) {
    await supabase.from('profiles').update({ role:'admin' }).eq('id',id)
    toast('User promoted to admin ✅','success'); fetchTab(tab)
  }

  async function removeComment(id) {
    await supabase.from('comments').update({ status:'removed' }).eq('id',id)
    await logAction('remove_comment','comment',id)
    toast('Comment removed'); fetchTab(tab)
  }

  async function dismissReport(id) {
    await supabase.from('reports').update({ status:'dismissed' }).eq('id',id)
    toast('Report dismissed'); fetchTab(tab)
  }

  async function deletePost(id) {
    if (!confirm('Delete permanently?')) return
    await supabase.from('posts').update({ status:'deleted' }).eq('id',id)
    await logAction('delete_post','post',id)
    toast('Post deleted'); fetchTab(tab)
  }

  async function logAction(action, targetType, targetId, reason) {
    await supabase.from('moderation_logs').insert({ admin_id:profile.id, action, target_type:targetType, target_id:targetId, reason })
  }

  const fmt = d => new Date(d).toLocaleDateString()

  const sidebarStyle = { width:200, background:'#1A1208', minHeight:'100vh', padding:'20px 12px', flexShrink:0 }
  const navItemStyle = (active) => ({ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:8, fontSize:13, color: active ? '#F06A25' : 'rgba(255,255,255,0.6)', cursor:'pointer', marginBottom:2, background: active ? 'rgba(240,106,37,0.15)' : 'transparent', fontWeight: active?600:400 })

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ fontFamily:'Georgia,serif', fontSize:18, color:'#fff', marginBottom:28, padding:'0 4px' }}>
          Xpora <span style={{ color:'#F06A25' }}>Admin</span>
        </div>
        {TABS.map(t => (
          <div key={t.key} style={navItemStyle(tab===t.key)} onClick={() => setTab(t.key)}>
            {t.label} {t.key==='pending' && stats.pending>0 && <span style={{ background:'#F06A25', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10, marginLeft:'auto' }}>{stats.pending}</span>}
            {t.key==='reports' && stats.reports>0 && <span style={{ background:'#DC2626', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10, marginLeft:'auto' }}>{stats.reports}</span>}
          </div>
        ))}
        <div style={{ marginTop:40 }}>
          <div style={navItemStyle(false)} onClick={() => navigate('/feed')}>← Back to site</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, background:'#F5F5F5', overflow:'auto' }}>
        <div style={{ background:'#fff', padding:'18px 28px', borderBottom:'1px solid #E5E5E5', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:400 }}>{TABS.find(t=>t.key===tab)?.label}</h2>
          <span style={{ fontSize:13, color:'#888' }}>Admin: {profile?.full_name}</span>
        </div>

        <div style={{ padding:'24px 28px' }}>
          {loading ? <div className="loader"><div className="spinner"/></div> : (

            tab==='dashboard' ? (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                  {[
                    { label:'Total Stories', val:stats.posts, color:'#16A34A', icon:'📝' },
                    { label:'Total Users', val:stats.users, color:'#2563EB', icon:'👥' },
                    { label:'Comments', val:stats.comments, color:'#9333EA', icon:'💬' },
                    { label:'Pending Posts', val:stats.pending, color:'#EA580C', icon:'⏳' },
                    { label:'Open Reports', val:stats.reports, color:'#DC2626', icon:'⚑' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:'18px 16px', border:'1px solid #E5E5E5' }}>
                      <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                      <div style={{ fontSize:11, color:'#888', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:28, fontWeight:600, color:s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', padding:20 }}>
                  <h3 style={{ fontSize:16, fontWeight:600, marginBottom:14 }}>Quick Actions</h3>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <button className="btn btn-primary" onClick={() => setTab('pending')}>⏳ Review pending ({stats.pending})</button>
                    <button className="btn btn-outline" onClick={() => setTab('reports')}>⚑ View reports ({stats.reports})</button>
                    <button className="btn btn-outline" onClick={() => setTab('users')}>👥 Manage users</button>
                  </div>
                </div>
              </>
            ) : tab==='pending' ? (
              data.length===0 ? (
                <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', padding:40, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
                  <h3>No pending posts!</h3>
                  <p style={{ color:'#888' }}>All caught up.</p>
                </div>
              ) : data.map(p => (
                <div key={p.id} style={{ background:'#fff', border:'1px solid #E5E5E5', borderRadius:10, padding:20, marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div className="avatar" style={{ width:36, height:36, fontSize:14 }}>
                      {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} alt=""/> : (p.profiles?.full_name?.[0]||'U').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>@{p.profiles?.username}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{fmt(p.created_at)}</div>
                    </div>
                    <span className="tag-badge" style={{ marginLeft:'auto' }}>{p.tag}</span>
                  </div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:18, fontWeight:700, marginBottom:6 }}>{p.title}</div>
                  <div style={{ fontSize:13, color:'#888', marginBottom:8 }}>
                    🤖 AI: <span style={{ fontWeight:600, color: p.ai_status==='approved'?'#16A34A': p.ai_status==='rejected'?'#DC2626':'#EA580C' }}>{p.ai_status}</span> — {p.ai_reason}
                  </div>
                  <div style={{ fontSize:14, color:'#555', lineHeight:1.65, maxHeight:120, overflow:'hidden', marginBottom:14 }}>{p.body?.slice(0,400)}…</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => approvePost(p.id)} style={{ padding:'8px 18px', background:'#DCFCE7', color:'#15803D', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, fontSize:13 }}>✓ Approve</button>
                    <button onClick={() => rejectPost(p.id)} style={{ padding:'8px 18px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, fontSize:13 }}>✕ Reject</button>
                    <button onClick={() => deletePost(p.id)} style={{ padding:'8px 18px', background:'#F5F5F5', color:'#666', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>🗑 Delete</button>
                  </div>
                </div>
              ))
            ) : tab==='stories' ? (
              <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E5E5', fontWeight:600 }}>All Stories ({data.length})</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>Title</th>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>Author</th>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>Tag</th>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>Status</th>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {data.map(p => (
                      <tr key={p.id} style={{ borderTop:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'12px 16px', fontSize:13, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</td>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>@{p.profiles?.username}</td>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>{p.tag}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: p.status==='approved'?'#DCFCE7':p.status==='pending'?'#FEF9C3':'#FEE2E2', color: p.status==='approved'?'#15803D':p.status==='pending'?'#A16207':'#DC2626' }}>{p.status}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            {p.status!=='approved' && <button onClick={() => approvePost(p.id)} style={{ padding:'4px 10px', background:'#DCFCE7', color:'#15803D', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:600 }}>Approve</button>}
                            {p.status!=='rejected' && <button onClick={() => rejectPost(p.id)} style={{ padding:'4px 10px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:600 }}>Reject</button>}
                            <button onClick={() => deletePost(p.id)} style={{ padding:'4px 10px', background:'#F5F5F5', color:'#666', border:'none', borderRadius:5, cursor:'pointer', fontSize:12 }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab==='users' ? (
              <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E5E5', fontWeight:600 }}>All Users ({data.length})</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['User','Role','Status','Joined','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {data.map(u => (
                      <tr key={u.id} style={{ borderTop:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="avatar" style={{ width:32, height:32, fontSize:12 }}>
                              {u.avatar_url ? <img src={u.avatar_url} alt=""/> : (u.full_name?.[0]||'U').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600 }}>{u.full_name}</div>
                              <div style={{ fontSize:11, color:'#888' }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: u.role==='admin'?'#FEF0E8':'#F5F5F5', color: u.role==='admin'?'#C4511A':'#666' }}>{u.role}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: u.is_banned?'#FEE2E2':u.is_suspended?'#FEF9C3':'#DCFCE7', color: u.is_banned?'#DC2626':u.is_suspended?'#A16207':'#15803D' }}>
                            {u.is_banned?'Banned':u.is_suspended?'Suspended':'Active'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#888' }}>{fmt(u.created_at)}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            <button onClick={() => warnUser(u.id, u.username)} style={{ padding:'4px 8px', background:'#FEF9C3', color:'#A16207', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>⚠️ Warn</button>
                            {!u.is_suspended && !u.is_banned && u.role!=='admin' && (
                              <button onClick={() => suspendUser(u.id, u.username)} style={{ padding:'4px 8px', background:'#FEF0E8', color:'#C4511A', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Suspend</button>
                            )}
                            {u.is_suspended && (
                              <button onClick={() => unsuspendUser(u.id)} style={{ padding:'4px 8px', background:'#DCFCE7', color:'#15803D', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Unsuspend</button>
                            )}
                            {!u.is_banned && u.role!=='admin' && (
                              <button onClick={() => banUser(u.id, u.username)} style={{ padding:'4px 8px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Ban</button>
                            )}
                            {u.role!=='admin' && (
                              <button onClick={() => makeAdmin(u.id)} style={{ padding:'4px 8px', background:'#DBEAFE', color:'#1D4ED8', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Make Admin</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab==='comments' ? (
              <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E5E5', fontWeight:600 }}>All Comments ({data.length})</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['Author','Comment','Post','Status','Action'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {data.map(c => (
                      <tr key={c.id} style={{ borderTop:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>@{c.profiles?.username}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.body}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.posts?.title}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: c.status==='approved'?'#DCFCE7':'#FEE2E2', color: c.status==='approved'?'#15803D':'#DC2626' }}>{c.status}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          {c.status==='approved' && <button onClick={() => removeComment(c.id)} style={{ padding:'4px 10px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:600 }}>Remove</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab==='reports' ? (
              <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E5E5', fontWeight:600 }}>Reports ({data.length})</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['Reporter','Reason','Post','Status','Date','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {data.map(r => (
                      <tr key={r.id} style={{ borderTop:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>@{r.profiles?.username}</td>
                        <td style={{ padding:'12px 16px' }}><span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#DBEAFE', color:'#1D4ED8' }}>{r.reason}</span></td>
                        <td style={{ padding:'12px 16px', fontSize:13, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.posts?.title||'—'}</td>
                        <td style={{ padding:'12px 16px' }}><span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: r.status==='pending'?'#FEF9C3':'#DCFCE7', color: r.status==='pending'?'#A16207':'#15803D' }}>{r.status}</span></td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#888' }}>{fmt(r.created_at)}</td>
                        <td style={{ padding:'12px 16px' }}>
                          {r.status==='pending' && (
                            <div style={{ display:'flex', gap:6 }}>
                              {r.post_id && <button onClick={() => rejectPost(r.post_id, r.reason)} style={{ padding:'4px 8px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Remove post</button>}
                              <button onClick={() => dismissReport(r.id)} style={{ padding:'4px 8px', background:'#DCFCE7', color:'#15803D', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, fontWeight:600 }}>Dismiss</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab==='logs' ? (
              <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E5E5', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E5E5', fontWeight:600 }}>Moderation Logs</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['Admin','Action','Type','Reason','Date'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#888', fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {data.map(l => (
                      <tr key={l.id} style={{ borderTop:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>@{l.profiles?.username}</td>
                        <td style={{ padding:'12px 16px' }}><span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#DBEAFE', color:'#1D4ED8' }}>{l.action}</span></td>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>{l.target_type}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#888' }}>{l.reason||'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#888' }}>{fmt(l.created_at)}</td>
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
