import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { moderateWithAI } from '../lib/moderation'
import { Navbar, useToast } from '../components/UI'

const TAGS = ['Dreams','Travel','Life','Ideas','Career','Food','Tech','Love','Culture']
const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }

const DRAFT_KEY = 'xpora_draft'

export default function WritePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('Dreams')
  const [coverUrl, setCoverUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const bodyRef = useRef(null)
  const fileRef = useRef(null)

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length

  // Load draft or existing post for editing
  useEffect(() => {
    const id = searchParams.get('edit')
    if (id) {
      setEditId(id)
      supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) { setTitle(data.title); setBody(data.body); setTag(data.tag); setCoverUrl(data.cover_url || '') }
      })
    } else {
      // Load draft
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const d = JSON.parse(draft)
        setTitle(d.title || ''); setBody(d.body || ''); setTag(d.tag || 'Dreams'); setCoverUrl(d.coverUrl || '')
      }
    }
  }, [])

  // Auto-save draft every 10 seconds
  useEffect(() => {
    if (editId) return
    const interval = setInterval(() => {
      if (title || body) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, tag, coverUrl }))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [title, body, tag, coverUrl, editId])

  function saveDraftNow() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, tag, coverUrl }))
    toast('Draft saved! 💾', 'success')
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
    setTitle(''); setBody(''); setTag('Dreams'); setCoverUrl('')
  }

  function autoResize(el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  async function uploadCover(file) {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `covers/${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('xpora-images').upload(path, file, { upsert: true })
    if (error) { toast('Upload failed: ' + error.message, 'error'); setUploading(false); return }
    const { data } = supabase.storage.from('xpora-images').getPublicUrl(path)
    setCoverUrl(data.publicUrl)
    setUploading(false)
    toast('Cover image uploaded! 🖼', 'success')
  }

  async function publish() {
    if (!title.trim()) { toast('Please add a title', 'error'); return }
    if (body.trim().length < 50) { toast('Write at least 50 characters', 'error'); return }
    setPublishing(true)

    const modResult = await moderateWithAI(title, body)
    const excerpt = body.replace(/[#*_>]/g, '').trim().slice(0, 160) + '…'

    // Admin posts auto-approved, others go through moderation
    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
    const finalStatus = isAdmin ? 'approved' : (modResult.status === 'rejected' ? 'rejected' : modResult.status === 'approved' ? 'approved' : 'pending')

    if (editId) {
      // UPDATE existing post
      const { error } = await supabase.from('posts').update({
        title: title.trim(), body: body.trim(), excerpt, tag,
        cover_url: coverUrl || null, updated_at: new Date().toISOString()
      }).eq('id', editId)
      setPublishing(false)
      if (error) { toast('Failed to update: ' + error.message, 'error'); return }
      toast('Story updated! ✅', 'success')
      navigate(`/story/${editId}`)
    } else {
      // INSERT new post
      const { data, error } = await supabase.from('posts').insert({
        author_id: user.id, title: title.trim(), body: body.trim(), excerpt, tag,
        cover_url: coverUrl || null, status: finalStatus,
        ai_status: modResult.status, ai_reason: modResult.reason,
        published_at: new Date().toISOString(),
      }).select('id').single()
      setPublishing(false)
      if (error) { toast('Failed to publish: ' + error.message, 'error'); return }
      localStorage.removeItem(DRAFT_KEY)
      if (finalStatus === 'approved') {
        toast('Story published! 🎉', 'success')
        navigate(`/story/${data.id}`)
      } else if (finalStatus === 'pending') {
        toast('Story submitted for admin review. It will appear soon!', 'success')
        navigate('/feed')
      } else {
        toast('Story rejected: ' + modResult.reason, 'error')
      }
    }
  }

  function insertFormat(pre, post) {
    const ta = bodyRef.current
    const s = ta.selectionStart, e = ta.selectionEnd
    const selected = ta.value.slice(s, e)
    const newVal = ta.value.slice(0, s) + pre + selected + post + ta.value.slice(e)
    setBody(newVal)
    setTimeout(() => { ta.focus(); ta.selectionStart = s + pre.length; ta.selectionEnd = s + pre.length + selected.length }, 0)
  }

  return (
    <div className="write-page">
      <Navbar />
      <div className="write-body">
        {/* Cover image */}
        {coverUrl && <img src={coverUrl} alt="Cover" className="cover-preview" />}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadCover(e.target.files[0])} />
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : coverUrl ? '🖼 Change cover' : '🖼 Add cover image'}
          </button>
          {coverUrl && <button className="btn btn-ghost btn-sm" onClick={() => setCoverUrl('')}>Remove</button>}
          {!editId && (
            <button className="btn btn-ghost btn-sm" onClick={saveDraftNow} style={{ marginLeft: 'auto' }}>
              {draftSaved ? '✓ Saved' : '💾 Save draft'}
            </button>
          )}
        </div>

        <textarea
          className="write-title-input"
          placeholder="Your story title…"
          value={title}
          onChange={e => { setTitle(e.target.value); autoResize(e.target) }}
          rows={1}
          maxLength={200}
        />

        <div className="write-meta-row">
          <select className="write-select" value={tag} onChange={e => setTag(e.target.value)}>
            {TAGS.map(t => <option key={t} value={t}>{EMOJIS[t]} {t}</option>)}
          </select>
          <div className="write-toolbar-btns">
            <button className="tool-btn" title="Bold" onClick={() => insertFormat('**', '**')}><b>B</b></button>
            <button className="tool-btn" title="Italic" onClick={() => insertFormat('_', '_')}><i>I</i></button>
            <button className="tool-btn" title="Heading" onClick={() => insertFormat('\n## ', '')}>H</button>
            <button className="tool-btn" title="Quote" onClick={() => insertFormat('\n> ', '')}>❝</button>
          </div>
        </div>

        <textarea
          ref={bodyRef}
          className="write-editor"
          placeholder={tag === 'Dreams' 
            ? "Start writing… What happened in your dream? Where were you? Who was there? How did it feel?"
            : "Tell your story… Be honest. Be specific. Write what you actually felt."}
          value={body}
          onChange={e => { setBody(e.target.value); autoResize(e.target) }}
        />
      </div>

      <div className="write-bottom-bar">
        <span className="word-count">{wordCount} words</span>
        {!editId && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Auto-saves every 10s</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { if (title || body) { if (confirm('Save as draft?')) saveDraftNow() } navigate('/feed') }}>Cancel</button>
          <button className="btn btn-primary" onClick={publish} disabled={publishing || !title.trim() || body.trim().length < 50}>
            {publishing ? 'Publishing…' : editId ? '✅ Update story' : 'Publish →'}
          </button>
        </div>
      </div>
    </div>
  )
}
