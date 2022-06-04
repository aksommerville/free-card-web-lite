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
  
  /* Create a DOM element.
   * args is context-sensitive:
   *  - string: innerText
   *  - array: CSS class names
   *  - object: HTML attributes, or "on-EVENT":cb()
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
  
  /* Create an element under (parent) and connect to a new instance of (clazz).
   * Returns the controller instance, not the element.
   */
  spawnController(parent, clazz) {
    const element = this.createElementForControllerClass(clazz);
    const controller = this.injector.getInstance(clazz, [element]);
    element.__controller = controller;
    parent.appendChild(element);
    return controller;
  }
  
  /* Create a modal wrapper on the top, and put a new controller inside it.
   * Returns the controller instance.
   */
  presentModal(clazz) {
    const container = this.createModalContainer();
    const controller = this.spawnController(container, clazz);
    return controller;
  }
  
  dismissModal() {
    const modal = this.findTopModal();
    if (!modal) return;
    modal.remove();
    this.requireModalBlotter();
  }
  
  /* Add a passive message floating above the page.
   * For error messages and such.
   */
  addToast(message, clss, timeoutMs) {
    const container = this.requireToastContainer();
    const element = this.spawn(container, "DIV", message,
      ["toast", ...(clss || [])],
      { "on-click": () => element.remove() }
    );
    if (timeoutMs > 0) {
      this.window.setTimeout(() => {
        element.addEventListener("transitionend", () => element.remove());
        element.classList.add("transparent");
      }, timeoutMs);
    }
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
  
  findTopModal() {
    const all = Array.from(this.document.querySelectorAll("body > .modalStack > .modalAligner"));
    return all[all.length - 1];
  }
  
  createModalContainer() {
    const aligner = this.spawn(this.requireModalStack(), "DIV", ["modalAligner"]);
    const container = this.spawn(aligner, "DIV", ["modal"]);
    this.requireModalBlotter();
    return container;
  }
  
  requireModalStack() {
    let stack = this.document.querySelector(".modalStack");
    if (!stack) {
      stack = this.spawn(this.document.body, "DIV", ["modalStack"]);
    }
    return stack;
  }
  
  // Creates, restacks, deletes, whatever is needed.
  requireModalBlotter() {
    const stack = this.requireModalStack();
    let blotter = this.document.querySelector(".modalBlotter");
    const lastModal = this.findTopModal();
    if (lastModal) {
      if (!blotter) {
        blotter = this.spawn(stack, "DIV", ["modalBlotter"], { "on-click": () => this.dismissModal() });
      }
      stack.insertBefore(blotter, lastModal);
    } else {
      if (blotter) {
        blotter.remove();
      }
    }
  }
  
  requireToastContainer() {
    let element = this.document.querySelector("body > .toastContainer");
    if (!element) {
      element = this.spawn(this.document.body, "DIV", ["toastContainer"]);
    }
    return element;
  }
}

Dom.singleton = true;
