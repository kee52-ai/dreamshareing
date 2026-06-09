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
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const avatarRef = useRef(null)
  const isOwn = myProfile?.username === username

  useEffect(() => { fetchProfileData() }, [username])

  async function fetchProfileData() {
    setLoading(true)
    const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
    setProfile(prof)
    if (prof) {
      setEditForm({ full_name: prof.full_name || '', bio: prof.bio || '' })
      const { data: userPosts } = await supabase.from('posts').select('id,title,excerpt,tag,created_at,upvotes,comment_count')
        .eq('author_id', prof.id).eq('status', 'approved').order('created_at', { ascending: false })
      setPosts(userPosts || [])
      if (user && !isOwn) {
        const { data: follow } = await supabase.from('follows').select('follower_id').match({ follower_id: user.id, following_id: prof.id }).single()
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
      setIsFollowing(true); toast('Following!', 'success')
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
    toast('Profile picture updated!', 'success')
    fetchProfileData()
    fetchProfile(user.id)
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: editForm.full_name, bio: editForm.bio }).eq('id', user.id)
    setSaving(false)
    if (error) { toast('Failed to save', 'error'); return }
    toast('Profile updated!', 'success')
    setEditOpen(false)
    fetchProfileData()
    fetchProfile(user.id)
  }

  if (loading) return <div><Navbar /><div className="loader"><div className="spinner" /></div></div>
  if (!profile) return <div><Navbar /><div className="empty-state"><h3>User not found</h3></div></div>

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <div className="profile-header">
          <div style={{ position: 'relative' }}>
            <div className="profile-avatar-lg">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile.full_name?.[0] || 'U').toUpperCase()}
            </div>
            {isOwn && (
              <>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadAvatar(e.target.files[0])} />
                <button onClick={() => avatarRef.current.click()} disabled={uploading} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--orange)', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            </div>
          </div>
          {isOwn
            ? <button className="btn btn-outline" onClick={() => setEditOpen(true)}>Edit profile</button>
            : <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} onClick={toggleFollow}>{isFollowing ? 'Following' : 'Follow'}</button>
          }
        </div>

        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 16 }}>
          {isOwn ? 'Your stories' : `Stories by ${profile.full_name}`}
        </h2>

        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No stories yet</h3>
            {isOwn && <button className="btn btn-primary" onClick={() => navigate('/write')}>Write your first story</button>}
          </div>
        ) : posts.map(p => (
          <div key={p.id} className="post-card" onClick={() => navigate(`/story/${p.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="tag-badge">{EMOJIS[p.tag]} {p.tag}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
            <div className="post-title">{p.title}</div>
            <div className="post-excerpt">{p.excerpt}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: 'var(--text3)' }}>
              <span>▲ {p.upvotes || 0}</span>
              <span>💬 {p.comment_count || 0}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" subtitle="Update your information">
        <input className="form-input" placeholder="Full name" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
        <textarea className="comment-box" placeholder="Bio (tell your story in one line)" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} style={{ minHeight: 80, marginBottom: 12 }} />
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </Modal>
    </div>
  )
}
