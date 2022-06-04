/* FieldController.js
 * Responsible for the whole card-game UI section.
 */
 
import { Dom } from "../base/Dom.js";
import { Field } from "./Field.js";
import { FieldLayout } from "./FieldLayout.js";

export class FieldController {
  static getDependencies() {
    return [HTMLElement, Dom, FieldLayout, Window];
  }
  constructor(element, dom, fieldLayout, window) {
    this.element = element;
    this.dom = dom;
    this.fieldLayout = fieldLayout;
    this.window = window;
    
    this.field = null;
    this.elementWidth = 0;
    this.elementHeight = 0;
    this.resizeObserver = new window.ResizeObserver((event) => this.onResize(event));
    this.resizeObserver.observe(this.element);
    
    this.buildUi();
    
    this.setField(Field.generateRandom());
  }
  
  onRemoveFromDom() {
    this.resizeObserver.disconnect();
    this.resizeObserver = null;
  }
  
  buildUi() {
    this.element.innerHTML = "";
  }
  
  setField(field) {
    this.field = field;
    if (!this.element) return;
    const bounds = this.element.getBoundingClientRect();
    this.elementWidth = bounds.width;
    this.elementHeight = bounds.height;
    this.fieldLayout.buildUi(this.element, this.field);
  }
  
  onResize(events) {
    if (!this.element) return;
    let width = this.elementWidth, height = this.elementHeight;
    for (const event of events) {
      width = event.contentRect.width;
      height = event.contentRect.height;
    }
    if ((width !== this.elementWidth) || (height !== this.elementHeight)) {
      this.elementWidth = width;
      this.elementHeight = height;
      this.fieldLayout.buildUi(this.element, this.field);
    }
  }
}
