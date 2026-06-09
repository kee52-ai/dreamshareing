import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { moderateWithAI } from '../lib/moderation'
import { Navbar, useToast } from '../components/UI'

const TAGS = ['Dreams','Travel','Life','Ideas','Career','Food','Tech','Love','Culture']
const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }

export default function WritePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('Dreams')
  const [coverUrl, setCoverUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const bodyRef = useRef(null)
  const fileRef = useRef(null)

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length

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
    toast('Cover image uploaded!', 'success')
  }

  async function publish() {
    if (!title.trim()) { toast('Please add a title', 'error'); return }
    if (body.trim().length < 50) { toast('Story too short — write at least 50 characters', 'error'); return }
    setPublishing(true)

    const modResult = await moderateWithAI(title, body)

    const excerpt = body.replace(/[#*_>]/g, '').trim().slice(0, 160) + '…'
    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      excerpt,
      tag,
      cover_url: coverUrl || null,
      status: modResult.status === 'rejected' ? 'rejected' : modResult.status === 'approved' ? 'approved' : 'pending',
      ai_status: modResult.status,
      ai_reason: modResult.reason,
      published_at: new Date().toISOString(),
    })

    setPublishing(false)
    if (error) { toast('Failed to publish: ' + error.message, 'error'); return }

    if (modResult.status === 'approved') {
      toast('Story published! 🎉', 'success')
      navigate('/feed')
    } else if (modResult.status === 'review') {
      toast('Story submitted for review. Admin will approve shortly.', 'success')
      navigate('/feed')
    } else {
      toast('Story could not be published: ' + modResult.reason, 'error')
    }
  }

  function insertFormat(pre, post) {
    const ta = bodyRef.current
    const s = ta.selectionStart, e = ta.selectionEnd
    const selected = ta.value.slice(s, e)
    ta.value = ta.value.slice(0, s) + pre + selected + post + ta.value.slice(e)
    setBody(ta.value)
    ta.focus()
  }

  return (
    <div className="write-page">
      <Navbar />
      <div className="write-body">
        {/* Cover image */}
        {coverUrl && <img src={coverUrl} alt="Cover" className="cover-preview" />}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadCover(e.target.files[0])} />
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : coverUrl ? '🖼 Change cover' : '🖼 Add cover image'}
          </button>
          {coverUrl && <button className="btn btn-ghost btn-sm" onClick={() => setCoverUrl('')}>Remove</button>}
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
          placeholder="Tell your story… Start with a dream you had last night, a moment that changed you, or an idea that won't leave you alone."
          value={body}
          onChange={e => { setBody(e.target.value); autoResize(e.target) }}
        />
      </div>

      <div className="write-bottom-bar">
        <span className="word-count">{wordCount} words</span>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Auto-moderated for quality</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/feed')}>Cancel</button>
          <button className="btn btn-primary" onClick={publish} disabled={publishing || !title.trim() || body.trim().length < 50}>
            {publishing ? 'Publishing…' : 'Publish →'}
          </button>
        </div>
      </div>
    </div>
  )
}
