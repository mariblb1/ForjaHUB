import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useGames } from '@/hooks/useGames'

import forjaLogo from '@/assets/forja-logo1.png'
import { Button } from '@/components/ui/button'
import { Gamepad2, Monitor, Wifi, WifiOff } from 'lucide-react'

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
      <header className="flex items-center justify-between px-8 py-6">
        <img src={forjaLogo} alt="FORJA Game Studio" className="h-10" />
        <div className="flex items-center gap-3">
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
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">
            FORJA <span className="text-primary forja-text-glow">HUB</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            O launcher oficial da FORJA Game Studio para eventos de ativação.
          </p>
        </div>

        {/* Feature Cards */}
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

        {/* CTA */}
        <Button
          size="lg"
          className="forja-gradient text-primary-foreground font-display text-lg px-10 animate-pulse-glow"
          onClick={handleExplore}
        >
          Explorar Catálogo
        </Button>

        {/* Tabela de jogos */}
        {showCatalog && (
          <div className="w-full max-w-3xl">
            {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}
            {data && data.games.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Gênero</TableHead>
                    <TableHead>Modo</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell>{game.genres?.join(', ')}</TableCell>
                      <TableCell>{game.mode}</TableCell>
                      <TableCell>{game.launchType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
