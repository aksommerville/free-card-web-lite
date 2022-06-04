/* FooterController.js
 */
 
import { Dom } from "../base/Dom.js";

export class FooterController {
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
    this.element.innerText = "\u00a9 2022 A Hansen &co.";
  }
}
