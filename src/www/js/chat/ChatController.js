/* ChatController.js
 * Responsible for the peer-to-peer chat box.
 */
 
import { Dom } from "../base/Dom.js";
import { Comm } from "../base/Comm.js";
import { SessionService } from "../root/SessionService.js";

export class ChatController {
  static getDependencies() {
    return [HTMLElement, Dom, Comm, SessionService];
  }
  constructor(element, dom, comm, sessionService) {
    this.element = element;
    this.dom = dom;
    this.comm = comm;
    this.sessionService = sessionService;
    
    this.buildUi();
    
    this.wsListener = this.comm.listenWebSocket(event => this.onWebSocket(event));
  }
  
  //TODO listen on sessionService, enable UI only when joined
  
  onRemoveFromDom() {
    this.comm.unlistenWebSocket(this.wsListener);
    this.wsListener = -1;
  }
  
  buildUi() {
    this.element.innerHTML = "";
    this.dom.spawn(this.element, "DIV", ["log"]);
    const controls = this.dom.spawn(this.element, "FORM", ["controls"], { "on-submit": (event) => this.onSubmit(event) });
    this.dom.spawn(controls, "TEXTAREA", ["text"], { name: "text", "on-keypress": (event) => this.onKeyPress(event) });
    this.dom.spawn(controls, "INPUT", { type: "submit", value: "Send" });
  }
  
  onSubmit(event) {
    event?.preventDefault();
    const textElement = this.element.querySelector(".text");
    const text = textElement.value;
    textElement.value = "";
    this.addToLog("me", text); // Server does not echo our own messages, take it on faith.
    this.comm.sendWebSocket({
      chat: true,
      message: text,
      playerId: this.sessionService.state.playerId,
      lobbyCode: this.sessionService.state.lobbyCode,
    });
  }
  
  onKeyPress(event) {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        // pass
      } else {
        event.preventDefault();
        this.onSubmit();
      }
    }
  }
  
  addToLog(speaker, text) {
    const log = this.element.querySelector(".log");
    const message = this.dom.spawn(log, "DIV", ["message"]);
    const speakerBubble = this.dom.spawn(message, "DIV", ["speaker"], speaker);
    speakerBubble.style.backgroundColor = this.colorForSpeaker(speaker);
    this.dom.spawn(message, "DIV", ["content"], text);
    log.scroll(0, log.scrollTopMax);
  }
  
  colorForSpeaker(speaker) {
    if (speaker === "me") return "#ff0";
    return [
      "#0ff",
      "#fff",
      "#f0f",
      "#a6a",
      
      "#08f",
      "#0f8",
      "#f80",
      "#8f0",
      
      "#b5f",
      "#f08",
      "#f8f",
      "#8ff",
      
      "#fcf",
      "#cff",
      "#ffc",
      "#0aa",
    ][this.speakerHash16(speaker)];
  }
  
  speakerHash16(speaker) {
    let hash = 0;
    for (let i=speaker.length; i-->0; ) hash += speaker.charCodeAt(i);
    return hash & 15;
  }
  
  onWebSocket(event) {
    if (event.chat) {
      const playerName = this.sessionService.playerNameById(event.playerId);
      this.addToLog(playerName, event.message || "");
    }
  }
}
