import { useNavigate } from 'react-router-dom'
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌙</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 400, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: 'var(--text2)', fontSize: 16, marginBottom: 28 }}>This dream doesn't exist — yet.</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Go home</button>
    </div>
  )
}
