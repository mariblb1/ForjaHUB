# FORJA Hub

> Launcher oficial da FORJA Game Studio para eventos de ativação.

O FORJA Hub é uma aplicação desktop no estilo **Steam Big Picture** — uma vitrine digital para os jogos produzidos pela FORJA, projetada para rodar em estações de eventos com suporte a múltiplos periféricos e funcionamento mesmo em condições de internet instável.

---

## Tecnologias

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [electron-builder](https://www.electron.build/) — empacotamento e distribuição

---

## Funcionalidades

- **Catálogo dinâmico** — grade de jogos com capa, título, gênero e modalidade (Single/Multiplayer)
- **Tela de detalhes** — sinopse, galeria de mídia, créditos e botão _Jogar_
- **Launcher híbrido** — abre executáveis `.exe` locais ou links web (Itch.io etc.)
- **Busca e filtros** — por nome, estúdio, gênero e número de jogadores
- **Cache offline** — dados sincronizados a partir de uma planilha Google Sheets e salvos localmente em `data.json`
- **Analytics** — registro silencioso de visualizações e tempo de sessão por jogo
- **Modo Kiosk** — tela cheia sem bordas, ideal para estações de evento
- **Multi-input** — suporte a gamepad (XInput), teclado e mouse

---

## Como rodar

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

O instalador gerado ficará na pasta `dist/`.

---

## Estrutura do projeto

```
forja-hub/
├── src/
│   ├── main/          # Processo principal do Electron
│   ├── preload/       # Scripts de preload (contextBridge)
│   └── renderer/      # Interface React
├── resources/         # Assets estáticos (ícones, etc.)
├── build/             # Configurações de empacotamento
└── electron-builder.yml
```

---

## Licença

Uso interno — FORJA Game Studio / CESAR.
