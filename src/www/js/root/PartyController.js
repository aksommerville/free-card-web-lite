/* PartyController.js
 * Header box that shows all the players present in the current lobby.
 * If we add direct messages or user info, this would be a good venue for it.
 */
 
import { Dom } from "../base/Dom.js";
import { SessionService } from "./SessionService.js";

export class PartyController {
  static getDependencies() {
    return [HTMLElement, Dom, SessionService];
  }
  constructor(element, dom, sessionService) {
    this.element = element;
    this.dom = dom;
    this.sessionService = sessionService;
    
    this.buildUi();
    
    this.sessionService.listen(state => this.onStateChanged(state), true);
  }
  
  onRemoveFromDom() {
    this.sessionService.unlisten(this.sessionListener);
    this.sessionListener = -1;
  }
  
  buildUi() {
    this.element.innerHTML = "";
  }
  
  populateUi(playerNames) {
    this.element.innerHTML = "";
    for (const name of playerNames) {
      this.dom.spawn(this.element, "DIV", ["playerName"], name);
    }
  }
  
  onStateChanged(state) {
    //console.log(`PartyController.onStateChanged: ${JSON.stringify(state)}`);
    this.populateUi(state.players.map(p => p.name));
  }
}
