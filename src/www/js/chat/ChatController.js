/* ChatController.js
 * Responsible for the peer-to-peer chat box.
 */
 
import { Dom } from "../base/Dom.js";

export class ChatController {
  static getDependencies() {
    return [HTMLElement, Dom];
  }
  constructor(element, dom) {
    this.element = element;
    this.dom = dom;
    
    this.buildUi();
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
    //TODO send to server.
    // Should we wait for the server's echo before appending to our log?
    this.addToLog("me", text);
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
    //TODO assign bubble color based on speaker:
    //const r16 = () => Math.floor(Math.random()*16).toString(16);
    //speakerBubble.style.backgroundColor = `#${r16()}${r16()}${r16()}`;
    this.dom.spawn(message, "DIV", ["content"], text);
    log.scroll(0, log.scrollTopMax);
  }
}
