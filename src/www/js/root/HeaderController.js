/* HeaderController.js
 */
 
import { Dom } from "../base/Dom.js";
import { ConnectionController } from "./ConnectionController.js";

export class HeaderController {
  static getDependencies() {
    return [HTMLElement, Dom];
  }
  constructor(element, dom) {
    this.element = element;
    this.dom = dom;
    
    this.onhome = () => {};
    this.onsettings = () => {};
    
    this.connectionController = null;
    
    this.buildUi();
  }
  
  buildUi() {
    this.element.innerHTML = "";
    this.dom.spawn(this.element, "BUTTON", "Home", { "on-click": () => this.onhome() });
    this.connectionController = this.dom.spawnController(this.element, ConnectionController);
    this.dom.spawn(this.element, "DIV", ["spacer"]);
    this.dom.spawn(this.element, "BUTTON", "Settings", { "on-click": () => this.onsettings() });
  }
}
