/* ConnectionController.js
 * Header widget that shows what lobby you're connected to, with controls.
 */
 
import { Dom } from "../base/Dom.js";
import { Comm } from "../base/Comm.js";
import { GeneralInputModal } from "../ui/GeneralInputModal.js";
import { SessionService } from "./SessionService.js";
import { NewGameModal } from "./NewGameModal.js";
import { JoinGameModal } from "./JoinGameModal.js";
import { Validation } from "./Validation.js";

export class ConnectionController {
  static getDependencies() {
    return [HTMLElement, Dom, Comm, SessionService, Validation];
  }
  constructor(element, dom, comm, sessionService, validation) {
    this.element = element;
    this.dom = dom;
    this.comm = comm;
    this.sessionService = sessionService;
    this.validation = validation;
    
    this.state = {};
    this.sessionListener = this.sessionService.listen(state => this.onSessionStateChange(state));
    this.buildUi();
    this.populateUi();
    
    //this.element.addEventListener("click", (event) => this.onClick(event));
    this.wsListener = this.comm.listenWebSocket((event) => this.onWsEvent(event));
    
    // TODO It's a problem if the socket is not pre-initialized when we create or join.
    // Server must send the first packet, and we must echo the "socketId" from that first packet.
    // That's crazy, look into changing the server's behavior there.
    // But for now, prime the WebSocket connection here, before the user starts interacting.
    this.comm.requireWebSocket();
  }
  
  onRemoveFromDom() {
    this.comm.unlistenWebSocket(this.wsListener);
    this.wsListener = -1;
    this.sessionService.unlisten(this.sessionListener);
    this.sessionListener = -1;
  }
  
  buildUi() {
    this.element.innerHTML = "";
    this.dom.spawn(this.element, "DIV", ["stateTattle"]);
    this.dom.spawn(this.element, "DIV", ["playerTattle"]);
    this.dom.spawn(this.element, "DIV", ["lobbyTattle"]);
    const actions = this.dom.spawn(this.element, "DIV", ["actions"]);
  }
  
  onNew() {
    const modal = this.dom.presentModal(NewGameModal);
    modal.setup(this.state, (playerName, lobbyName, gameType, isPublic) => {
      this.comm.fetch("POST", "/create", null, null, {
        gameType,
        playerName,
        isPublic,
        lobbyName,
      }).then((response) => {
        console.log(`/create ok`, response);
        this.sessionService.replaceState({
          gameType,
          playerName,
          isPublic,
          lobbyName,
          lobbyCode: response.code,
        });
        this.comm.sendWebSocket({
          intent: 'join',
          lobbyCode: response.code,
          player: {
            name: playerName,
          },
        }).then(() => {
        }).catch((error) => {
          console.log(`Failed to join lobby`, error);
          this.dom.addToast(`Failed to join lobby: ${error}`);
        });
      }).catch((error) => {
        console.log(`/create failed`, error);
        this.dom.addToast(`Failed to create game: ${error}`);
      });
    });
  }
  
  onJoin() {
    const modal = this.dom.presentModal(JoinGameModal);
    modal.setup(this.state, (playerName, lobbyCode) => {
      this.comm.fetch("POST", "/join", null, null, {
        lobbyCode,
      }).then((response) => {
        console.log(`/join ok`, response);
        this.sessionService.replaceState({
          lobbyCode,
          playerName,
        });
        this.comm.sendWebSocket({
          intent: 'join',
          lobbyCode,
          player: {
            name: playerName,
          },
        }).then(() => {
        }).catch((error) => {
          console.log(`Failed to join lobby`, error);
          this.dom.addToast(`Failed to join lobby: ${error}`);
        });
      }).catch((error) => {
        console.log(`/join failed`, error);
        this.dom.addToast(`Failed to join game: ${error}`);
      });
    });
  }
  
  onLeave() {
    this.comm.sendWebSocket({
      goodbye: true,
      playerId: this.state.playerId,
      lobbyCode: this.state.lobbyCode,
    }).then(() => {
    }).catch((e) => {
      console.log(`failed to exit lobby`, e);
      this.dom.addToast(`Failed to exit lobby: ${e}`);
    });
  }
  
  onQuit() {
    this.comm.closeWebSocket();
  }
  
  onWsEvent(event) {
    
    if (event === "connected") {
      this.sessionService.replaceState({
        connected: true,
      });
      
    } else if (event === "disconnected") {
      this.sessionService.replaceState({
        connected: false,
        lobbyName: "",
        lobbyCode: "",
        gameType: "",
        isPublic: false,
      });
      
    } else if (event === "See ya!") { // server's leave-room ack. I'll probably change this eventually...
      this.sessionService.replaceState({
        lobbyName: "",
        lobbyCode: "",
        gameType: "",
        isPublic: false,
        players: [],
      });
      
    } else if (event.goodbye) {
      this.sessionService.removePlayerById(event.playerId);
      
    } else if (event.intent === "join") {
      if (this.validation.validPlayer(event.player)) {
        this.sessionService.addPlayer(event.player);
      }
      
    } else {
      const changes = {};
      if (this.validation.validLobbyCode(event.lobbyCode)) changes.lobbyCode = event.lobbyCode;
      if (this.validation.validLobbyName(event.lobby?.name)) changes.lobbyName = event.lobby.name;
      if (this.validation.validLobbyIsPublic(event.lobby?.isPublic)) changes.isPublic = event.lobby.isPublic;
      if (this.validation.validPlayers(event.lobby?.players)) {
        changes.players = event.lobby.players;
        // If I'm listed in players, yoink my playerId: I think this is the only way we get it.
        const me = changes.players.find(p => p.name === this.state.playerName);
        if (me?.playerId) changes.playerId = me.playerId;
      }
      this.sessionService.replaceState(changes);
    }
  }
  
  onSessionStateChange(state) {
    this.state = {...state};
    this.populateUi();
  }
  
  setActions(...labelAndCallback) {
    const parent = this.element.querySelector(".actions");
    parent.innerHTML = "";
    for (let i=0; i<labelAndCallback.length; i+=2) {
      const label = labelAndCallback[i];
      const cb = labelAndCallback[i + 1];
      this.dom.spawn(parent, "BUTTON", label, { "on-click": cb });
    }
  }
  
  populateUi() {
  
    const stateTattle = this.element.querySelector(".stateTattle");
    if (this.state.connected) {
      stateTattle.classList.remove("disconnected");
      stateTattle.classList.add("connected");
      stateTattle.innerText = "~ Connected ~";
    } else {
      stateTattle.classList.add("disconnected");
      stateTattle.classList.remove("conneccted");
      stateTattle.innerText = "Disconnected";
    }
    
    const playerTattle = this.element.querySelector(".playerTattle");
    playerTattle.innerText = this.state.playerName || "";
    
    const lobbyTattle = this.element.querySelector(".lobbyTattle");
    if (this.state.lobbyName || this.state.lobbyCode) {
      lobbyTattle.innerText = `${this.state.lobbyName || ""} [${this.state.lobbyCode || ""}]`;
    } else {
      lobbyTattle.innerText = "";
    }
    
    if (this.state.lobbyName) {
      this.setActions(
        "Quit", () => this.onQuit(),
        "Leave", () => this.onLeave()
      );
    } else {
      this.setActions(
        "New", () => this.onNew(),
        "Join", () => this.onJoin()
      );
    }
  }
}
