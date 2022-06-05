/* JoinGameModal.js
 */
 
import { Dom } from "../base/Dom.js";

export class JoinGameModal {
  static getDependencies() {
    return [HTMLElement, Dom, Window];
  }
  constructor(element, dom, window) {
    this.element = element;
    this.dom = dom;
    this.window = window;
    this.cb = (playerName, lobbyCode) => {};
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
    this.spawnRow(table, "lobbyCode", "Lobby code");
    const actions = this.dom.spawn(form, "DIV", ["actions"]);
    this.dom.spawn(actions, "INPUT", { type: "submit", value: "Join" });
    this.window.setTimeout(() => playerNameInput.focus(), 10);
  }
  
  spawnRow(table, key, label) {
    const id = `jgin-${key}-${this.dom.discriminator}`;
    const tr = this.dom.spawn(table, "TR");
    const tdk = this.dom.spawn(tr, "TD", ["key"]);
    this.dom.spawn(tdk, "LABEL", { for: id }, label);
    const tdv = this.dom.spawn(tr, "TD", ["value"]);
    const input = this.dom.spawn(tdv, "INPUT", { type: "text", id, name: key });
    return input;
  }
  
  onSubmit(event) {
    event.preventDefault();
    const playerName = this.element.querySelector("input[name='playerName']").value;
    const lobbyCode = this.element.querySelector("input[name='lobbyCode']").value;
    this.dom.dismissModal(this);
    this.cb(playerName, lobbyCode);
  }
}
