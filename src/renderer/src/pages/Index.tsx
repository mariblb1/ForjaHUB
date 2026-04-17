import { useState, useEffect, useRef } from 'react'
import { useGames } from '@/hooks/useGames'
import { useGamepad } from '@/hooks/useGamepad'
import type { Game } from '@/../../types/game'
import forjaLogo from '@/assets/logos/forja-logo1.png'
import { Button } from '@/components/ui/button'
import { Lightbox } from '@/components/Lightbox'
import { GameModal } from '@/components/GameModal'
import { Gamepad2, Monitor, Wifi, WifiOff, Users, User, Swords, Search, Play, Globe, Loader2, Images, Download } from 'lucide-react'

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

const GameCard = ({ game, onOpenGallery, onOpenModal }: { game: Game; onOpenGallery: () => void; onOpenModal: () => void }) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')

  useEffect(() => {
    const unsubStatus = window.forjaAPI?.onGameStatus((s) => {
      if (s === 'running') setStatus('running')
      if (s === 'error') setStatus('error')
    })
    const unsubClosed = window.forjaAPI?.onGameClosed(() => setStatus('idle'))
    return () => {
      unsubStatus?.()
      unsubClosed?.()
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

  return (
    <div
      data-card
      tabIndex={0}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/60 transition-colors group relative cursor-pointer"
      onClick={onOpenModal}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onOpenModal() } }}
    >
      {/* Capa */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {game.cover ? (
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Gamepad2 className="h-10 w-10 opacity-30" />
          </div>
        )}
      </div>

      {/* Info base */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-foreground truncate">{game.title}</h3>
        {game.genres && game.genres.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">{game.genres.join(' · ')}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-primary">
          {modeIcon(game.mode)}
          <span>{modeLabel(game.mode)}</span>
        </div>
      </div>

      {/* Overlay com detalhes + botão jogar ao hover */}
      <div
        className="absolute inset-0 bg-black/90 rounded-xl flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={onOpenModal}
      >
        <h3 className="font-display font-bold text-white text-base">{game.title}</h3>
        {game.subtitle && <p className="text-primary text-xs mb-2">{game.subtitle}</p>}
        {game.description && (
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 mb-3">{game.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs mb-3">
          <span className="flex items-center gap-1 text-primary">
            {modeIcon(game.mode)}
            {modeLabel(game.mode)}
          </span>
          {game.maxPlayers && <span className="text-gray-400">até {game.maxPlayers} jogadores</span>}
          {game.year && <span className="text-gray-400">{game.year}</span>}
        </div>
        {game.studio && <p className="text-gray-500 text-xs mb-3">{game.studio}</p>}

        <div className="flex gap-2 mb-2">
          {game.gallery && game.gallery.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenGallery() }}
              className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Images className="h-3.5 w-3.5" />
              Galeria ({game.gallery.length})
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleLaunch() }}
          disabled={status === 'running'}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
            status === 'running'
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : status === 'error'
              ? 'bg-destructive/80 text-white hover:bg-destructive'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {status === 'running' ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> A jogar...</>
          ) : status === 'error' ? (
            <><Play className="h-4 w-4" /> Erro ao abrir</>
          ) : game.launchType === 'web' ? (
            <><Globe className="h-4 w-4" /> Jogar no browser</>
          ) : (
            <><Play className="h-4 w-4" /> Jogar</>
          )}
        </button>
      </div>
    </div>
  )
}

