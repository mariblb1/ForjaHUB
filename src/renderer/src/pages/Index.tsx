import { useState } from 'react'
import { useGames } from '@/hooks/useGames'
import type { Game } from '@/../../types/game'
import forjaLogo from '@/assets/logos/forja-logo1.png'
import { Button } from '@/components/ui/button'
import { Gamepad2, Monitor, Wifi, WifiOff, Users, User, Swords } from 'lucide-react'

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

const GameCard = ({ game }: { game: Game }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/60 transition-colors group relative">
    {/* Capa */}
    <div className="relative h-40 bg-muted overflow-hidden">
      {game.cover ? (
        <img
          src={game.cover}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
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

    {/* Overlay com detalhes ao hover */}
    <div className="absolute inset-0 bg-black/90 rounded-xl flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <h3 className="font-display font-bold text-white text-base">{game.title}</h3>
      {game.subtitle && (
        <p className="text-primary text-xs mb-2">{game.subtitle}</p>
      )}
      {game.description && (
        <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 mb-3">{game.description}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 text-primary">
          {modeIcon(game.mode)}
          {modeLabel(game.mode)}
        </span>
        {game.maxPlayers && (
          <span className="text-gray-400">até {game.maxPlayers} jogadores</span>
        )}
        {game.year && (
          <span className="text-gray-400">{game.year}</span>
        )}
      </div>
      {game.studio && (
        <p className="text-gray-500 text-xs mt-2">{game.studio}</p>
      )}
    </div>
  </div>
)

const Index = () => {
  const { data, isLoading, isFetching, refetch } = useGames()
  const [showCatalog, setShowCatalog] = useState(false)

  const handleExplore = () => {
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
            <Wifi className="h-4 w-4 text-primary" />
            Online
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-border hover:border-primary hover:text-primary"
            onClick={handleRefreshCache}
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
          size="lg"
          className="forja-gradient text-primary-foreground font-display text-lg px-10 animate-pulse-glow"
          onClick={handleExplore}
        >
          Explorar Catálogo
        </Button>

        {/* Grid de cards */}
        {showCatalog && (
          <div className="w-full max-w-5xl">
            {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}
            {data && data.games.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
            {data && data.games.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhum jogo encontrado.</p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        FORJA Game Studio © {new Date().getFullYear()}
      </footer>
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
