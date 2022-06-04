/* RootController.js
 * Top of the view hierarchy.
 */
 
import { Dom } from "../base/Dom.js";
import { HeaderController } from "./HeaderController.js";
import { FooterController } from "./FooterController.js";
import { FieldController } from "../field/FieldController.js";
import { ChatController } from "../chat/ChatController.js";

export class RootController {
  static getDependencies() {
    return [HTMLElement, Dom];
  }
  constructor(element, dom) {
    this.element = element;
    this.dom = dom;
    
    this.header = null;
    this.footer = null;
    this.field = null;
    this.chat = null;
    
    this.buildUi();
  }
  
  onRemoveFromDom() {
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
  }
}
