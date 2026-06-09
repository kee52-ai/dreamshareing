import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/UI'
import { supabase } from '../lib/supabase'

const TYPING_PHRASES = [
  'Share your dreams.',
  'Tell your story.',
  'Write what is real.',
  'Find your readers.',
  'Start tonight.',
]

const TAGS = [
  { emoji: '🌙', label: 'Dreams' }, { emoji: '✈️', label: 'Travel' },
  { emoji: '🌱', label: 'Life' }, { emoji: '💡', label: 'Ideas' },
  { emoji: '💼', label: 'Career' }, { emoji: '🍛', label: 'Food' },
  { emoji: '💻', label: 'Tech' }, { emoji: '❤️', label: 'Love' },
  { emoji: '🎭', label: 'Culture' },
]

function TypingText({ phrases }) {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]
    let timeout
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, phraseIdx, phrases])

  return (
    <span>
      <span className="typing-text">{displayed}</span>
      <span className="typing-cursor" />
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredPosts, setFeaturedPosts] = useState([])

  useEffect(() => {
    supabase.from('posts').select('id,title,excerpt,tag,author_id,created_at,upvotes,profiles(username,full_name,avatar_url)')
      .eq('status', 'approved').order('upvotes', { ascending: false }).limit(6)
      .then(({ data }) => setFeaturedPosts(data || []))
  }, [])

  const COVERS = ['', 'blue', 'green', 'purple', 'gold', '']
  const EMOJIS = { Dreams: '🌙', Travel: '✈️', Life: '🌱', Ideas: '💡', Career: '💼', Food: '🍛', Tech: '💻', Love: '❤️', Culture: '🎭' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">A home for every story</div>
        <h1>
          Every dream you've had<br />
          <em><TypingText phrases={TYPING_PHRASES} /></em>
        </h1>
        <p className="hero-sub">
          Xpora is where real experiences live. Dreams, travels, ideas, heartbreaks — write yours, read theirs.
        </p>
        <div className="hero-btns">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>✍️ Share your story</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/signin')}>Read stories</button>
        </div>
        <div className="hero-tags">
          {TAGS.map(t => (
            <div key={t.label} className="tag-pill" onClick={() => navigate('/signup')}>
              {t.emoji} {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <div style={{ padding: '56px 28px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400 }}>Featured stories</h2>
          <span style={{ color: 'var(--orange)', fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/signin')}>See all →</span>
        </div>
        {featuredPosts.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 24, height: 240, animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ background: 'var(--bg)', height: 110, borderRadius: 10, marginBottom: 14 }} />
                <div style={{ background: 'var(--bg)', height: 14, borderRadius: 7, marginBottom: 8, width: '60%' }} />
                <div style={{ background: 'var(--bg)', height: 14, borderRadius: 7, width: '90%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {featuredPosts.map((p, i) => (
              <div key={p.id} className="post-card" onClick={() => navigate('/signin')} style={{ cursor: 'pointer' }}>
                <div style={{
                  height: 120, borderRadius: 10, marginBottom: 12,
                  background: ['linear-gradient(135deg,#FCEEE7,#F9D5BA)', 'linear-gradient(135deg,#E8F4FD,#BDD9F0)', 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', 'linear-gradient(135deg,#FFFDE7,#FFF9C4)', 'linear-gradient(135deg,#FCEEE7,#F5C9AD)'][i % 6],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40
                }}>
                  {EMOJIS[p.tag] || '✨'}
                </div>
                <span className="tag-badge">{EMOJIS[p.tag]} {p.tag}</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, margin: '8px 0 6px', lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{p.excerpt || p.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                    {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} alt="" /> : (p.profiles?.full_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.profiles?.full_name || p.profiles?.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div className="how-section">
        <div className="how-inner">
          <h2 className="how-title">How Xpora works</h2>
          <div className="how-grid">
            {[
              { icon: '👤', title: 'Create your space', text: 'Sign up in seconds. Your profile is your stage — add a photo, bio, and start building your audience.' },
              { icon: '✍️', title: 'Write what is real', text: 'A distraction-free editor. Add a cover image, pick a tag, and publish. Dreams, memories, ideas — all welcome.' },
              { icon: '✨', title: 'Find your readers', text: 'Get votes, comments, and saves from people who genuinely connect with your story.' },
              { icon: '🛡️', title: 'Safe community', text: 'Every post is reviewed for quality. Admins keep the community respectful and spam-free.' },
            ].map(c => (
              <div key={c.title} className="how-card">
                <div className="how-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 13, color: 'var(--text3)', borderTop: '1px solid var(--border)', background: '#fff' }}>
        Made with <span style={{ color: '#E04040' }}>♥</span> for storytellers. Xpora © 2026
      </footer>
    </div>
  )
}
