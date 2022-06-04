/* RootController.js
 * Top of the view hierarchy.
 */
 
import { Dom } from "../base/Dom.js";
import { Comm } from "../base/Comm.js";
import { HeaderController } from "./HeaderController.js";
import { FooterController } from "./FooterController.js";
import { FieldController } from "../field/FieldController.js";
import { ChatController } from "../chat/ChatController.js";

export class RootController {
  static getDependencies() {
    return [HTMLElement, Dom, Comm];
  }
  constructor(element, dom, comm) {
    this.element = element;
    this.dom = dom;
    this.comm = comm;
    
    this.header = null;
    this.footer = null;
    this.field = null;
    this.chat = null;
    
    this.wsListener = this.comm.listenWebSocket((msg) => this.onWebSocketMessage(msg));
    
    this.buildUi();
  }
  
  onRemoveFromDom() {
    this.comm.unlistenWebSocket(this.wsListener);
    this.wsListener = -1;
  }
  
  buildUi() {
    this.element.innerHTML = "";
    
    this.header = this.dom.spawnController(this.element, HeaderController);
    this.header.onhome = () => this.onHome();
    this.header.onsettings = () => this.onSettings();
    
    const main = this.dom.spawn(this.element, "DIV", ["main"]);
    this.field = this.dom.spawnController(main, FieldController);
    this.chat = this.dom.spawnController(main, ChatController);
    
    this.footer = this.dom.spawnController(this.element, FooterController);
  }
  
  onHome() {
    console.log(`RootController.onHome`);
  }
  
  onSettings() {
    console.log(`RootController.onSettings`);
    this.comm.requireWebSocket().then((ws) => {//XXX TEMP
      console.log(`got websocket`, ws);
    }).catch((error) => {
      console.log(`websocket failed`, error);
    });
  }
  
  onWebSocketMessage(msg) {
    //XXX we might not need to listen to ws from here
    //console.log(`RootController.onWebSocketMessage`, msg);
  }
}