const Index = () => {
  const { data, isLoading, isFetching, refetch } = useGames()
  const [showCatalog, setShowCatalog] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const gridRef = useRef<HTMLDivElement>(null)
  const exploreRef = useRef<HTMLButtonElement>(null)
  const showCatalogRef = useRef(false)
  useGamepad()

  // Foca o botão Explorar ao arrancar para o gamepad poder interagir imediatamente
  useEffect(() => { exploreRef.current?.focus() }, [])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])
  const [search, setSearch] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [lightbox, setLightbox] = useState<{ game: Game; index: number } | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const allGenres = Array.from(new Set(data?.games.flatMap((g) => g.genres ?? []) ?? []))
  const allModes = ['singleplayer', 'multiplayer', 'coop']

  const toggleGenre = (genre: string) =>
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )

  const toggleMode = (mode: string) =>
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    )

  const filteredGames = data?.games.filter((g) => {
    const q = search.toLowerCase()
    const matchesSearch = g.title.toLowerCase().includes(q) || g.studio.toLowerCase().includes(q)
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.some((genre) => g.genres?.includes(genre))
    const matchesMode = selectedModes.length === 0 || selectedModes.includes(g.mode)
    return matchesSearch && matchesGenre && matchesMode
  }) ?? []

  // Navegação por setas
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return

      const active = document.activeElement as HTMLElement
      const tag = active?.tagName?.toLowerCase() ?? ''
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return

      // Navegação na página inicial entre botões [data-landing]
      if (!showCatalogRef.current) {
        const btns = Array.from(document.querySelectorAll<HTMLElement>('[data-landing]'))
        if (!btns.length) return
        const idx = btns.indexOf(active)
        if (idx === -1) {
          e.preventDefault()
          btns[0]?.focus()
          return
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          btns[(idx + 1) % btns.length]?.focus()
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          btns[(idx - 1 + btns.length) % btns.length]?.focus()
        }
        return
      }

      // Navegação no grid de cards
      const grid = gridRef.current
      if (!grid) return
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-card]'))
      if (!cards.length) return

      const idx = cards.indexOf(active)
      if (idx === -1) {
        // Não entra no grid se o foco está dentro do modal
        if (active?.closest('[data-modal]')) return
        e.preventDefault()
        cards[0]?.focus()
        return
      }

      const firstTop = cards[0].getBoundingClientRect().top
      const firstInRow2 = cards.findIndex(c => c.getBoundingClientRect().top > firstTop)
      const numCols = firstInRow2 === -1 ? cards.length : firstInRow2
      let next = idx
      if (e.key === 'ArrowRight') next = Math.min(idx + 1, cards.length - 1)
      else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0)
      else if (e.key === 'ArrowDown') next = Math.min(idx + numCols, cards.length - 1)
      else if (e.key === 'ArrowUp') next = Math.max(idx - numCols, 0)

      e.preventDefault()
      cards[next]?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleExplore = () => {
    showCatalogRef.current = true
    setShowCatalog(true)
    if (!data) refetch()
  }

  const handleRefreshCache = () => {
    refetch()
  }

  return (
    <div className="min-h-screen forja-gradient-bg flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-6"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <img src={forjaLogo} alt="FORJA Game Studio" className="h-10" />
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {isOnline
              ? <Wifi className="h-4 w-4 text-primary" />
              : <WifiOff className="h-4 w-4 text-destructive" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            data-landing
            onClick={() => window.forjaAPI?.exportLogs()}
            onKeyDown={(e) => { if (e.key === 'Enter') window.forjaAPI?.exportLogs() }}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-white/5"
            title="Exportar logs"
          >
            <Download className="h-4 w-4" />
          </button>
          <Button
            data-landing
            variant="outline"
            size="sm"
            className="border-border hover:border-primary hover:text-primary"
            onClick={handleRefreshCache}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRefreshCache() }}
            disabled={isFetching}
          >
            {isFetching ? 'Atualizando...' : 'Atualizar Cache'}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        {!showCatalog && (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">
                FORJA <span className="text-primary forja-text-glow">HUB</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                O launcher oficial da FORJA Game Studio para eventos de ativação.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              <FeatureCard
                icon={<Gamepad2 className="h-6 w-6" />}
                title="Multi-Input"
                description="Gamepad, teclado e mouse"
              />
              <FeatureCard
                icon={<Monitor className="h-6 w-6" />}
                title="Modo Kiosk"
                description="Fullscreen dedicado"
              />
              <FeatureCard
                icon={<WifiOff className="h-6 w-6" />}
                title="Offline First"
                description="Funciona sem internet"
              />
            </div>
          </>
        )}

        <Button
          ref={exploreRef}
          data-landing
          size="lg"
          className="forja-gradient text-primary-foreground font-display text-lg px-10 animate-pulse-glow"
          onClick={handleExplore}
          onKeyDown={(e) => { if (e.key === 'Enter') handleExplore() }}
        >
          Explorar Catálogo
        </Button>

        {/* Grid de cards */}
        {showCatalog && (
          <div className="w-full max-w-5xl space-y-4">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou estúdio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Pills de modalidade */}
            <div className="flex flex-wrap gap-2">
              {allModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => toggleMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ${
                    selectedModes.includes(mode)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/60'
                  }`}
                >
                  {modeIcon(mode as Game['mode'])}
                  {modeLabel(mode as Game['mode'])}
                </button>
              ))}
            </div>

            {/* Pills de género */}
            {allGenres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(showAllGenres ? allGenres : allGenres.slice(0, 10)).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/60'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                {allGenres.length > 10 && (
                  <button
                    onClick={() => setShowAllGenres((prev) => !prev)}
                    className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground hover:border-primary/60 transition-colors"
                  >
                    {showAllGenres ? 'ver menos' : `+${allGenres.length - 10} mais`}
                  </button>
                )}
              </div>
            )}

            {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}
            {filteredGames.length > 0 && (
              <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onOpenGallery={() => setLightbox({ game, index: 0 })}
                    onOpenModal={() => setSelectedGame(game)}
                  />
                ))}
              </div>
            )}
            {data && filteredGames.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground">Nenhum jogo encontrado.</p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        FORJA Game Studio © {new Date().getFullYear()}
      </footer>

      {/* Modal de jogo */}
      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}

      {/* Lightbox */}
      {lightbox && lightbox.game.gallery?.length > 0 && (
        <Lightbox
          items={lightbox.game.gallery}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => (
  <div className="bg-card border border-border rounded-lg p-5 text-center space-y-2 hover:border-primary/50 transition-colors">
    <div className="text-primary mx-auto w-fit">{icon}</div>
    <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
)

export default Index
