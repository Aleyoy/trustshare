import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Submit from './pages/Submit'

function AppInner() {
  const { showAuthModal } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/submit" element={<Submit />} />
      </Routes>
      {showAuthModal && <AuthModal />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
