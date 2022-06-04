/* ConnectionController.js
 * Header widget that shows what lobby you're connected to, with controls.
 */
 
import { Dom } from "../base/Dom.js";
import { Comm } from "../base/Comm.js";
import { GeneralInputModal } from "../ui/GeneralInputModal.js";

export class ConnectionController {
  static getDependencies() {
    return [HTMLElement, Dom, Comm];
  }
  constructor(element, dom, comm) {
    this.element = element;
    this.dom = dom;
    this.comm = comm;
    
    this.connected = false;
    this.playerName = ""; // empty if not authenticated
    this.lobbyName = ""; // empty if not joined
    this.lobbyId = "";
    this.buildUi();
    this.populateUi();
    
    //this.element.addEventListener("click", (event) => this.onClick(event));
    this.wsListener = this.comm.listenWebSocket((event) => this.onWsEvent(event));
  }
  
  onRemoveFromDom() {
    this.comm.unlistenWebSocket(this.wsListener);
    this.wsListener = -1;
  }
  
  buildUi() {
    this.element.innerHTML = "";
    this.dom.spawn(this.element, "DIV", ["stateTattle"]);
    this.dom.spawn(this.element, "DIV", ["playerTattle"]);
    this.dom.spawn(this.element, "DIV", ["lobbyTattle"]);
    const actions = this.dom.spawn(this.element, "DIV", ["actions"]);
  }
  
  onConnect() {
    this.comm.requireWebSocket().catch((e) => {
      this.dom.addToast(`Failed to connect websocket: ${e}`, ["error"], 5000);
    });
  }
  
  onNew() {
    if (!this.playerName) return;
    const modal = this.dom.presentModal(GeneralInputModal);
    modal.setup("New lobby name:", "", (name) => {
      console.log(`ConnectionController: new lobby '${name}'`);//TODO
      this.comm.fetch("POST", "/create", null, null, {
        gameType: "hearts",//TODO
        playerName: this.playerName,
        isPublic: true,//TODO
        lobbyName: name,
      }).then((response) => {
        console.log(`/create ok`, response);
        this.lobbyName = name;
        this.lobbyId = response;
        this.populateUi();
      }).catch((error) => {
        console.log(`/create failed`, error);
        this.dom.addToast("Failed to create new lobby.", ["error"]);
      });
    });
  }
  
  onJoin() {
    const modal = this.dom.presentModal(GeneralInputModal);
    modal.setup("Lobby code:", "", (code) => {
      console.log(`ConnectionController: join lobby '${name}'`);//TODO
      this.comm.fetch("POST", "/join", null, null, {
        lobbyCode: code,
      }).then((response) => {
        console.log(`/join ok`, response);
        this.lobbyName = code; //TODO how do we get the pretty name?
        this.lobbyId = code;
        this.populateUi();
      }).catch((error) => {
        console.log(`/join failed`, error);
        this.dom.addToast(`Failed to join lobby '${code}'`, ["error"]);
      });
    });
  }
  
  onLeave() {
    console.log(`onLeave`);//TODO tell the server
    this.lobbyName = "";
    this.lobbyId = "";
    this.populateUi();
  }
  
  onLogin() {
    const modal = this.dom.presentModal(GeneralInputModal);
    modal.setup("Player name:", "", (name) => {
      /**
      // "Logging in" doesn't actually do anything but record the name -- we'll send player name when we join a lobby.
      this.playerName = name;
      this.populateUi();
      /**/
      this.comm.sendWebSocket({
        intent: "create",
        player: {
          name,
        },
      }).then(() => {
        console.log(`ok sent player-create`);
      }).catch(error => {
        this.dom.addToast(`Failed to log in: ${error}`, ["error"]);
      });
    });
  }
  
  onQuit() {
    this.comm.closeWebSocket();
  }
  
  onWsEvent(event) {
    console.log(`ConnectionController.onWsEvent`, event);
    if (event === "connected") {
      this.connected = true;
      this.populateUi();
      
    } else if (event === "disconnected") {
      this.connected = false;
      this.playerName = "";
      this.lobbyName = "";
      this.populateUi();
      
    } else {
      // look for "joined lobby" etc
    }
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
    if (this.connected) {
      stateTattle.classList.remove("disconnected");
      stateTattle.classList.add("connected");
      stateTattle.innerText = "~ Connected ~";
    } else {
      stateTattle.classList.add("disconnected");
      stateTattle.classList.remove("conneccted");
      stateTattle.innerText = "Disconnected";
    }
    
    const playerTattle = this.element.querySelector(".playerTattle");
    playerTattle.innerText = this.playerName;
    
    const lobbyTattle = this.element.querySelector(".lobbyTattle");
    lobbyTattle.innerText = this.lobbyName;
    
    if (!this.connected) {
      this.setActions(
        "Connect", () => this.onConnect()
      );
    } else if (!this.playerName) {
      this.setActions(
        "Quit", () => this.onQuit(),
        "Login", () => this.onLogin()
      );
    } else if (!this.lobbyName) {
      this.setActions(
        "Quit", () => this.onQuit(),
        "New", () => this.onNew(),
        "Join", () => this.onJoin()
      );
    } else {
      this.setActions(
        "Quit", () => this.onQuit(),
        "Leave", () => this.onLeave()
      );
    }
  }
}
