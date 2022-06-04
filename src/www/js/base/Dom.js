/* Dom.js
 */
 
import { Injector } from "./Injector.js";

export class Dom {
  static getDependencies() {
    return [Injector, Document, Window];
  }
  constructor(injector, document, window) {
    this.injector = injector;
    this.document = document;
    this.window = window;
    
    const observer = new MutationObserver(event => this.onMutation(event));
    observer.observe(document.body, { subtree: true, childList: true });
  }
  
  /* args is context-sensitive:
   *  - string: innerText
   *  - array: CSS class names
   *  - object: HTML attributes, or "on-NAME":cb()
   */
  spawn(parent, tagName, ...args) {
    const element = this.document.createElement(tagName);
    if (args) for (const arg of args) {
      if (typeof(arg) === "string") {
        element.innerText = arg;
      } else if (arg instanceof Array) {
        for (const clss of arg) element.classList.add(clss);
      } else if (typeof(arg) === "object") {
        for (const k of Object.keys(arg)) {
          if (k.startsWith("on-")) {
            element.addEventListener(k.substr(3), arg[k]);
          } else {
            element.setAttribute(k, arg[k]);
          }
        }
      } else {
        throw new Error(`Dom.spawn: Unexpected argument ${JSON.stringify(arg)}`);
      }
    }
    parent.appendChild(element);
    return element;
  }
  
  spawnController(parent, clazz) {
    const element = this.createElementForControllerClass(clazz);
    const controller = this.injector.getInstance(clazz, [element]);
    element.__controller = controller;
    parent.appendChild(element);
    return controller;
  }
  
  /* Remainder is, if not private, probably not interesting.
   */
  
  createElementForControllerClass(clazz) {
    const tagName = this.tagNameForControllerClass(clazz);
    if (!tagName) {
      throw new Error(`Unable to create element for class ${clazz.name}. Does it have an HTMLElement dependency?`);
    }
    const element = this.document.createElement(tagName);
    element.classList.add(clazz.name);
    return element;
  }
  
  tagNameForControllerClass(clazz) {
    for (const dclazz of clazz.getDependencies()) {
      if ((dclazz === HTMLElement) || HTMLElement.isPrototypeOf(dclazz)) {
        const name = dclazz.name.replace(/^HTML(.*)Element$/, "$1").toUpperCase();
        switch (name) {
          case "": return "DIV";
          // ...there will be other exceptions...
          default: return name;
        }
      }
    }
    return "";
  }
  
  onMutation(events) {
    for (const event of events) {
      if (event.removedNodes) for (const node of event.removedNodes) {
        if (!node.__controller) continue;
        const controller = node.__controller;
        node.__controller = null;
        controller.element = null;
        if (controller.onRemoveFromDom) {
          controller.onRemoveFromDom();
        }
      }
    }
  }
}

Dom.singleton = true;
