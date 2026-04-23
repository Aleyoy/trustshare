import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function MediaLightbox({ url, type, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-1.5 transition-colors"
      >
        <X size={20} />
      </button>

      <div
        className="max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {type === 'image' ? (
          <img
            src={url}
            alt="Post media"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  )
}
