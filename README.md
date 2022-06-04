# free-card-web-lite

Alternate frontend for free-card.games, because I'm just not doing npm/TypeScript/Angular.

## Server Protocol

non-normative

```
HTTP POST /create
  serve.ts:createLobby()
  <= {
    gameType
    playerName
    isPublic
    lobbyName
  }
  => lobbyCode (plain text)
  
HTTP /join
  serve.ts:joinLobby()
  <= {
    lobbyCode
  }
  => empty, status code only
  
HTTP /ws
  ws/ws.ts:upgradeWebsocket()
  
WebSocket messages
  ws/ws-action-types.ts
  
  JoinMessage = {
    intent: 'create' | 'join',
    player: Partial<{
      name: string,
      playerId: string, // v4 UUID
      socketId: string, // v4 UUID
      prefereces?: any | null, // may become custom type in the future- something serializable to cookie/localStorage
    }>
    lobbyCode: string, // absent on request, sent by server on confirmation,
    socketId: string
  }

  WsMessage = {
    socketId: string, // should match UUID v4
    playerId: string,
    lobbyCode: string,
    infoMsg?: string, // player join/leave, lobby name change, ownership transfer, etc.
  }

  LeaveMessage = WsMessage & {
    goodbye: true,
    socketId?: string,
  }

  ServerMessage = WsMessage & {
    message: string,
    serverMsg: true,
    error?: string | Error,
  }

  ChatMessage = WsMessage & {
    message: string,
    chat: true,
  }
  
  LobbyUpdateMessage = {
    lobby: Partial<Lobby>
  } & WsMessage;

  PlayersUpdate = WsMessage & {
    players: Player[],
    spectators: Player[],
  }
```

## TODO

- [ ] Everything
- [ ] Webpack
- [ ] Communication
