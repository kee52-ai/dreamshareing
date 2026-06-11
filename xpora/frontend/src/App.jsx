import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/UI'
import './index.css'

import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FeedPage from './pages/FeedPage'
import WritePage from './pages/WritePage'
import StoryPage from './pages/StoryPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner"/></div>
  return user ? children : <Navigate to="/signin" replace />
}

function AdminRoute({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner"/></div>
  return profile?.role === 'admin' || profile?.role === 'moderator' ? children : <Navigate to="/feed" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/write" element={<PrivateRoute><WritePage /></PrivateRoute>} />
      <Route path="/story/:id" element={<PrivateRoute><StoryPage /></PrivateRoute>} />
      <Route path="/profile/:username" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
