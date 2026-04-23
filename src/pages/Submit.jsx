import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../data/categories'

export default function Submit() {
  const { createPost } = usePosts()
  const { user, setShowAuthModal } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    affiliate_link: '',
    shopee_link: '',
    tokopedia_link: '',
    lazada_link: '',
    category: 'general',
  })

  // Redirect to auth modal if not logged in
  useEffect(() => {
    if (!user) setShowAuthModal(true)
  }, [user, setShowAuthModal])

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createPost(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const valid = form.title.trim() && form.description.trim()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock size={32} className="text-purple-200 mx-auto mb-4" />
        <p className="text-slate-500 text-sm mb-4">Kamu harus masuk untuk submit review.</p>
        <button onClick={() => setShowAuthModal(true)} className="btn-primary">Masuk</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#3C3489] transition-colors mb-6">
        <ArrowLeft size={14} />
        Kembali ke feed
      </Link>

      <h1 className="text-xl font-bold text-[#1E1B4B] mb-1">Submit Review</h1>
      <p className="text-sm text-slate-500 mb-6">Bagikan review produk jujur beserta link afiliasi kamu.</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1.5">Judul *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Nama produk — kesan pertama yang jujur"
            maxLength={120} className="input" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1.5">Deskripsi *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Ceritakan pengalamanmu. Sertakan kelebihan, kekurangan, dan cara pakai."
            rows={5} className="input resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1.5">Kategori</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1.5">
            Video URL <span className="text-slate-400 normal-case font-normal">(opsional)</span>
          </label>
          <input type="url" value={form.video_url} onChange={e => set('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..." className="input" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
            Link Afiliasi <span className="text-slate-400 normal-case font-normal">(minimal satu)</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full w-20 text-center shrink-0">Shopee</span>
              <input type="url" value={form.shopee_link} onChange={e => set('shopee_link', e.target.value)}
                placeholder="https://shope.ee/..." className="input" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full w-20 text-center shrink-0">Tokopedia</span>
              <input type="url" value={form.tokopedia_link} onChange={e => set('tokopedia_link', e.target.value)}
                placeholder="https://tokopedia.link/..." className="input" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full w-20 text-center shrink-0">Lazada</span>
              <input type="url" value={form.lazada_link} onChange={e => set('lazada_link', e.target.value)}
                placeholder="https://s.lazada.co.id/..." className="input" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full w-20 text-center shrink-0">Lainnya</span>
              <input type="url" value={form.affiliate_link} onChange={e => set('affiliate_link', e.target.value)}
                placeholder="https://link-lainnya.com/ref=..." className="input" />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <input type="checkbox" id="disclose" required className="mt-0.5 accent-purple-600" />
          <label htmlFor="disclose" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
            Saya menyatakan post ini mengandung link afiliasi dan saya mungkin mendapat komisi. Saya sudah mengungkapkan hubungan saya dengan brand secara jujur.
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button type="submit" disabled={!valid || submitting}
          className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? 'Menyimpan…' : 'Submit Post'}
        </button>
      </form>
    </div>
  )
}
