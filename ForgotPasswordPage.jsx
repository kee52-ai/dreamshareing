import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Navbar, Modal, useToast } from '../components/UI'

const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }

export default function ProfilePage() {
  const { username } = useParams()
  const { user, profile: myProfile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [pendingPosts, setPendingPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('published')
  const avatarRef = useRef(null)
  const isOwn = myProfile?.username === username

  useEffect(() => { fetchProfileData() }, [username])

  async function fetchProfileData() {
    setLoading(true)
    const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
    setProfile(prof)
    if (prof) {
      setEditForm({ full_name: prof.full_name || '', bio: prof.bio || '' })

      // Published posts
      const { data: userPosts } = await supabase.from('posts')
        .select('id,title,excerpt,tag,created_at,upvotes,comment_count,status')
        .eq('author_id', prof.id).eq('status', 'approved')
        .order('created_at', { ascending: false })
      setPosts(userPosts || [])

      // Pending/draft posts (only for own profile)
      if (isOwn || myProfile?.role === 'admin') {
        const { data: pending } = await supabase.from('posts')
          .select('id,title,excerpt,tag,created_at,status')
          .eq('author_id', prof.id).in('status', ['pending','rejected','deleted'])
          .order('created_at', { ascending: false })
        setPendingPosts(pending || [])
      }

      if (user && !isOwn) {
        const { data: follow } = await supabase.from('follows')
          .select('follower_id').match({ follower_id: user.id, following_id: prof.id }).single()
        setIsFollowing(!!follow)
      }
    }
    setLoading(false)
  }

  async function toggleFollow() {
    if (!user) { navigate('/signin'); return }
    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(false); toast('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true); toast('Following! ✅', 'success')
    }
  }

  async function uploadAvatar(file) {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    await supabase.storage.from('xpora-images').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('xpora-images').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    setUploading(false)
    toast('Profile picture updated! 📸', 'success')
    fetchProfileData(); fetchProfile(user.id)
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name, bio: editForm.bio
    }).eq('id', user.id)
    setSaving(false)
    if (error) { toast('Failed to save', 'error'); return }
    toast('Profile updated! ✅', 'success')
    setEditOpen(false); fetchProfileData(); fetchProfile(user.id)
  }

  async function deletePost(id) {
    if (!confirm('Delete this story permanently?')) return
    const { error } = await supabase.from('posts').update({ status: 'deleted' }).eq('id', id)
    if (error) { toast('Failed to delete', 'error'); return }
    toast('Story deleted')
    fetchProfileData()
  }

  const statusColor = { approved: '#16A34A', pending: '#D97706', rejected: '#DC2626', deleted: '#9CA3AF' }
  const statusLabel = { approved: '✅ Published', pending: '⏳ Under review', rejected: '❌ Rejected', deleted: '🗑 Deleted' }

  if (loading) return <div><Navbar /><div className="loader"><div className="spinner" /></div></div>
  if (!profile) return <div><Navbar /><div className="empty-state"><h3>User not found</h3></div></div>

  const displayPosts = activeTab === 'published' ? posts : pendingPosts

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>

        {/* PROFILE HEADER */}
        <div className="profile-header">
          <div style={{ position: 'relative' }}>
            <div className="profile-avatar-lg">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile.full_name?.[0] || 'U').toUpperCase()}
            </div>
            {isOwn && (
              <>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadAvatar(e.target.files[0])} />
                <button onClick={() => avatarRef.current.click()} disabled={uploading} title="Change photo" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--orange)', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {uploading ? '…' : '✏️'}
                </button>
              </>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="profile-name-h1">{profile.full_name}</div>
            <div className="profile-handle-sub">@{profile.username}</div>
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> stories</span>
              {profile.role === 'admin' && <span style={{ background: 'var(--orange-light)', color: 'var(--orange-dark)', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>⚙️ Admin</span>}
            </div>
          </div>
          {isOwn
            ? <button className="btn btn-outline" onClick={() => setEditOpen(true)}>✏️ Edit profile</button>
            : <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} onClick={toggleFollow}>{isFollowing ? '✓ Following' : '+ Follow'}</button>
          }
        </div>

        {/* TABS */}
        {isOwn && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg)', borderRadius: 10, padding: 4 }}>
            <button onClick={() => setActiveTab('published')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, background: activeTab === 'published' ? '#fff' : 'transparent', color: activeTab === 'published' ? 'var(--text)' : 'var(--text3)', boxShadow: activeTab === 'published' ? 'var(--shadow)' : 'none' }}>
              ✅ Published ({posts.length})
            </button>
            <button onClick={() => setActiveTab('pending')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, background: activeTab === 'pending' ? '#fff' : 'transparent', color: activeTab === 'pending' ? 'var(--text)' : 'var(--text3)', boxShadow: activeTab === 'pending' ? 'var(--shadow)' : 'none' }}>
              ⏳ Pending/Drafts ({pendingPosts.length})
            </button>
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 16 }}>
          {isOwn ? (activeTab === 'published' ? 'Your stories' : 'Pending & drafts') : `Stories by ${profile.full_name}`}
        </h2>

        {displayPosts.length === 0 ? (
          <div className="empty-state">
            <h3>{activeTab === 'published' ? 'No published stories yet' : 'No pending stories'}</h3>
            {isOwn && activeTab === 'published' && (
              <button className="btn btn-primary" onClick={() => navigate('/write')}>✍️ Write your first story</button>
            )}
          </div>
        ) : displayPosts.map(p => (
          <div key={p.id} className="post-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="tag-badge">{EMOJIS[p.tag]} {p.tag}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {p.status !== 'approved' && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[p.status] }}>{statusLabel[p.status]}</span>
                )}
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="post-title" onClick={() => p.status === 'approved' && navigate(`/story/${p.id}`)}>{p.title}</div>
            <div className="post-excerpt">{p.excerpt}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
              {p.status === 'approved' && (
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>▲ {p.upvotes || 0} · 💬 {p.comment_count || 0}</span>
              )}
              {isOwn && p.status !== 'deleted' && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/write?edit=${p.id}`)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePost(p.id)}>🗑 Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" subtitle="Update your information">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div className="profile-avatar-lg" style={{ width: 60, height: 60, fontSize: 22 }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile.full_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { uploadAvatar(e.target.files[0]); setEditOpen(false) }} />
            <button className="btn btn-outline btn-sm" onClick={() => avatarRef.current.click()}>📷 Change photo</button>
          </div>
        </div>
        <input className="form-input" placeholder="Full name" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
        <textarea className="comment-box" placeholder="Bio — tell your story in one line" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} style={{ minHeight: 80, marginBottom: 12 }} />
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving…' : '✅ Save changes'}
        </button>
      </Modal>
    </div>
  )
}
