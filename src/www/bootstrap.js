import { Injector } from "./js/base/Injector.js";
import { Dom } from "./js/base/Dom.js";
import { Comm } from "./js/base/Comm.js";
import { RootController } from "./js/root/RootController.js";

window.addEventListener("load", () => {
  const injector = new Injector(window, document);
  const dom = injector.getInstance(Dom);
  const root = dom.spawnController(document.body, RootController);
});
