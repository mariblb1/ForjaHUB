//desenvolvedor
export interface GameCredit {
  role: string
  name: string
  logo?: string
}

//Itens da galeria
export interface GameMedia {
  type: 'image' | 'video'
  url: string
  caption?: string
}

//Jogo
export interface Game {
  id: string
  title: string
  subtitle?: string
  description: string
  genres: string[]
  tags: string[]
  mode: 'singleplayer' | 'multiplayer' | 'coop'
  maxPlayers?: number

  studio: string
  studioLogo?: string

  cover: string
  banner?: string
  StudioLogo?: string
  gallery: GameMedia[]
  credits: GameCredit[]

  launchType: 'local' | 'web'
  executablePath?: string // para jogos locais
  webUrl?: string // para jogos web

  year?: number
  featured?: boolean
  sortOrder?: number
}

//raiz do json
export interface ForjaHubData {
  version: string
  updatedAt: string
  games: Game[]
}
