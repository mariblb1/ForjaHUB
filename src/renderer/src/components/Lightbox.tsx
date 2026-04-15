import { useEffect, useState } from 'react'
import type { GameMedia } from '../../../../types/game'
import { X, ChevronLeft, ChevronRight, Film } from 'lucide-react'

interface LightboxProps {
  items: GameMedia[]
  initialIndex?: number
  onClose: () => void
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube-nocookie\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function isLocalVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

export function Lightbox({ items, initialIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = () => setCurrent((i) => (i - 1 + items.length) % items.length)
  const next = () => setCurrent((i) => (i + 1) % items.length)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const item = items[current]

  const renderContent = () => {
    if (item.type === 'video') {
      const youtubeId = extractYoutubeId(item.url)

      if (youtubeId) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`
        return (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full aspect-video rounded-lg"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          />
        )
      }

      if (isLocalVideo(item.url)) {
        return (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-h-[70vh] max-w-full rounded-lg"
          />
        )
      }
    }

    return (
      <img
        key={item.url}
        src={item.url}
        alt={item.caption}
        className="max-h-[70vh] max-w-full object-contain rounded-lg"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Fechar */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="h-7 w-7" />
      </button>

      {/* Contador */}
      <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {current + 1} / {items.length}
      </p>

      {/* Conteúdo */}
      <div
        className="relative w-full max-w-4xl flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>

      {/* Caption */}
      {item.caption && (
        <p className="mt-4 text-white/60 text-sm">{item.caption}</p>
      )}

      {/* Navegação */}
      {items.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </>
      )}

      {/* Miniaturas */}
      {items.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`w-12 h-8 rounded overflow-hidden border-2 transition-colors ${
                i === current ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {it.type === 'video' ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Film className="h-3 w-3 text-muted-foreground" />
                </div>
              ) : (
                <img src={it.url} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
