/* GeneralInputModal.js
 * Modal controller with a prompt and text input.
 * Functionally equivalent to window.prompt().
 */
 
import { Dom } from "../base/Dom.js";

export class GeneralInputModal {
  static getDependencies() {
    return [HTMLElement, Dom];
  }
  constructor(element, dom) {
    this.element = element;
    this.dom = dom;
    
    this.cb = (text) => {};
    
    this.buildUi();
  }
  
  setup(prompt, initial, cb) {
    this.element.querySelector(".prompt").innerText = prompt;
    const input = this.element.querySelector("input[type='text']");
    input.value = initial || "";
    input.select();
    input.focus();
    this.cb = cb;
  }
  
  buildUi() {
    this.element.innerHTML = "";
    const form = this.dom.spawn(this.element, "FORM", { "on-submit": e => this.onSubmit(e) });
    this.dom.spawn(form, "DIV", ["prompt"]);
    this.dom.spawn(form, "INPUT", { type: "text" });
    const actions = this.dom.spawn(form, "DIV", ["actions"]);
    this.dom.spawn(actions, "INPUT", { type: "submit", value: "OK" });
  }
  
  onSubmit(e) {
    e.preventDefault();
    const text = this.element.querySelector("input[type='text']").value;
    this.dom.dismissModal(this);
    this.cb(text);
  }
}
