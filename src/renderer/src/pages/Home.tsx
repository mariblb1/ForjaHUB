import { useGames } from '@/hooks/useGames'

function Home() {
  const { data, isLoading, refetch } = useGames()

  return (
    <div>
      <button onClick={() => refetch()}>Explorar Catálogo</button>

      {isLoading && <p>Carregando...</p>}

      {data?.games.map((game) => (
        <div key={game.id}>
          <h3>{game.title}</h3>
          <p>{game.description}</p>
          <span>{game.genres.join(', ')}</span>
        </div>
      ))}
    </div>
  )
}
