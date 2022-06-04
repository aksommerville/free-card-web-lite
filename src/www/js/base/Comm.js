/* Comm.js
 */
 
export class Comm {
  static getDependencies() {
    return [Window];
  }
  constructor(window) {
    this.window = window;
  }
}

Comm.singleton = true;
