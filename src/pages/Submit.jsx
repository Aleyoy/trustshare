import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Lock, UploadCloud, X, Play } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../data/categories'
import { uploadPostMedia } from '../lib/db'

export default function Submit() {
  const { createPost } = usePosts()
  const { user, setShowAuthModal } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const fileInputRef = useRef(null)

  function handleMediaChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video')
    const isImage = file.type.startsWith('image')
    if (!isVideo && !isImage) return
    if (file.size > 50 * 1024 * 1024) { setError('File terlalu besar. Maksimal 50MB.'); return }
    setMediaFile(file)
    setMediaType(isVideo ? 'video' : 'image')
    setMediaPreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeMedia() {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
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
      let media_url = null
      let media_type = null
      if (mediaFile) {
        const result = await uploadPostMedia(mediaFile)
        media_url = result.url
        media_type = result.type
      }
      await createPost({ ...form, media_url, media_type })
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

        {/* Media upload */}
        <div>
          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1.5">
            Foto / Video <span className="text-slate-400 normal-case font-normal">(opsional, maks. 50MB)</span>
          </label>

          {mediaPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-purple-50">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-64" />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-600 rounded-full p-1 shadow transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors bg-purple-50/50"
            >
              <UploadCloud size={24} />
              <span className="text-sm">Klik untuk upload foto atau video</span>
              <span className="text-xs">JPG, PNG, GIF, MP4, MOV</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
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
          {submitting ? (mediaFile ? 'Mengupload media…' : 'Menyimpan…') : 'Submit Post'}
        </button>
      </form>
    </div>
  )
}
