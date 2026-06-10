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
  return <span><span className="typing-text">{displayed}</span><span className="typing-cursor" /></span>
}

// Real SVG Logo — not AI generated
function XporaLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F06A25"/>
          <stop offset="100%" stopColor="#E8472B"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#lg)"/>
      <path d="M38 33 C40 24 56 20 63 30 C70 40 66 57 50 63 C34 57 30 42 38 33Z" fill="none" stroke="white" strokeWidth="3.5" opacity="0.95"/>
      <circle cx="70" cy="25" r="4" fill="white" opacity="0.95"/>
      <circle cx="60" cy="17" r="2.5" fill="white" opacity="0.75"/>
      <circle cx="78" cy="35" r="2" fill="white" opacity="0.6"/>
      <text x="50" y="56" fontFamily="Georgia,serif" fontSize="19" fontWeight="bold" fill="white" textAnchor="middle">Xpora</text>
    </svg>
  )
}

export { XporaLogo }

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredPosts, setFeaturedPosts] = useState([])

  useEffect(() => {
    supabase.from('posts')
      .select('id,title,excerpt,tag,author_id,created_at,upvotes,profiles(username,full_name,avatar_url)')
      .eq('status', 'approved').order('upvotes', { ascending: false }).limit(6)
      .then(({ data }) => setFeaturedPosts(data || []))
  }, [])

  const EMOJIS = { Dreams:'🌙',Travel:'✈️',Life:'🌱',Ideas:'💡',Career:'💼',Food:'🍛',Tech:'💻',Love:'❤️',Culture:'🎭' }
  const COVERS = ['linear-gradient(135deg,#FCEEE7,#F9D5BA)','linear-gradient(135deg,#E8F4FD,#BDD9F0)','linear-gradient(135deg,#E8F5E9,#C8E6C9)','linear-gradient(135deg,#F3E5F5,#E1BEE7)','linear-gradient(135deg,#FFFDE7,#FFF9C4)','linear-gradient(135deg,#FCEEE7,#F5C9AD)']

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO */}
      <div className="hero">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <XporaLogo size={52} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Xpora</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: 1 }}>DREAM · SHARE · CONNECT</div>
          </div>
        </div>

        <div className="hero-eyebrow">🌙 A home for every dream</div>
        <h1>
          Every dream you've had<br />
          <em><TypingText phrases={TYPING_PHRASES} /></em>
        </h1>
        <p className="hero-sub">
          Every night you dream. Most people forget by morning. <strong>Xpora</strong> is where you write them down — and find thousands of others dreaming the same things.
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

      {/* WHAT IS XPORA — clear explanation */}
      <div style={{ background: '#fff', padding: '64px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--orange-light)', color: 'var(--orange-dark)', padding: '6px 16px', borderRadius: 40, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            🌙 What is Xpora?
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, marginBottom: 18, lineHeight: 1.2 }}>
            The platform for sharing the dreams you have every night
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 32 }}>
            You close your eyes and enter another world — flying over cities, meeting people you've never met, living stories that feel more real than reality. <strong>Most people never share these.</strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
            {[
              { icon: '😴', title: 'You dream every night', desc: 'Science says you have 4-6 dreams per night. Most are forgotten in 10 minutes.' },
              { icon: '✍️', title: 'You write it here', desc: 'Capture it before it fades. Our editor is fast — write in minutes.' },
              { icon: '🌍', title: 'The world reads it', desc: 'Someone in another country had the same dream last night.' },
              { icon: '🔗', title: 'You find your people', desc: 'Connect with dreamers, get comments, build an audience.' },
            ].map(c => (
              <div key={c.title} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED STORIES */}
      <div style={{ padding: '56px 28px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400 }}>
            🌟 Featured dreams & stories
          </h2>
          <span style={{ color: 'var(--orange)', fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/signin')}>See all →</span>
        </div>
        {featuredPosts.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 24, height: 240 }}>
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
                <div style={{ height: 120, borderRadius: 10, marginBottom: 12, background: COVERS[i % 6], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  {EMOJIS[p.tag] || '✨'}
                </div>
                <span className="tag-badge">{EMOJIS[p.tag]} {p.tag}</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, margin: '8px 0 6px', lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{p.excerpt}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                    {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} alt="" /> : (p.profiles?.full_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.profiles?.full_name || p.profiles?.username}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>▲ {p.upvotes || 0}</span>
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
              { icon: '😴', title: 'Wake up. Remember.', text: 'You just had a dream. Before it fades, open Xpora. Write the first thing you remember — the feeling, the place, the people.' },
              { icon: '✍️', title: 'Write it down', text: 'Our distraction-free editor lets you write fast. Add a tag like Dreams, Travel, or Life. Add a cover image. Publish in minutes.' },
              { icon: '🌍', title: 'Share with the world', text: 'Your dream is now readable by anyone on Xpora. People comment, vote, and connect with you over shared experiences.' },
              { icon: '🛡️', title: 'Safe & moderated', text: 'Every story is reviewed for quality. Real dreams only — no spam, no fake content. Admins keep the community honest.' },
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

      {/* CTA BOTTOM */}
      <div style={{ background: 'var(--orange-grad)', padding: '64px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <XporaLogo size={56} />
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, color: '#fff', fontWeight: 400, marginBottom: 14 }}>
          What did you dream last night?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, marginBottom: 28, maxWidth: 440, margin: '0 auto 28px' }}>
          Join Xpora free. Write your first dream in under 3 minutes.
        </p>
        <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--orange-dark)', fontWeight: 600 }} onClick={() => navigate('/signup')}>
          🌙 Start sharing dreams
        </button>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 13, color: 'var(--text3)', borderTop: '1px solid var(--border)', background: '#fff' }}>
        Made with <span style={{ color: '#E04040' }}>♥</span> for dreamers. Xpora © 2026
      </footer>
    </div>
  )
}
