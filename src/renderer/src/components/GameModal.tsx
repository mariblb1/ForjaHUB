import { useEffect, useRef, useState } from 'react'
import type { Game } from '@/../../types/game'
import { Lightbox } from './Lightbox'
import {
  X,
  Play,
  Globe,
  Loader2,
  Images,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  User,
  Users,
  Swords,
  Clock
} from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

interface GameModalProps {
  game: Game
  onClose: () => void
}

const modeIcon = (mode: Game['mode']) => {
  if (mode === 'multiplayer') return <Users className="h-4 w-4" />
  if (mode === 'coop') return <Swords className="h-4 w-4" />
  return <User className="h-4 w-4" />
}

const modeLabel = (mode: Game['mode']) => {
  if (mode === 'multiplayer') return 'Multiplayer'
  if (mode === 'coop') return 'Co-op'
  return 'Single Player'
}

export function GameModal({ game, onClose }: GameModalProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null)

  const gallery = game.gallery ?? []
  const galleryRef = useRef<HTMLDivElement>(null)
  const playBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Defer focus para não apanhar o Enter que abriu o modal
    const t = setTimeout(() => (gallery.length > 0 ? galleryRef.current : playBtnRef.current)?.focus(), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    window.forjaAPI
      ?.getGameStats?.()
      ?.then((stats) => setTotalSeconds(stats[game.id] ?? 0))
      ?.catch(() => setTotalSeconds(0))
    window.forjaAPI?.logEvent('modal_open', game.id, game.title)

    const unsubStatus = window.forjaAPI?.onGameStatus((s) => {
      if (s === 'running') setStatus('running')
      if (s === 'error') setStatus('error')
    })
    const unsubClosed = window.forjaAPI?.onGameClosed(() => setStatus('idle'))
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }

      const onGallery = document.activeElement === galleryRef.current
      const onPlay = document.activeElement === playBtnRef.current

      if (e.key === 'ArrowLeft'  && onGallery) { e.preventDefault(); galleryPrev() }
      if (e.key === 'ArrowRight' && onGallery) { e.preventDefault(); galleryNext() }
      if (e.key === 'ArrowDown'  && onGallery) { e.preventDefault(); playBtnRef.current?.focus() }
      if (e.key === 'ArrowUp'    && onPlay)    { e.preventDefault(); galleryRef.current?.focus() }
      if (e.key === 'Enter'      && onGallery) { setLightboxOpen(true) }
      if (e.key === 'Enter'      && onPlay)    { playBtnRef.current?.click() }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      unsubStatus?.()
      unsubClosed?.()
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleLaunch = () => {
    window.forjaAPI?.logEvent('play_click', game.id, game.title)
    if (game.launchType === 'web' && game.webUrl) {
      window.forjaAPI?.launchURL(game.webUrl)
    } else if (game.launchType === 'local' && game.executablePath) {
      window.forjaAPI?.launchExe(game.executablePath, game.id, game.title)
    }
  }

  const galleryPrev = () => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)
  const galleryNext = () => setGalleryIndex((i) => (i + 1) % gallery.length)

  const currentMedia = gallery[galleryIndex]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div
          data-modal
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-start justify-between p-5 pb-0 sticky top-0 bg-card z-10 rounded-t-2xl">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">{game.title}</h2>
              {game.subtitle && <p className="text-primary text-sm">{game.subtitle}</p>}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {modeIcon(game.mode)}
                  {modeLabel(game.mode)}
                </span>
                {game.maxPlayers && <span>até {game.maxPlayers} jogadores</span>}
                {game.year && <span>{game.year}</span>}
                {game.genres?.map((g) => (
                  <span key={g} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
                {totalSeconds !== null && totalSeconds > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(totalSeconds)} jogados
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors ml-4 p-2 rounded-lg hover:bg-white/5 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Galeria */}
            <div
              ref={galleryRef}
              tabIndex={gallery.length > 0 ? 0 : -1}
              className="relative bg-muted rounded-xl overflow-hidden aspect-video group outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {gallery.length > 0 ? (
                <>
                  {currentMedia.type === 'image' ? (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.caption}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer bg-black"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <Play className="h-12 w-12 text-white/60" />
                      {currentMedia.caption && (
                        <span className="absolute bottom-3 text-white/60 text-xs">
                          {currentMedia.caption}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Navegação galeria */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          galleryPrev()
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          galleryNext()
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation()
                              setGalleryIndex(i)
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === galleryIndex ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Expandir */}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Images className="h-3 w-3" /> Expandir
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Gamepad2 className="h-10 w-10 opacity-20" />
                  <span className="text-xs">Sem galeria</span>
                </div>
              )}
            </div>

            {/* Botão Jogar */}
            <button
              ref={playBtnRef}
              onClick={handleLaunch}
              disabled={status === 'running'}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-display font-semibold transition-colors ${
                status === 'running'
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : status === 'error'
                    ? 'bg-destructive/80 text-white hover:bg-destructive'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {status === 'running' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> A jogar...
                </>
              ) : status === 'error' ? (
                <>
                  <Play className="h-5 w-5" /> Erro ao abrir
                </>
              ) : game.launchType === 'web' ? (
                <>
                  <Globe className="h-5 w-5" /> Jogar no browser
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Jogar
                </>
              )}
            </button>

            {/* Sinopse + Créditos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Sinopse */}
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
                <h3 className="font-display font-semibold text-sm text-foreground">Sinopse</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {game.description || 'Sem descrição.'}
                </p>
                {game.tags && game.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-card border border-border px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Créditos */}
              <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
                <h3 className="font-display font-semibold text-sm text-foreground">Créditos</h3>
                <div className="space-y-1.5">
                  {game.credits && game.credits.length > 0 ? (
                    game.credits.map((credit, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-muted-foreground">{credit.role}: </span>
                        <span className="text-foreground">{credit.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem créditos.</p>
                  )}
                </div>
                {game.studio && <p className="text-xs text-primary pt-1">{game.studio}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox completo */}
      {lightboxOpen && gallery.length > 0 && (
        <Lightbox
          items={gallery}
          initialIndex={galleryIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
