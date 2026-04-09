import { useState } from 'react'
import { useGames } from '@/hooks/useGames'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export default function Home() {
  const { data, isLoading, refetch } = useGames()
  const [showCatalog, setShowCatalog] = useState(false)

  const handleExplore = () => {
    setShowCatalog(true)
    refetch()
  }

  return (
    <div>
      {/* seu conteúdo existente... */}

      <Button onClick={handleExplore}>Explorar Catálogo</Button>

      {showCatalog && (
        <div className="w-full max-w-3xl">
          {isLoading && <p>Carregando...</p>}
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
                    <TableCell>{game.title}</TableCell>
                    <TableCell>{game.genres.join(', ')}</TableCell>
                    <TableCell>{game.mode}</TableCell>
                    <TableCell>{game.launchType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}
