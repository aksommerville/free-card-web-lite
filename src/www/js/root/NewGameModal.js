/* NewGameModal.js
 */
 
import { Dom } from "../base/Dom.js";

export class NewGameModal {
  static getDependencies() {
    return [HTMLElement, Dom, Window];
  }
  constructor(element, dom, window) {
    this.element = element;
    this.dom = dom;
    this.window = window;
    this.cb = (playerName, lobbyName, gameType, isPublic) => {};
    this.buildUi();
  }
  
  // (state) comes from SessionService, for initial values. Optional.
  setup(state, cb) {
    this.cb = cb;
    if (state) {
      if (state.playerName) {
        const nameInput = this.element.querySelector("input[name='playerName']");
        nameInput.value = state.playerName;
        nameInput.select();
        nameInput.focus();
      }
    }
  }
  
  buildUi() {
    this.element.innerHTML = "";
    const form = this.dom.spawn(this.element, "FORM", { "on-submit": e => this.onSubmit(e) });
    const table = this.dom.spawn(form, "TABLE");
    const playerNameInput = this.spawnRow(table, "playerName", "Player name");
    this.spawnRow(table, "lobbyName", "Lobby name");
    this.spawnRow(table, "gameType", "Game type", ["hearts"]); // TODO hearts will be first; add other games here
    this.spawnRow(table, "isPublic", "Visibility", "radio");
    const actions = this.dom.spawn(form, "DIV", ["actions"]);
    this.dom.spawn(actions, "INPUT", { type: "submit", value: "Join" });
    this.window.setTimeout(() => playerNameInput.focus(), 10);
  }
  
  spawnRow(table, key, label, extra) {
    const id = `ngin-${key}-${this.dom.discriminator}`;
    const tr = this.dom.spawn(table, "TR");
    const tdk = this.dom.spawn(tr, "TD", ["key"]);
    this.dom.spawn(tdk, "LABEL", { for: id }, label);
    const tdv = this.dom.spawn(tr, "TD", ["value"]);
    let input;
    
    if (extra === "radio") {
      input = this.dom.spawn(tdv, "RADIOGROUP", { id, name: key });
      this.dom.spawn(input, "INPUT", { type: "radio", value: "true", name: key, id: `${id}-true` });
      this.dom.spawn(input, "LABEL", "Public", { for: `${id}-true`, tabindex: 0, "on-keypress": e => this.onRadioKeypress(e) });
      this.dom.spawn(input, "INPUT", { type: "radio", value: "false", name: key, id: `${id}-false` });
      this.dom.spawn(input, "LABEL", "Private", { for: `${id}-false`, tabindex: 0, "on-keypress": e => this.onRadioKeypress(e) });
      
    } else if (extra instanceof Array) {
      input = this.dom.spawn(tdv, "SELECT", { id, name: key });
      for (const key of extra) {
        this.dom.spawn(input, "OPTION", { value: key }, key);
      }
      
    } else {
     input = this.dom.spawn(tdv, "INPUT", { type: "text", id, name: key });
   }
    return input;
  }
  
  onSubmit(event) {
    event.preventDefault();
    const playerName = this.element.querySelector("input[name='playerName']").value;
    const lobbyName = this.element.querySelector("input[name='lobbyName']").value;
    const gameType = this.element.querySelector("select[name='gameType']").value;
    const isPublic = this.element.querySelector("input[name='isPublic']:checked").value === "true";
    this.dom.dismissModal(this);
    this.cb(playerName, lobbyName, gameType, isPublic);
  }
  
  onRadioKeypress(event) {
    if (event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      event.target.click();
    }
  }
}
